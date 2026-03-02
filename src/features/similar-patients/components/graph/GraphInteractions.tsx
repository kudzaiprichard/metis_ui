'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GraphNode, SimilarPatientsGraphResponse } from '../../api/similar-patients.types';
import { GripVertical, X } from 'lucide-react';
import { NodePosition, ClusterInfo, OutcomeBoxDimensions, OutcomeBoxKey } from '../../hooks/useGraphLayout';

interface GraphInteractionsProps {
    svgRef: React.RefObject<SVGSVGElement | null>;
    viewBox: { width: number; height: number };
    zoom: number;
    nodePositions: Map<string, NodePosition>;
    setNodePositions: React.Dispatch<React.SetStateAction<Map<string, NodePosition>>>;
    clusters: ClusterInfo[];
    setClusters: React.Dispatch<React.SetStateAction<ClusterInfo[]>>;
    selectedNode: string | null;
    setSelectedNode: React.Dispatch<React.SetStateAction<string | null>>;
    graphData: SimilarPatientsGraphResponse;
    outcomeBoxDimensions?: OutcomeBoxDimensions;
    setOutcomeBoxDimensions?: React.Dispatch<React.SetStateAction<OutcomeBoxDimensions | undefined>>;
}

type DragMode = 'none' | 'node' | 'cluster' | 'outcomeBox' | 'resize' | 'pan';

