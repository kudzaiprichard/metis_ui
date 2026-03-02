'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
    forceCollide,
    forceX,
    forceY,
    SimulationNodeDatum,
    SimulationLinkDatum,
} from 'd3-force';
import { stratify, tree } from 'd3-hierarchy';
import { SimilarPatientsGraphResponse, GraphNode } from '../../api/similar-patients.types';

// ============================================================================
// Types
// ============================================================================

export interface NodePosition { x: number; y: number; }
export interface ClusterInfo { treatment: string; centerX: number; centerY: number; nodeIds: string[]; color: string; radius: number; }
export type OutcomeBoxKey = 'patients' | 'treatments' | 'success' | 'partial' | 'failure';

export interface OutcomeBoxDimensions {
    patients: { x: number; y: number; width: number; height: number };
    treatments: { x: number; y: number; width: number; height: number };
    success: { x: number; y: number; width: number; height: number };
    partial: { x: number; y: number; width: number; height: number };
    failure: { x: number; y: number; width: number; height: number };
}

export type LayoutType = 'force' | 'hierarchical' | 'cluster' | 'outcome';

interface SimNode extends SimulationNodeDatum {
    id: string;
    group?: string;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
    source: string | SimNode;
    target: string | SimNode;
}

const CLUSTER_PALETTE = [
    '#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6',
    '#ef4444', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
    '#e879f9', '#06b6d4', '#a855f7', '#eab308', '#22d3ee',
];

/** Vertical padding above and below the content bounding box */
const VERTICAL_PADDING = 60;

// ============================================================================
// Helpers — measure bounding box and re-center positions
// ============================================================================

/**
 * Given a set of node positions, compute the bounding box considering node
 * radius, then translate all positions so the content is vertically centered
 * within the viewBox and return the tight calculated height.
 */
function centerAndFitPositions(
    pos: Map<string, NodePosition>,
    viewBoxWidth: number,
    nodeRadius = 25,
): { positions: Map<string, NodePosition>; height: number } {
    if (pos.size === 0) return { positions: pos, height: 400 };

    let minY = Infinity, maxY = -Infinity;
    let minX = Infinity, maxX = -Infinity;
    pos.forEach(p => {
        if (p.y - nodeRadius < minY) minY = p.y - nodeRadius;
        if (p.y + nodeRadius > maxY) maxY = p.y + nodeRadius;
        if (p.x - nodeRadius < minX) minX = p.x - nodeRadius;
        if (p.x + nodeRadius > maxX) maxX = p.x + nodeRadius;
    });

    // Add label space below nodes
    maxY += 20;

    const contentHeight = maxY - minY;
    const totalHeight = contentHeight + VERTICAL_PADDING * 2;

    // Shift all nodes so content starts at VERTICAL_PADDING from top
    const dy = VERTICAL_PADDING - minY;

    // Horizontal: center content in viewBox
    const contentCx = (minX + maxX) / 2;
    const dx = viewBoxWidth / 2 - contentCx;

    const centered = new Map<string, NodePosition>();
    pos.forEach((p, id) => {
        centered.set(id, { x: p.x + dx, y: p.y + dy });
    });

    return { positions: centered, height: totalHeight };
}

// ============================================================================
// Hook
// ============================================================================

