/**
 * GraphInteractions Component (Fixed - No Auto-Redistribution During Resize)
 * Double-click to open node details, smooth dragging with proper TypeScript types
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { GraphNode } from '../../api/similar-patients.types';

interface NodePosition {
    x: number;
    y: number;
}

interface ClusterInfo {
    treatment: string;
    centerX: number;
    centerY: number;
    nodeIds: string[];
    color: string;
}

interface OutcomeBoxDimensions {
    success: { x: number; y: number; width: number; height: number };
    partial: { x: number; y: number; width: number; height: number };
    failure: { x: number; y: number; width: number; height: number };
    noOutcome: { x: number; y: number; width: number; height: number };
}

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
    graphData: { nodes: GraphNode[]; patient_id: string };
    outcomeBoxDimensions?: OutcomeBoxDimensions;
    setOutcomeBoxDimensions?: React.Dispatch<React.SetStateAction<OutcomeBoxDimensions | undefined>>;
}

type DragMode = 'none' | 'node' | 'cluster' | 'outcomeBox' | 'resize' | 'pan';

export function GraphInteractions({
                                      svgRef,
                                      viewBox,
                                      zoom,
                                      nodePositions,
                                      setNodePositions,
                                      clusters,
                                      setClusters,
                                      selectedNode,
                                      setSelectedNode,
                                      graphData,
                                      outcomeBoxDimensions,
                                      setOutcomeBoxDimensions
                                  }: GraphInteractionsProps) {
    // Unified drag state
    const [dragMode, setDragMode] = useState<DragMode>('none');
    const dragStateRef = useRef<{
        nodeId?: string;
        clusterTreatment?: string;
        outcomeBox?: 'success' | 'partial' | 'failure' | 'noOutcome';
        resizeBox?: 'success' | 'partial' | 'failure' | 'noOutcome';
        resizeEdge?: 'left' | 'right' | 'top' | 'bottom';
        offset: { x: number; y: number };
        initialDimensions?: { x: number; y: number; width: number; height: number };
        lastMousePos?: { x: number; y: number };
    }>({ offset: { x: 0, y: 0 } });

    // Canvas panning state
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    // Panel dragging state
    const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);
    const [panelDragStart, setPanelDragStart] = useState({ x: 0, y: 0 });

    // Get SVG coordinates from mouse event
    const getSVGCoords = useCallback((e: React.MouseEvent | MouseEvent): { x: number; y: number } | null => {
        if (!svgRef.current) return null;

        const svgRect = svgRef.current.getBoundingClientRect();
        const scaleX = viewBox.width / svgRect.width;
        const scaleY = viewBox.height / svgRect.height;

        const x = ((e.clientX - svgRect.left) * scaleX - panOffset.x) / zoom;
        const y = ((e.clientY - svgRect.top) * scaleY - panOffset.y) / zoom;

        return { x, y };
    }, [svgRef, viewBox, panOffset, zoom]);

    // Node double-click handler (opens info panel)
    const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Check for double-click
        if (e.detail === 2) {
            setSelectedNode(nodeId === selectedNode ? null : nodeId);
        }
    }, [selectedNode, setSelectedNode]);

    // Node drag start
    const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        const coords = getSVGCoords(e);
        if (!coords) return;

        const nodePos = nodePositions.get(nodeId);
        if (!nodePos) return;

        dragStateRef.current = {
            nodeId,
            offset: {
                x: coords.x - nodePos.x,
                y: coords.y - nodePos.y
            }
        };
        setDragMode('node');
    }, [getSVGCoords, nodePositions]);

    // Cluster drag start
    const handleClusterMouseDown = useCallback((treatment: string, e: React.MouseEvent) => {
        e.stopPropagation();

        const coords = getSVGCoords(e);
        if (!coords) return;

        const cluster = clusters.find(c => c.treatment === treatment);
        if (!cluster) return;

        dragStateRef.current = {
            clusterTreatment: treatment,
            offset: {
                x: coords.x - cluster.centerX,
                y: coords.y - cluster.centerY
            }
        };
        setDragMode('cluster');
    }, [getSVGCoords, clusters]);

    // Outcome box drag start
    const handleOutcomeBoxMouseDown = useCallback((
        box: 'success' | 'partial' | 'failure' | 'noOutcome',
        e: React.MouseEvent
    ) => {
        e.stopPropagation();

        if (!outcomeBoxDimensions) return;

        const coords = getSVGCoords(e);
        if (!coords) return;

        const boxDim = outcomeBoxDimensions[box];

        dragStateRef.current = {
            outcomeBox: box,
            offset: {
                x: coords.x - boxDim.x,
                y: coords.y - boxDim.y
            }
        };
        setDragMode('outcomeBox');
    }, [getSVGCoords, outcomeBoxDimensions]);

    // Box resize start
    const handleBoxResizeStart = useCallback((
        box: 'success' | 'partial' | 'failure' | 'noOutcome',
        edge: 'left' | 'right' | 'top' | 'bottom',
        e: React.MouseEvent
    ) => {
        e.stopPropagation();

        if (!outcomeBoxDimensions) return;

        const coords = getSVGCoords(e);
        if (!coords) return;

        dragStateRef.current = {
            resizeBox: box,
            resizeEdge: edge,
            offset: { x: coords.x, y: coords.y },
            initialDimensions: { ...outcomeBoxDimensions[box] },
            lastMousePos: { x: coords.x, y: coords.y }
        };
        setDragMode('resize');
    }, [getSVGCoords, outcomeBoxDimensions]);

    // Get nodes in a specific outcome box
    const getNodesInBox = useCallback((box: 'success' | 'partial' | 'failure' | 'noOutcome') => {
        switch (box) {
            case 'success':
                return graphData.nodes.filter(n =>
                    n.data.outcome_category === 'Success' && n.id !== graphData.patient_id
                );
            case 'partial':
                return graphData.nodes.filter(n =>
                    n.data.outcome_category === 'Partial' && n.id !== graphData.patient_id
                );
            case 'failure':
                return graphData.nodes.filter(n =>
                    n.data.outcome_category === 'Failure' && n.id !== graphData.patient_id
                );
            case 'noOutcome':
                return graphData.nodes.filter(n => {
                    const cat = (n.data.outcome_category as string) || '';
                    return (!cat || (cat !== 'Success' && cat !== 'Failure' && cat !== 'Partial'))
                        && n.id !== graphData.patient_id;
                });
        }
    }, [graphData]);

    // Redistribute nodes within a box
    const redistributeNodesInBox = useCallback((
        box: 'success' | 'partial' | 'failure' | 'noOutcome',
        dimensions: { x: number; y: number; width: number; height: number }
    ) => {
        const nodesInBox = getNodesInBox(box);
        if (nodesInBox.length === 0) return;

        const horizontalSpacing = 80;
        const verticalSpacing = 100;

        const nodesPerColumn = Math.ceil(Math.sqrt(nodesInBox.length));
        const totalCols = Math.ceil(nodesInBox.length / nodesPerColumn);

        const boxCenterX = dimensions.x + dimensions.width / 2;
        const boxCenterY = dimensions.y + dimensions.height / 2;

        const startX = boxCenterX - ((totalCols - 1) * horizontalSpacing / 2);
        const startY = boxCenterY - ((nodesPerColumn - 1) * verticalSpacing / 2);

        setNodePositions(prev => {
            const newPositions = new Map(prev);
            nodesInBox.forEach((node, index) => {
                const col = Math.floor(index / nodesPerColumn);
                const row = index % nodesPerColumn;
                newPositions.set(node.id, {
                    x: startX + (col * horizontalSpacing),
                    y: startY + (row * verticalSpacing)
                });
            });
            return newPositions;
        });
    }, [getNodesInBox, setNodePositions]);

    // Mouse move handler
    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        const coords = getSVGCoords(e);
        if (!coords) return;

        const state = dragStateRef.current;

        switch (dragMode) {
            case 'node': {
                if (!state.nodeId) return;
                const x = coords.x - state.offset.x;
                const y = coords.y - state.offset.y;

                setNodePositions(prev => {
                    const newPositions = new Map(prev);
                    newPositions.set(state.nodeId!, { x, y });
                    return newPositions;
                });
                break;
            }

            case 'cluster': {
                if (!state.clusterTreatment) return;

                const newCenterX = coords.x - state.offset.x;
                const newCenterY = coords.y - state.offset.y;

                const cluster = clusters.find(c => c.treatment === state.clusterTreatment);
                if (!cluster) return;

                const dx = newCenterX - cluster.centerX;
                const dy = newCenterY - cluster.centerY;

                setClusters(prev =>
                    prev.map(c =>
                        c.treatment === state.clusterTreatment
                            ? { ...c, centerX: newCenterX, centerY: newCenterY }
                            : c
                    )
                );

                setNodePositions(prev => {
                    const newPositions = new Map(prev);
                    cluster.nodeIds.forEach(nodeId => {
                        const pos = prev.get(nodeId);
                        if (pos) {
                            newPositions.set(nodeId, {
                                x: pos.x + dx,
                                y: pos.y + dy
                            });
                        }
                    });
                    return newPositions;
                });
                break;
            }

            case 'outcomeBox': {
                if (!state.outcomeBox || !outcomeBoxDimensions || !setOutcomeBoxDimensions) return;

                const newX = coords.x - state.offset.x;
                const newY = coords.y - state.offset.y;

                const oldBox = outcomeBoxDimensions[state.outcomeBox];
                const dx = newX - oldBox.x;
                const dy = newY - oldBox.y;

                setOutcomeBoxDimensions(prev => {
                    if (!prev) return undefined;
                    return {
                        success: prev.success,
                        partial: prev.partial,
                        failure: prev.failure,
                        noOutcome: prev.noOutcome,
                        [state.outcomeBox!]: {
                            x: newX,
                            y: newY,
                            width: oldBox.width,
                            height: oldBox.height
                        }
                    };
                });

                const nodesInBox = getNodesInBox(state.outcomeBox);
                setNodePositions(prev => {
                    const newPositions = new Map(prev);
                    nodesInBox.forEach(node => {
                        const pos = prev.get(node.id);
                        if (pos) {
                            newPositions.set(node.id, {
                                x: pos.x + dx,
                                y: pos.y + dy
                            });
                        }
                    });
                    return newPositions;
                });
                break;
            }

            case 'resize': {
                if (!state.resizeBox || !state.resizeEdge || !state.initialDimensions ||
                    !outcomeBoxDimensions || !setOutcomeBoxDimensions) return;

                const deltaX = coords.x - state.offset.x;
                const deltaY = coords.y - state.offset.y;

                const newDimensions = { ...state.initialDimensions };

                switch (state.resizeEdge) {
                    case 'right':
                        newDimensions.width = Math.max(200, state.initialDimensions.width + deltaX);
                        break;
                    case 'left':
                        const newWidthLeft = Math.max(200, state.initialDimensions.width - deltaX);
                        if (newWidthLeft >= 200) {
                            newDimensions.width = newWidthLeft;
                            newDimensions.x = state.initialDimensions.x + deltaX;
                        }
                        break;
                    case 'bottom':
                        newDimensions.height = Math.max(150, state.initialDimensions.height + deltaY);
                        break;
                    case 'top':
                        const newHeightTop = Math.max(150, state.initialDimensions.height - deltaY);
                        if (newHeightTop >= 150) {
                            newDimensions.height = newHeightTop;
                            newDimensions.y = state.initialDimensions.y + deltaY;
                        }
                        break;
                }

                // ONLY update box dimensions - DO NOT touch node positions at all
                setOutcomeBoxDimensions(prev => {
                    if (!prev) return undefined;
                    return {
                        success: prev.success,
                        partial: prev.partial,
                        failure: prev.failure,
                        noOutcome: prev.noOutcome,
                        [state.resizeBox!]: newDimensions
                    };
                });

                // CRITICAL: No node position updates during resize - nodes stay frozen
                break;
            }

            case 'pan': {
                if (!svgRef.current || !state.lastMousePos) return;

                const svgRect = svgRef.current.getBoundingClientRect();
                const scaleX = viewBox.width / svgRect.width;
                const scaleY = viewBox.height / svgRect.height;

                const dx = (e.clientX - state.lastMousePos.x) * scaleX;
                const dy = (e.clientY - state.lastMousePos.y) * scaleY;

                setPanOffset(prev => ({
                    x: prev.x + dx,
                    y: prev.y + dy
                }));

                dragStateRef.current.lastMousePos = { x: e.clientX, y: e.clientY };
                break;
            }
        }
    }, [dragMode, getSVGCoords, clusters, setClusters, setNodePositions,
        outcomeBoxDimensions, setOutcomeBoxDimensions, getNodesInBox, svgRef, viewBox]);

    // Mouse up handler
    const handleMouseUp = useCallback(() => {
        // DON'T redistribute nodes after resize - let users manually position them
        // Users can drag nodes individually to reposition them

        setDragMode('none');
        dragStateRef.current = { offset: { x: 0, y: 0 } };
    }, [dragMode]);

    // Canvas click handler for panning
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (e.target === svgRef.current || (e.target as SVGElement).tagName === 'svg') {
            dragStateRef.current = {
                offset: { x: 0, y: 0 },
                lastMousePos: { x: e.clientX, y: e.clientY }
            };
            setDragMode('pan');
        }
    }, [svgRef]);

    // Panel drag handlers
    const handlePanelMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDraggingPanel(true);
        setPanelDragStart({
            x: e.clientX - panelPosition.x,
            y: e.clientY - panelPosition.y
        });
    }, [panelPosition]);

    const handlePanelMouseMove = useCallback((e: MouseEvent) => {
        if (isDraggingPanel) {
            setPanelPosition({
                x: e.clientX - panelDragStart.x,
                y: e.clientY - panelDragStart.y
            });
        }
    }, [isDraggingPanel, panelDragStart]);

    const handlePanelMouseUp = useCallback(() => {
        setIsDraggingPanel(false);
    }, []);

    // Effect for panel dragging
    useEffect(() => {
        if (isDraggingPanel) {
            document.addEventListener('mousemove', handlePanelMouseMove);
            document.addEventListener('mouseup', handlePanelMouseUp);
            return () => {
                document.removeEventListener('mousemove', handlePanelMouseMove);
                document.removeEventListener('mouseup', handlePanelMouseUp);
            };
        }
    }, [isDraggingPanel, handlePanelMouseMove, handlePanelMouseUp]);

    // Get cursor style
    const getCursorStyle = useCallback(() => {
        switch (dragMode) {
            case 'node':
            case 'cluster':
            case 'outcomeBox':
            case 'pan':
                return 'grabbing';
            case 'resize':
                const edge = dragStateRef.current.resizeEdge;
                if (edge === 'left' || edge === 'right') return 'ew-resize';
                if (edge === 'top' || edge === 'bottom') return 'ns-resize';
                return 'grab';
            default:
                return 'grab';
        }
    }, [dragMode]);

    return {
        // State
        draggedNode: dragMode === 'node' ? dragStateRef.current.nodeId || null : null,
        draggedCluster: dragMode === 'cluster' ? dragStateRef.current.clusterTreatment || null : null,
        draggedOutcomeBox: dragMode === 'outcomeBox' ? dragStateRef.current.outcomeBox || null : null,
        panOffset,
        isPanning: dragMode === 'pan',
        panelPosition,
        isDraggingPanel,
        resizingBox: dragMode === 'resize' ? {
            box: dragStateRef.current.resizeBox!,
            edge: dragStateRef.current.resizeEdge!,
            startX: 0,
            startY: 0,
            initialDimensions: dragStateRef.current.initialDimensions!
        } : null,

        // Handlers
        handleNodeClick,
        handleNodeMouseDown,
        handleClusterMouseDown,
        handleOutcomeBoxMouseDown,
        handleBoxResizeStart,
        handleMouseMove,
        handleMouseUp,
        handleCanvasMouseDown,
        handlePanelMouseDown,
        getCursorStyle,

        // Info Panel JSX
        renderInfoPanel: () => {
            if (!selectedNode) return null;

            const node = graphData.nodes.find(n => n.id === selectedNode);
            if (!node) return null;

            return (
                <div
                    className="node-info-panel"
                    style={{
                        transform: `translate(${panelPosition.x}px, ${panelPosition.y}px)`,
                        cursor: isDraggingPanel ? 'grabbing' : 'default'
                    }}
                >
                    <div
                        className="panel-header"
                        onMouseDown={handlePanelMouseDown}
                        style={{ cursor: isDraggingPanel ? 'grabbing' : 'grab' }}
                    >
                        <div className="panel-title-section">
                            <i className="fa-solid fa-grip-vertical drag-indicator"></i>
                            <h4>Node Details</h4>
                        </div>
                        <button
                            className="close-btn"
                            onClick={() => setSelectedNode(null)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <div className="panel-content">
                        <div className="info-row">
                            <span className="info-label">ID:</span>
                            <span className="info-value">{node.id}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Type:</span>
                            <span className="info-value">{node.type}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Label:</span>
                            <span className="info-value">{node.label}</span>
                        </div>
                        {Object.entries(node.data).map(([key, value]) => (
                            <div className="info-row" key={key}>
                                <span className="info-label">{key}:</span>
                                <span className="info-value">{String(value)}</span>
                            </div>
                        ))}
                    </div>

                    <style jsx>{`
                        .node-info-panel {
                            position: absolute;
                            top: 80px;
                            right: 16px;
                            width: 300px;
                            max-height: 500px;
                            overflow-y: auto;
                            background: rgba(10, 20, 30, 0.95);
                            border: 1px solid rgba(255, 255, 255, 0.15);
                            border-radius: 10px;
                            backdrop-filter: blur(10px);
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                            z-index: 10;
                        }

                        .panel-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 12px 16px;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                            user-select: none;
                        }

                        .panel-title-section {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }

                        .drag-indicator {
                            color: rgba(255, 255, 255, 0.3);
                            font-size: 12px;
                        }

                        .panel-header:hover .drag-indicator {
                            color: rgba(52, 211, 153, 0.6);
                        }

                        .panel-header h4 {
                            font-size: 14px;
                            font-weight: 600;
                            color: #ffffff;
                            margin: 0;
                        }

                        .close-btn {
                            width: 24px;
                            height: 24px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 6px;
                            color: rgba(255, 255, 255, 0.6);
                            cursor: pointer;
                            transition: all 0.2s ease;
                        }

                        .close-btn:hover {
                            background: rgba(239, 68, 68, 0.1);
                            border-color: rgba(239, 68, 68, 0.3);
                            color: #ef4444;
                        }

                        .panel-content {
                            padding: 12px 16px;
                        }

                        .info-row {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            padding: 8px 0;
                            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                            gap: 12px;
                        }

                        .info-row:last-child {
                            border-bottom: none;
                        }

                        .info-label {
                            font-size: 12px;
                            color: rgba(255, 255, 255, 0.5);
                            font-weight: 500;
                            text-transform: capitalize;
                            flex-shrink: 0;
                        }

                        .info-value {
                            font-size: 12px;
                            color: rgba(255, 255, 255, 0.9);
                            font-weight: 600;
                            text-align: right;
                            word-break: break-word;
                        }

                        @media (max-width: 768px) {
                            .node-info-panel {
                                top: auto;
                                bottom: 16px;
                                right: 16px;
                                left: 16px;
                                width: auto;
                            }
                        }
                    `}</style>
                </div>
            );
        }
    };
}