export function GraphInteractions({
                                      svgRef, viewBox, zoom, nodePositions, setNodePositions,
                                      clusters, setClusters, selectedNode, setSelectedNode,
                                      graphData, outcomeBoxDimensions, setOutcomeBoxDimensions,
                                  }: GraphInteractionsProps) {
    const [dragMode, setDragMode] = useState<DragMode>('none');
    const dragStateRef = useRef<{
        nodeId?: string; clusterTreatment?: string;
        outcomeBox?: OutcomeBoxKey;
        resizeBox?: OutcomeBoxKey;
        resizeEdge?: 'left' | 'right' | 'top' | 'bottom';
        offset: { x: number; y: number };
        initialDimensions?: { x: number; y: number; width: number; height: number };
        lastMousePos?: { x: number; y: number };
    }>({ offset: { x: 0, y: 0 } });

    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);
    const [panelDragStart, setPanelDragStart] = useState({ x: 0, y: 0 });

    const getSVGCoords = useCallback((e: React.MouseEvent | MouseEvent): { x: number; y: number } | null => {
        if (!svgRef.current) return null;
        const r = svgRef.current.getBoundingClientRect();
        const sx = viewBox.width / r.width;
        const sy = viewBox.height / r.height;
        return { x: ((e.clientX - r.left) * sx - panOffset.x) / zoom, y: ((e.clientY - r.top) * sy - panOffset.y) / zoom };
    }, [svgRef, viewBox, panOffset, zoom]);

    const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.detail === 2) setSelectedNode(nodeId === selectedNode ? null : nodeId);
    }, [selectedNode, setSelectedNode]);

    const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const c = getSVGCoords(e); const p = nodePositions.get(nodeId);
        if (!c || !p) return;
        dragStateRef.current = { nodeId, offset: { x: c.x - p.x, y: c.y - p.y } };
        setDragMode('node');
    }, [getSVGCoords, nodePositions]);

    const handleClusterMouseDown = useCallback((treatment: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const c = getSVGCoords(e); const cl = clusters.find(x => x.treatment === treatment);
        if (!c || !cl) return;
        dragStateRef.current = { clusterTreatment: treatment, offset: { x: c.x - cl.centerX, y: c.y - cl.centerY } };
        setDragMode('cluster');
    }, [getSVGCoords, clusters]);

    const handleOutcomeBoxMouseDown = useCallback((box: OutcomeBoxKey, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!outcomeBoxDimensions) return;
        const c = getSVGCoords(e); if (!c) return;
        const d = outcomeBoxDimensions[box];
        dragStateRef.current = { outcomeBox: box, offset: { x: c.x - d.x, y: c.y - d.y } };
        setDragMode('outcomeBox');
    }, [getSVGCoords, outcomeBoxDimensions]);

    const handleBoxResizeStart = useCallback((box: OutcomeBoxKey, edge: 'left' | 'right' | 'top' | 'bottom', e: React.MouseEvent) => {
        e.stopPropagation();
        if (!outcomeBoxDimensions) return;
        const c = getSVGCoords(e); if (!c) return;
        dragStateRef.current = { resizeBox: box, resizeEdge: edge, offset: { x: c.x, y: c.y }, initialDimensions: { ...outcomeBoxDimensions[box] }, lastMousePos: { x: c.x, y: c.y } };
        setDragMode('resize');
    }, [getSVGCoords, outcomeBoxDimensions]);

    const getNodesInBox = useCallback((box: OutcomeBoxKey) => {
        const pid = graphData.patient_id;
        const noOutcomeFilter = (n: GraphNode) => {
            const cat = (n.data.outcome_category as string) || '';
            return (!cat || !['Success', 'Failure', 'Partial'].includes(cat)) && n.id !== pid;
        };
        switch (box) {
            case 'patients': return graphData.nodes.filter(n => n.type === 'patient' && noOutcomeFilter(n));
            case 'treatments': return graphData.nodes.filter(n => n.type === 'treatment' && noOutcomeFilter(n));
            case 'success': return graphData.nodes.filter(n => n.data.outcome_category === 'Success' && n.id !== pid);
            case 'partial': return graphData.nodes.filter(n => n.data.outcome_category === 'Partial' && n.id !== pid);
            case 'failure': return graphData.nodes.filter(n => n.data.outcome_category === 'Failure' && n.id !== pid);
        }
    }, [graphData]);

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        const c = getSVGCoords(e); if (!c) return;
        const s = dragStateRef.current;

        switch (dragMode) {
            case 'node': {
                if (!s.nodeId) return;
                setNodePositions(prev => { const m = new Map(prev); m.set(s.nodeId!, { x: c.x - s.offset.x, y: c.y - s.offset.y }); return m; });
                break;
            }
            case 'cluster': {
                if (!s.clusterTreatment) return;
                const nx = c.x - s.offset.x, ny = c.y - s.offset.y;
                const cl = clusters.find(x => x.treatment === s.clusterTreatment);
                if (!cl) return;
                const dx = nx - cl.centerX, dy = ny - cl.centerY;
                setClusters(prev => prev.map(x => x.treatment === s.clusterTreatment ? { ...x, centerX: nx, centerY: ny } : x));
                setNodePositions(prev => { const m = new Map(prev); cl.nodeIds.forEach(id => { const p = prev.get(id); if (p) m.set(id, { x: p.x + dx, y: p.y + dy }); }); return m; });
                break;
            }
            case 'outcomeBox': {
                if (!s.outcomeBox || !outcomeBoxDimensions || !setOutcomeBoxDimensions) return;
                const nx = c.x - s.offset.x, ny = c.y - s.offset.y;
                const old = outcomeBoxDimensions[s.outcomeBox];
                const dx = nx - old.x, dy = ny - old.y;
                setOutcomeBoxDimensions(prev => prev ? { ...prev, [s.outcomeBox!]: { x: nx, y: ny, width: old.width, height: old.height } } : undefined);
                const nodes = getNodesInBox(s.outcomeBox);
                setNodePositions(prev => { const m = new Map(prev); nodes.forEach(n => { const p = prev.get(n.id); if (p) m.set(n.id, { x: p.x + dx, y: p.y + dy }); }); return m; });
                break;
            }
            case 'resize': {
                if (!s.resizeBox || !s.resizeEdge || !s.initialDimensions || !outcomeBoxDimensions || !setOutcomeBoxDimensions) return;
                const dX = c.x - s.offset.x, dY = c.y - s.offset.y;
                const nd = { ...s.initialDimensions };
                if (s.resizeEdge === 'right') nd.width = Math.max(200, s.initialDimensions.width + dX);
                else if (s.resizeEdge === 'left') { const w = Math.max(200, s.initialDimensions.width - dX); if (w >= 200) { nd.width = w; nd.x = s.initialDimensions.x + dX; } }
                else if (s.resizeEdge === 'bottom') nd.height = Math.max(150, s.initialDimensions.height + dY);
                else if (s.resizeEdge === 'top') { const h = Math.max(150, s.initialDimensions.height - dY); if (h >= 150) { nd.height = h; nd.y = s.initialDimensions.y + dY; } }
                setOutcomeBoxDimensions(prev => prev ? { ...prev, [s.resizeBox!]: nd } : undefined);
                break;
            }
            case 'pan': {
                if (!svgRef.current || !s.lastMousePos) return;
                const r = svgRef.current.getBoundingClientRect();
                const sx = viewBox.width / r.width, sy = viewBox.height / r.height;
                setPanOffset(prev => ({ x: prev.x + (e.clientX - s.lastMousePos!.x) * sx, y: prev.y + (e.clientY - s.lastMousePos!.y) * sy }));
                dragStateRef.current.lastMousePos = { x: e.clientX, y: e.clientY };
                break;
            }
        }
    }, [dragMode, getSVGCoords, clusters, setClusters, setNodePositions, outcomeBoxDimensions, setOutcomeBoxDimensions, getNodesInBox, svgRef, viewBox]);

    const handleMouseUp = useCallback(() => {
        setDragMode('none');
        dragStateRef.current = { offset: { x: 0, y: 0 } };
    }, []);

    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (e.target === svgRef.current || (e.target as SVGElement).tagName === 'svg') {
            dragStateRef.current = { offset: { x: 0, y: 0 }, lastMousePos: { x: e.clientX, y: e.clientY } };
            setDragMode('pan');
        }
    }, [svgRef]);

    const handlePanelMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDraggingPanel(true);
        setPanelDragStart({ x: e.clientX - panelPosition.x, y: e.clientY - panelPosition.y });
    }, [panelPosition]);

    useEffect(() => {
        if (!isDraggingPanel) return;
        const onMove = (e: MouseEvent) => setPanelPosition({ x: e.clientX - panelDragStart.x, y: e.clientY - panelDragStart.y });
        const onUp = () => setIsDraggingPanel(false);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    }, [isDraggingPanel, panelDragStart]);

    const getCursorStyle = useCallback(() => {
        switch (dragMode) {
            case 'node': case 'cluster': case 'outcomeBox': case 'pan': return 'grabbing';
            case 'resize': { const e = dragStateRef.current.resizeEdge; return (e === 'left' || e === 'right') ? 'ew-resize' : (e === 'top' || e === 'bottom') ? 'ns-resize' : 'grab'; }
            default: return 'grab';
        }
    }, [dragMode]);

    return {
        draggedNode: dragMode === 'node' ? dragStateRef.current.nodeId || null : null,
        draggedCluster: dragMode === 'cluster' ? dragStateRef.current.clusterTreatment || null : null,
        draggedOutcomeBox: dragMode === 'outcomeBox' ? dragStateRef.current.outcomeBox || null : null,
        panOffset, isPanning: dragMode === 'pan', panelPosition, isDraggingPanel,
        resizingBox: dragMode === 'resize' ? { box: dragStateRef.current.resizeBox!, edge: dragStateRef.current.resizeEdge!, startX: 0, startY: 0, initialDimensions: dragStateRef.current.initialDimensions! } : null,
        handleNodeClick, handleNodeMouseDown, handleClusterMouseDown,
        handleOutcomeBoxMouseDown, handleBoxResizeStart, handleMouseMove,
        handleMouseUp, handleCanvasMouseDown, handlePanelMouseDown, getCursorStyle,

        renderInfoPanel: () => {
            if (!selectedNode) return null;
            const node = graphData.nodes.find(n => n.id === selectedNode);
            if (!node) return null;

            return (
                <div
                    className="absolute top-20 right-4 w-[300px] max-h-[500px] overflow-y-auto bg-[rgba(10,20,30,0.95)] border border-white/15 rounded-none backdrop-blur-xl shadow-2xl z-10"
                    style={{ transform: `translate(${panelPosition.x}px,${panelPosition.y}px)`, cursor: isDraggingPanel ? 'grabbing' : 'default' }}
                >
                    <div
                        className="flex justify-between items-center px-4 py-3 border-b border-white/10 select-none"
                        onMouseDown={handlePanelMouseDown}
                        style={{ cursor: isDraggingPanel ? 'grabbing' : 'grab' }}
                    >
                        <div className="flex items-center gap-2">
                            <GripVertical className="h-3 w-3 text-muted-foreground/30" />
                            <h4 className="text-[13px] font-semibold text-foreground">Node Details</h4>
                        </div>
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="w-6 h-6 flex items-center justify-center bg-white/[0.05] border border-white/10 rounded-none text-muted-foreground/60 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="px-4 py-3">
                        {[
                            { label: 'ID', value: node.id },
                            { label: 'Type', value: node.type },
                            { label: 'Label', value: node.label },
                            ...Object.entries(node.data).map(([k, v]) => ({ label: k, value: String(v) })),
                        ].map((row) => (
                            <div key={row.label} className="flex justify-between items-start py-2 border-b border-white/[0.05] last:border-b-0 gap-3">
                                <span className="text-[11px] text-muted-foreground/50 font-medium capitalize flex-shrink-0">{row.label}:</span>
                                <span className="text-[11px] text-foreground/90 font-semibold text-right break-words">{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
    };
}