export function useGraphLayout(
    graphData: SimilarPatientsGraphResponse,
    layout: LayoutType,
    viewBox: { width: number; height: number },
) {
    const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
    const [clusters, setClusters] = useState<ClusterInfo[]>([]);
    const [outcomeBoxDimensions, setOutcomeBoxDimensions] = useState<OutcomeBoxDimensions | undefined>();
    const [calculatedHeight, setCalculatedHeight] = useState(600);
    const simulationRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);

    const pid = graphData.patient_id;
    const cx = viewBox.width / 2;

    // ── helpers ──────────────────────────────────────────────────────────

    const groupNodesByTreatment = useMemo(() => {
        const g: Record<string, string[]> = {};
        graphData.nodes.forEach(n => {
            const dc = (n.data.drug_class as string) || 'Patients & Outcomes';
            if (!g[dc]) g[dc] = [];
            g[dc].push(n.id);
        });
        return g;
    }, [graphData.nodes]);

    const clusterColorMap = useMemo(() => {
        const map: Record<string, string> = {};
        const keys = Object.keys(groupNodesByTreatment);
        keys.forEach((k, i) => {
            map[k] = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length];
        });
        return map;
    }, [groupNodesByTreatment]);

    // ── static calculated height for cluster / outcome ──────────────────

    const staticHeight = useMemo(() => {
        if (layout === 'cluster') {
            const rows = Math.ceil(Math.sqrt(Object.keys(groupNodesByTreatment).length));
            return Math.max(600, 200 + rows * 350);
        }
        return 600;
    }, [layout, groupNodesByTreatment]);

    // ── outcome box dimensions ──────────────────────────────────────────

    function calcOutcomeBoxDimensions(): OutcomeBoxDimensions {
        const baseSize = 250;
        const gap = 30;

        const getBoxSize = (nodeCount: number) => {
            if (nodeCount <= 3) return baseSize;
            const extraRows = Math.ceil(nodeCount / 3) - 1;
            return baseSize + extraRows * 50;
        };

        const noOutcomeNodes = graphData.nodes.filter(n => {
            const c = (n.data.outcome_category as string) || '';
            return !c || !['Success', 'Failure', 'Partial'].includes(c);
        });
        const patCount = noOutcomeNodes.filter(n => n.type === 'patient').length;
        const treatCount = noOutcomeNodes.filter(n => n.type === 'treatment').length;
        const successCount = graphData.nodes.filter(n => n.data.outcome_category === 'Success').length;
        const partialCount = graphData.nodes.filter(n => n.data.outcome_category === 'Partial').length;
        const failureCount = graphData.nodes.filter(n => n.data.outcome_category === 'Failure').length;

        const hasPat = patCount > 0;
        const hasTreat = treatCount > 0;

        const patSize = getBoxSize(patCount);
        const treatSize = getBoxSize(treatCount);
        const sSize = getBoxSize(successCount);
        const pSize = getBoxSize(partialCount);
        const fSize = getBoxSize(failureCount);

        const row1Count = (hasPat ? 1 : 0) + (hasTreat ? 1 : 0);
        const row1W = (hasPat ? patSize : 0) + (hasTreat ? treatSize : 0) + (row1Count > 1 ? gap : 0);
        const row1H = Math.max(hasPat ? patSize : 0, hasTreat ? treatSize : 0);

        const row1Y = 60;

        let patDim = { x: 0, y: row1Y, width: patSize, height: 0 };
        let treatDim = { x: 0, y: row1Y, width: treatSize, height: 0 };

        if (hasPat && hasTreat) {
            const row1StartX = cx - row1W / 2;
            patDim = { x: row1StartX, y: row1Y, width: patSize, height: patSize };
            treatDim = { x: row1StartX + patSize + gap, y: row1Y, width: treatSize, height: treatSize };
        } else if (hasPat) {
            patDim = { x: cx - patSize / 2, y: row1Y, width: patSize, height: patSize };
        } else if (hasTreat) {
            treatDim = { x: cx - treatSize / 2, y: row1Y, width: treatSize, height: treatSize };
        }

        const row2Y = row1Y + row1H + (row1H > 0 ? gap : 0);
        const row2W = sSize + pSize + fSize + gap * 2;
        const row2StartX = cx - row2W / 2;

        return {
            patients: patDim,
            treatments: treatDim,
            success: { x: row2StartX, y: row2Y, width: sSize, height: sSize },
            partial: { x: row2StartX + sSize + gap, y: row2Y, width: pSize, height: pSize },
            failure: { x: row2StartX + sSize + pSize + gap * 2, y: row2Y, width: fSize, height: fSize },
        };
    }

    // ── layout calculators ──────────────────────────────────────────────

    function computeForceLayout(): Map<string, NodePosition> {
        simulationRef.current?.stop();

        const tempCy = 400; // arbitrary center — will be re-centered after

        const nodes: SimNode[] = graphData.nodes.map(n => ({
            id: n.id,
            x: cx + (Math.random() - 0.5) * 100,
            y: tempCy + (Math.random() - 0.5) * 100,
            group: (n.data.drug_class as string) || 'Patients & Outcomes',
        }));

        const nodeIdSet = new Set(graphData.nodes.map(n => n.id));
        const links: SimLink[] = graphData.edges
            .filter(e => nodeIdSet.has(e.source) && nodeIdSet.has(e.target))
            .map(e => ({ source: e.source, target: e.target }));

        const sim = forceSimulation<SimNode>(nodes)
            .force('link', forceLink<SimNode, SimLink>(links).id(d => d.id).distance(120).strength(0.4))
            .force('charge', forceManyBody().strength(-300))
            .force('center', forceCenter(cx, tempCy))
            .force('collide', forceCollide<SimNode>().radius(40).strength(0.7))
            .force('x', forceX(cx).strength(0.05))
            .force('y', forceY(tempCy).strength(0.05))
            .stop();

        for (let i = 0; i < 300; i++) sim.tick();
        simulationRef.current = sim;

        const pos = new Map<string, NodePosition>();
        nodes.forEach(n => pos.set(n.id, { x: n.x!, y: n.y! }));
        return pos;
    }

    function computeHierarchicalLayout(): Map<string, NodePosition> {
        const pos = new Map<string, NodePosition>();
        const w = viewBox.width;

        const treatmentNodes = graphData.nodes.filter(n => n.type === 'treatment');
        const otherNodes = graphData.nodes.filter(n => n.type !== 'treatment');
        const displayNodes = graphData.nodes;

        if (treatmentNodes.length === 0) {
            const npr = Math.min(5, Math.ceil(Math.sqrt(displayNodes.length)));
            displayNodes.forEach((n, i) => {
                const row = Math.floor(i / npr);
                const col = i % npr;
                const nicr = Math.min(npr, displayNodes.length - row * npr);
                const rw = (nicr - 1) * 180;
                pos.set(n.id, { x: cx - rw / 2 + col * 180, y: 100 + row * 180 });
            });
            return pos;
        }

        const VIRTUAL_ROOT = '__virtual_root__';
        const hierarchyData: { id: string; parentId: string | null }[] = [
            { id: VIRTUAL_ROOT, parentId: null },
        ];

        treatmentNodes.forEach(t => {
            hierarchyData.push({ id: t.id, parentId: VIRTUAL_ROOT });
        });

        const assignedIds = new Set<string>([VIRTUAL_ROOT, ...treatmentNodes.map(t => t.id)]);
        otherNodes.forEach(n => {
            const edge = graphData.edges.find(
                e => (e.target === n.id && treatmentNodes.some(t => t.id === e.source)) ||
                    (e.source === n.id && treatmentNodes.some(t => t.id === e.target))
            );
            const parentId = edge
                ? (treatmentNodes.some(t => t.id === edge.source) ? edge.source : edge.target)
                : treatmentNodes[0].id;
            hierarchyData.push({ id: n.id, parentId });
            assignedIds.add(n.id);
        });

        try {
            const root = stratify<{ id: string; parentId: string | null }>()
                .id(d => d.id)
                .parentId(d => d.parentId)(hierarchyData);

            // Use a compact tree height — will be re-centered after
            const treeH = Math.max(400, root.height * 180);
            const treeLayout = tree<{ id: string; parentId: string | null }>()
                .size([w - 200, treeH])
                .separation((a, b) => a.parent === b.parent ? 1.5 : 2);

            treeLayout(root);

            root.each(node => {
                if (node.data.id === VIRTUAL_ROOT) return;
                pos.set(node.data.id, {
                    x: (node.x ?? 0) + 100,
                    y: (node.y ?? 0) + 50,
                });
            });
        } catch {
            const npr = Math.min(5, Math.ceil(Math.sqrt(displayNodes.length)));
            displayNodes.forEach((n, i) => {
                const row = Math.floor(i / npr);
                const col = i % npr;
                const nicr = Math.min(npr, displayNodes.length - row * npr);
                const rw = (nicr - 1) * 180;
                pos.set(n.id, { x: cx - rw / 2 + col * 180, y: 100 + row * 180 });
            });
        }

        return pos;
    }

    function computeClusterLayout(): { positions: Map<string, NodePosition>; clusters: ClusterInfo[] } {
        const pos = new Map<string, NodePosition>();
        const newClusters: ClusterInfo[] = [];
        const treatments = Object.keys(groupNodesByTreatment);

        const getClusterRadius = (nodeCount: number) => {
            if (nodeCount <= 3) return 120;
            const extraRows = Math.ceil(nodeCount / 3) - 1;
            return 120 + extraRows * 30;
        };

        const anchorX = cx;
        const dist = 250;
        const radii = treatments.map(t => getClusterRadius(groupNodesByTreatment[t].length));
        const maxRadius = Math.max(...radii, 120);
        const anchorY = dist + maxRadius + 60;

        treatments.forEach((t, i) => {
            const angle = (i / treatments.length) * Math.PI * 2 - Math.PI / 2;
            const nodeIds = groupNodesByTreatment[t];
            const radius = getClusterRadius(nodeIds.length);
            const clusterCx = anchorX + Math.cos(angle) * dist;
            const clusterCy = anchorY + Math.sin(angle) * dist;

            newClusters.push({
                treatment: t,
                centerX: clusterCx,
                centerY: clusterCy,
                nodeIds,
                color: clusterColorMap[t] || CLUSTER_PALETTE[i % CLUSTER_PALETTE.length],
                radius,
            });

            const clusterNodes: SimNode[] = nodeIds.map(id => ({
                id,
                x: clusterCx + (Math.random() - 0.5) * 60,
                y: clusterCy + (Math.random() - 0.5) * 60,
            }));

            const clusterSim = forceSimulation<SimNode>(clusterNodes)
                .force('center', forceCenter(clusterCx, clusterCy))
                .force('collide', forceCollide<SimNode>().radius(30).strength(0.8))
                .force('charge', forceManyBody().strength(-50))
                .force('x', forceX(clusterCx).strength(0.3))
                .force('y', forceY(clusterCy).strength(0.3))
                .stop();

            for (let i = 0; i < 100; i++) clusterSim.tick();
            clusterNodes.forEach(n => pos.set(n.id, { x: n.x!, y: n.y! }));
        });

        return { positions: pos, clusters: newClusters };
    }

    function computeOutcomeLayout(boxes: ReturnType<typeof calcOutcomeBoxDimensions>): Map<string, NodePosition> {
        const pos = new Map<string, NodePosition>();

        const placeNodesInBox = (
            nodes: GraphNode[],
            box: { x: number; y: number; width: number; height: number },
        ) => {
            if (nodes.length === 0 || box.height === 0) return;

            const bCx = box.x + box.width / 2;
            const bCy = box.y + box.height / 2;

            const simNodes: SimNode[] = nodes.map(n => ({
                id: n.id,
                x: bCx + (Math.random() - 0.5) * 60,
                y: bCy + (Math.random() - 0.5) * 60,
            }));

            const sim = forceSimulation<SimNode>(simNodes)
                .force('center', forceCenter(bCx, bCy))
                .force('collide', forceCollide<SimNode>().radius(30).strength(0.8))
                .force('charge', forceManyBody().strength(-50))
                .force('x', forceX(bCx).strength(0.3))
                .force('y', forceY(bCy).strength(0.3))
                .stop();

            for (let i = 0; i < 100; i++) sim.tick();

            simNodes.forEach(n => {
                pos.set(n.id, { x: n.x!, y: n.y! });
            });
        };

        const noOutcomeNodes = graphData.nodes.filter(n => {
            const c = (n.data.outcome_category as string) || '';
            return !c || !['Success', 'Failure', 'Partial'].includes(c);
        });
        const patientNodes = noOutcomeNodes.filter(n => n.type === 'patient');
        const treatmentNodes = noOutcomeNodes.filter(n => n.type === 'treatment');

        const successNodes = graphData.nodes.filter(n => n.data.outcome_category === 'Success');
        const partialNodes = graphData.nodes.filter(n => n.data.outcome_category === 'Partial');
        const failureNodes = graphData.nodes.filter(n => n.data.outcome_category === 'Failure');

        placeNodesInBox(patientNodes, boxes.patients);
        placeNodesInBox(treatmentNodes, boxes.treatments);
        placeNodesInBox(successNodes, boxes.success);
        placeNodesInBox(partialNodes, boxes.partial);
        placeNodesInBox(failureNodes, boxes.failure);

        return pos;
    }

    // ── main effect ─────────────────────────────────────────────────────

    useEffect(() => {
        let boxes: OutcomeBoxDimensions | undefined;

        if (layout === 'outcome') {
            boxes = calcOutcomeBoxDimensions();
            setOutcomeBoxDimensions(boxes);
        }

        switch (layout) {
            case 'force': {
                const raw = computeForceLayout();
                const { positions, height } = centerAndFitPositions(raw, viewBox.width);
                setNodePositions(positions);
                setCalculatedHeight(height);
                setClusters([]);
                break;
            }
            case 'hierarchical': {
                const raw = computeHierarchicalLayout();
                const { positions, height } = centerAndFitPositions(raw, viewBox.width);
                setNodePositions(positions);
                setCalculatedHeight(height);
                setClusters([]);
                break;
            }
            case 'cluster': {
                const result = computeClusterLayout();
                setNodePositions(result.positions);
                setClusters(result.clusters);
                setCalculatedHeight(staticHeight);
                break;
            }
            case 'outcome': {
                if (boxes) setNodePositions(computeOutcomeLayout(boxes));
                setClusters([]);
                setCalculatedHeight(600);
                break;
            }
        }

        return () => {
            simulationRef.current?.stop();
        };
    }, [graphData.nodes, layout, viewBox]);

    useEffect(() => {
        return () => { simulationRef.current?.stop(); };
    }, []);

    return {
        nodePositions,
        setNodePositions,
        clusters,
        setClusters,
        outcomeBoxDimensions,
        setOutcomeBoxDimensions,
        calculatedHeight,
    };
}