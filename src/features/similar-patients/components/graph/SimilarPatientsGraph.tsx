/**
 * SimilarPatientsGraph Component (Complete Rewrite)
 * Main orchestrator with improved tree layout algorithm
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { SimilarPatientsGraphResponse } from '../../api/similar-patients.types';
import { GraphControls } from './GraphControls';
import { GraphCanvas } from './GraphCanvas';
import { GraphInteractions } from './GraphInteractions';

interface SimilarPatientsGraphProps {
    graphData: SimilarPatientsGraphResponse;
}

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

export function SimilarPatientsGraph({ graphData }: SimilarPatientsGraphProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    // UI State
    const [zoom, setZoom] = useState(1);
    const [layout, setLayout] = useState<'force' | 'hierarchical' | 'cluster' | 'outcome'>('force');
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [viewBox, setViewBox] = useState({ width: 1200, height: 600 });
    const [canvasHeight, setCanvasHeight] = useState(600);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState(0);

    // Graph State
    const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
    const [clusters, setClusters] = useState<ClusterInfo[]>([]);

    // Outcome box state
    const [outcomeBoxDimensions, setOutcomeBoxDimensions] = useState<OutcomeBoxDimensions | undefined>();

    // Treatment colors for clusters
    const TREATMENT_COLORS: Record<string, string> = {
        'Metformin': '#3b82f6',
        'GLP-1': '#8b5cf6',
        'SGLT-2': '#ec4899',
        'Insulin': '#f59e0b',
        'DPP-4': '#10b981',
        'Sulfonylurea': '#ef4444',
        'TZD': '#14b8a6',
        'Combination': '#6366f1',
        'Other': '#64748b',
    };

    // Group nodes by treatment
    const groupNodesByTreatment = () => {
        const groups: Record<string, string[]> = {};

        graphData.nodes.forEach(node => {
            if (node.id === graphData.patient_id) return;

            const drugClass = (node.data.drug_class as string) || 'Other';
            if (!groups[drugClass]) {
                groups[drugClass] = [];
            }
            groups[drugClass].push(node.id);
        });

        return groups;
    };

    // Calculate dynamic outcome box dimensions based on node counts
    const calculateOutcomeBoxDimensions = (): OutcomeBoxDimensions => {
        const width = viewBox.width;
        const horizontalSpacing = 80;
        const verticalSpacing = 100;
        const padding = 40;
        const minBoxWidth = 200;
        const minBoxHeight = 150;

        // Get nodes by category
        const successNodes = graphData.nodes.filter(n =>
            n.data.outcome_category === 'Success' && n.id !== graphData.patient_id
        );
        const partialNodes = graphData.nodes.filter(n =>
            n.data.outcome_category === 'Partial' && n.id !== graphData.patient_id
        );
        const failureNodes = graphData.nodes.filter(n =>
            n.data.outcome_category === 'Failure' && n.id !== graphData.patient_id
        );
        const noOutcomeNodes = graphData.nodes.filter(n => {
            const cat = (n.data.outcome_category as string) || '';
            return (!cat || (cat !== 'Success' && cat !== 'Failure' && cat !== 'Partial'))
                && n.id !== graphData.patient_id;
        });

        // Calculate grid dimensions for each category
        const calculateBoxSize = (nodeCount: number) => {
            if (nodeCount === 0) return { width: minBoxWidth, height: minBoxHeight };

            const nodesPerColumn = Math.ceil(Math.sqrt(nodeCount));
            const totalCols = Math.ceil(nodeCount / nodesPerColumn);

            const calcWidth = Math.max(minBoxWidth, (totalCols * horizontalSpacing) + padding * 2);
            const calcHeight = Math.max(minBoxHeight, (nodesPerColumn * verticalSpacing) + padding * 2);

            return { width: calcWidth, height: calcHeight };
        };

        const successSize = calculateBoxSize(successNodes.length);
        const partialSize = calculateBoxSize(partialNodes.length);
        const failureSize = calculateBoxSize(failureNodes.length);

        // No outcome box - two layers (treatments + patients)
        const noOutcomeTreatments = noOutcomeNodes.filter(n => n.type === 'treatment').length;
        const noOutcomePatients = noOutcomeNodes.filter(n => n.type === 'patient').length;
        const maxNoOutcomeRow = Math.max(noOutcomeTreatments, noOutcomePatients);
        const noOutcomeWidth = Math.max(minBoxWidth, (maxNoOutcomeRow * horizontalSpacing) + padding * 2);
        const noOutcomeHeight = noOutcomeNodes.length > 0 ? 250 : 0;

        // Calculate Y positions
        const noOutcomeY = noOutcomeNodes.length > 0 ? 150 : 0;
        const mainOutcomeY = noOutcomeNodes.length > 0 ? 450 : 250;

        // Calculate X positions for three-column layout
        const totalWidth = successSize.width + partialSize.width + failureSize.width;
        const gap = 20;
        const startX = (width - totalWidth - gap * 2) / 2;

        return {
            noOutcome: {
                x: (width - noOutcomeWidth) / 2,
                y: noOutcomeY,
                width: noOutcomeWidth,
                height: noOutcomeHeight
            },
            success: {
                x: startX,
                y: mainOutcomeY,
                width: successSize.width,
                height: successSize.height
            },
            partial: {
                x: startX + successSize.width + gap,
                y: mainOutcomeY,
                width: partialSize.width,
                height: partialSize.height
            },
            failure: {
                x: startX + successSize.width + partialSize.width + gap * 2,
                y: mainOutcomeY,
                width: failureSize.width,
                height: failureSize.height
            }
        };
    };

    // Calculate dynamic viewBox based on layout and node count
    useEffect(() => {
        const nodeCount = graphData.nodes.length;
        let height = 600;

        if (layout === 'hierarchical') {
            // Simple grid calculation for tree
            const nonRootCount = nodeCount - 1;
            const nodesPerRow = Math.min(4, Math.ceil(Math.sqrt(nonRootCount)));
            const rows = Math.ceil(nonRootCount / nodesPerRow);
            const verticalSpacing = 180;
            height = Math.max(600, 150 + 180 + (rows * verticalSpacing) + 100);
        } else if (layout === 'force') {
            if (nodeCount > 10) {
                const radius = 200 + ((nodeCount - 10) * 10);
                height = Math.max(600, (radius * 2) + 200);
            }
        } else if (layout === 'cluster') {
            const treatmentGroups = groupNodesByTreatment();
            const clusterCount = Object.keys(treatmentGroups).length;
            const rows = Math.ceil(Math.sqrt(clusterCount));
            height = Math.max(600, 200 + (rows * 350));
        } else if (layout === 'outcome') {
            const boxes = calculateOutcomeBoxDimensions();
            const maxBoxHeight = Math.max(boxes.success.height, boxes.partial.height, boxes.failure.height);
            const mainBoxesY = boxes.success.y;
            height = Math.max(600, mainBoxesY + maxBoxHeight + 100);

            setOutcomeBoxDimensions(boxes);
        }

        setViewBox({ width: 1200, height });
    }, [graphData.nodes.length, layout]);

    // Get initial node position based on layout
    const getInitialNodePosition = (index: number, total: number): NodePosition => {
        const width = viewBox.width;
        const height = viewBox.height;
        const centerX = width / 2;
        const centerY = height / 2;

        if (layout === 'outcome') {
            if (index === 0) {
                return { x: centerX, y: 100 };
            }

            const node = graphData.nodes[index];
            const outcomeCategory = (node.data.outcome_category as string) || '';
            const nodeType = node.type;

            const hasNoOutcome = !outcomeCategory ||
                (outcomeCategory !== 'Success' && outcomeCategory !== 'Failure' && outcomeCategory !== 'Partial');

            if (hasNoOutcome && outcomeBoxDimensions) {
                const noOutcomeTreatments = graphData.nodes.filter(n => {
                    const cat = (n.data.outcome_category as string) || '';
                    return n.type === 'treatment' && (!cat || (cat !== 'Success' && cat !== 'Failure' && cat !== 'Partial'))
                        && n.id !== graphData.patient_id;
                });
                const noOutcomePatients = graphData.nodes.filter(n => {
                    const cat = (n.data.outcome_category as string) || '';
                    return n.type === 'patient' && (!cat || (cat !== 'Success' && cat !== 'Failure' && cat !== 'Partial'))
                        && n.id !== graphData.patient_id;
                });

                const horizontalSpacing = 80;
                const box = outcomeBoxDimensions.noOutcome;
                const boxCenterX = box.x + box.width / 2;

                if (nodeType === 'patient') {
                    const positionInLayer = noOutcomePatients.findIndex(n => n.id === node.id);
                    const layerSize = noOutcomePatients.length;
                    const startX = boxCenterX - ((layerSize - 1) * horizontalSpacing / 2);

                    return {
                        x: startX + (positionInLayer * horizontalSpacing),
                        y: box.y + 60
                    };
                } else {
                    const positionInLayer = noOutcomeTreatments.findIndex(n => n.id === node.id);
                    const layerSize = noOutcomeTreatments.length;
                    const startX = boxCenterX - ((layerSize - 1) * horizontalSpacing / 2);

                    return {
                        x: startX + (positionInLayer * horizontalSpacing),
                        y: box.y + 180
                    };
                }
            }

            if (!outcomeBoxDimensions) return { x: centerX, y: centerY };

            let box: { x: number; y: number; width: number; height: number };
            let groupNodes: typeof graphData.nodes = [];

            if (outcomeCategory === 'Success') {
                box = outcomeBoxDimensions.success;
                groupNodes = graphData.nodes.filter(n =>
                    n.data.outcome_category === 'Success' && n.id !== graphData.patient_id
                );
            } else if (outcomeCategory === 'Failure') {
                box = outcomeBoxDimensions.failure;
                groupNodes = graphData.nodes.filter(n =>
                    n.data.outcome_category === 'Failure' && n.id !== graphData.patient_id
                );
            } else {
                box = outcomeBoxDimensions.partial;
                groupNodes = graphData.nodes.filter(n =>
                    n.data.outcome_category === 'Partial' && n.id !== graphData.patient_id
                );
            }

            const positionInGroup = groupNodes.findIndex(n => n.id === node.id);
            const groupSize = groupNodes.length;

            const verticalSpacing = 100;
            const horizontalSpacing = 80;
            const nodesPerColumn = Math.ceil(Math.sqrt(groupSize));

            const col = Math.floor(positionInGroup / nodesPerColumn);
            const row = positionInGroup % nodesPerColumn;

            const boxCenterX = box.x + box.width / 2;
            const boxCenterY = box.y + box.height / 2;

            const totalCols = Math.ceil(groupSize / nodesPerColumn);
            const startX = boxCenterX - ((totalCols - 1) * horizontalSpacing / 2);
            const startY = boxCenterY - ((nodesPerColumn - 1) * verticalSpacing / 2);

            return {
                x: startX + (col * horizontalSpacing),
                y: startY + (row * verticalSpacing)
            };
        } else if (layout === 'cluster') {
            if (index === 0) {
                return { x: centerX, y: centerY };
            }

            const node = graphData.nodes[index];
            const drugClass = (node.data.drug_class as string) || 'Other';
            const treatmentGroups = groupNodesByTreatment();
            const treatments = Object.keys(treatmentGroups);
            const clusterIndex = treatments.indexOf(drugClass);

            if (clusterIndex === -1) return { x: centerX, y: centerY };

            const numClusters = treatments.length;
            const clusterAngle = (clusterIndex / numClusters) * Math.PI * 2;
            const clusterDistance = 300;
            const clusterCenterX = centerX + Math.cos(clusterAngle) * clusterDistance;
            const clusterCenterY = centerY + Math.sin(clusterAngle) * clusterDistance;

            const nodesInCluster = treatmentGroups[drugClass];
            const positionInCluster = nodesInCluster.indexOf(node.id);
            const nodeAngle = (positionInCluster / nodesInCluster.length) * Math.PI * 2;
            const nodeDistance = 80;

            return {
                x: clusterCenterX + Math.cos(nodeAngle) * nodeDistance,
                y: clusterCenterY + Math.sin(nodeAngle) * nodeDistance
            };
        } else if (layout === 'hierarchical') {
            // Simple guaranteed tree layout
            if (index === 0) {
                // Root node (patient) at the top center
                return { x: centerX, y: 150 };
            }

            // All other nodes - simple approach
            const nonRootNodes = graphData.nodes.filter(n => n.id !== graphData.patient_id);
            const nodeIndex = nonRootNodes.findIndex(n => n.id === graphData.nodes[index].id);

            // Calculate grid parameters
            const horizontalSpacing = 180;
            const verticalSpacing = 180;
            const nodesPerRow = Math.min(4, Math.ceil(Math.sqrt(nonRootNodes.length))); // Max 4 nodes per row

            const row = Math.floor(nodeIndex / nodesPerRow);
            const col = nodeIndex % nodesPerRow;

            // Calculate current row width
            const nodesInCurrentRow = Math.min(nodesPerRow, nonRootNodes.length - (row * nodesPerRow));
            const rowWidth = (nodesInCurrentRow - 1) * horizontalSpacing;
            const rowStartX = centerX - rowWidth / 2;

            return {
                x: rowStartX + (col * horizontalSpacing),
                y: 150 + verticalSpacing + (row * verticalSpacing) // Start one level below root
            };
        } else {
            // Force layout (default)
            if (index === 0) {
                return { x: centerX, y: centerY };
            }
            const angle = ((index - 1) / (total - 1)) * Math.PI * 2;
            const radius = 220;
            return {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            };
        }
    };

    // Initialize node positions and clusters
    useEffect(() => {
        const positions = new Map<string, NodePosition>();
        const newClusters: ClusterInfo[] = [];

        if (layout === 'cluster') {
            const treatmentGroups = groupNodesByTreatment();
            const treatments = Object.keys(treatmentGroups);
            const centerX = viewBox.width / 2;
            const centerY = viewBox.height / 2;

            treatments.forEach((treatment, clusterIndex) => {
                const numClusters = treatments.length;
                const clusterAngle = (clusterIndex / numClusters) * Math.PI * 2;
                const clusterDistance = 300;
                const clusterCenterX = centerX + Math.cos(clusterAngle) * clusterDistance;
                const clusterCenterY = centerY + Math.sin(clusterAngle) * clusterDistance;

                newClusters.push({
                    treatment,
                    centerX: clusterCenterX,
                    centerY: clusterCenterY,
                    nodeIds: treatmentGroups[treatment],
                    color: TREATMENT_COLORS[treatment] || TREATMENT_COLORS['Other']
                });
            });

            setClusters(newClusters);
        }

        graphData.nodes.forEach((node, index) => {
            positions.set(node.id, getInitialNodePosition(index, graphData.nodes.length));
        });

        setNodePositions(positions);
    }, [graphData.nodes, layout, viewBox, outcomeBoxDimensions]);

    // Initialize GraphInteractions
    const interactions = GraphInteractions({
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
    });

    // Canvas resize handlers
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        setResizeStart(e.clientY);
    };

    const handleResizeMouseMove = (e: MouseEvent) => {
        if (isResizing) {
            const delta = e.clientY - resizeStart;
            setCanvasHeight(prev => Math.max(400, Math.min(1200, prev + delta)));
            setResizeStart(e.clientY);
        }
    };

    const handleResizeMouseUp = () => {
        setIsResizing(false);
    };

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMouseMove);
            document.addEventListener('mouseup', handleResizeMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleResizeMouseMove);
                document.removeEventListener('mouseup', handleResizeMouseUp);
            };
        }
    }, [isResizing, resizeStart]);

    // Calculate outcome statistics
    const outcomeStats = {
        success: graphData.nodes.filter(n =>
            n.data.outcome_category === 'Success' && n.id !== graphData.patient_id
        ).length,
        failure: graphData.nodes.filter(n =>
            n.data.outcome_category === 'Failure' && n.id !== graphData.patient_id
        ).length,
        partial: graphData.nodes.filter(n =>
            n.data.outcome_category === 'Partial' && n.id !== graphData.patient_id
        ).length,
        noOutcome: graphData.nodes.filter(n => {
            const cat = (n.data.outcome_category as string) || '';
            return (!cat || (cat !== 'Success' && cat !== 'Failure' && cat !== 'Partial'))
                && n.id !== graphData.patient_id;
        }).length,
        noOutcomeTreatments: graphData.nodes.filter(n => {
            const cat = (n.data.outcome_category as string) || '';
            return n.type === 'treatment' && (!cat || (cat !== 'Success' && cat !== 'Failure' && cat !== 'Partial'))
                && n.id !== graphData.patient_id;
        }).length,
        noOutcomePatients: graphData.nodes.filter(n => {
            const cat = (n.data.outcome_category as string) || '';
            return n.type === 'patient' && (!cat || (cat !== 'Success' && cat !== 'Failure' && cat !== 'Partial'))
                && n.id !== graphData.patient_id;
        }).length
    };

    return (
        <>
            <div className="graph-container">
                <GraphControls
                    zoom={zoom}
                    onZoomChange={setZoom}
                    layout={layout}
                    onLayoutChange={setLayout}
                    showLabels={false}
                    onShowLabelsChange={() => {}}
                    onReset={() => {}}
                />

                <div className="graph-stats">
                    <div className="stat-item">
                        <i className="fa-solid fa-circle-nodes"></i>
                        <span>{graphData.nodes.length} Nodes</span>
                    </div>
                    <div className="stat-item">
                        <i className="fa-solid fa-link"></i>
                        <span>{graphData.edges.length} Connections</span>
                    </div>
                    <div className="stat-item">
                        <i className="fa-solid fa-magnifying-glass-chart"></i>
                        <span>{graphData.metadata.results_found} Cases Found</span>
                    </div>
                    {layout === 'cluster' && (
                        <div className="stat-item">
                            <i className="fa-solid fa-layer-group"></i>
                            <span>{clusters.length} Treatment Groups</span>
                        </div>
                    )}
                    {layout === 'outcome' && (
                        <>
                            <div className="stat-item success">
                                <i className="fa-solid fa-check-circle"></i>
                                <span>{outcomeStats.success} Success</span>
                            </div>
                            <div className="stat-item partial">
                                <i className="fa-solid fa-adjust"></i>
                                <span>{outcomeStats.partial} Partial</span>
                            </div>
                            <div className="stat-item failure">
                                <i className="fa-solid fa-times-circle"></i>
                                <span>{outcomeStats.failure} Failure</span>
                            </div>
                            {outcomeStats.noOutcome > 0 && (
                                <div className="stat-item no-outcome">
                                    <i className="fa-solid fa-clock"></i>
                                    <span>{outcomeStats.noOutcome} No Data</span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {layout === 'cluster' && clusters.length > 0 && (
                    <div className="cluster-legend">
                        <h4 className="legend-title">Treatment Clusters</h4>
                        <div className="legend-items">
                            {clusters.map(cluster => (
                                <div key={cluster.treatment} className="legend-item">
                                    <div
                                        className="legend-color"
                                        style={{ backgroundColor: cluster.color }}
                                    ></div>
                                    <span className="legend-label">{cluster.treatment}</span>
                                    <span className="legend-count">({cluster.nodeIds.length})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="instructions">
                    <span className="instruction-item">
                        <i className="fa-solid fa-hand-pointer"></i>
                        Double-click nodes to view details
                    </span>
                    <span className="instruction-item">
                        <i className="fa-solid fa-arrows-alt"></i>
                        Click & drag nodes to reposition
                    </span>
                    {layout === 'cluster' && (
                        <span className="instruction-item">
                            <i className="fa-solid fa-layer-group"></i>
                            Click & drag cluster backgrounds to move groups
                        </span>
                    )}
                    {layout === 'outcome' && (
                        <>
                            <span className="instruction-item">
                                <i className="fa-solid fa-chart-line"></i>
                                View outcomes: Green=Success, Orange=Partial, Red=Failure, Gray=No Data
                            </span>
                            <span className="instruction-item">
                                <i className="fa-solid fa-expand"></i>
                                Drag box edges to resize outcome sections
                            </span>
                        </>
                    )}
                    <span className="instruction-item">
                        <i className="fa-solid fa-hand"></i>
                        Click & drag canvas to pan
                    </span>
                    <span className="instruction-item">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        Use zoom controls
                    </span>
                </div>

                <GraphCanvas
                    svgRef={svgRef}
                    graphData={graphData}
                    viewBox={viewBox}
                    zoom={zoom}
                    panOffset={interactions.panOffset}
                    nodePositions={nodePositions}
                    clusters={clusters}
                    layout={layout}
                    selectedNode={selectedNode}
                    draggedNode={interactions.draggedNode}
                    canvasHeight={canvasHeight}
                    cursorStyle={interactions.getCursorStyle()}
                    outcomeBoxDimensions={outcomeBoxDimensions}
                    onCanvasMouseDown={interactions.handleCanvasMouseDown}
                    onMouseMove={interactions.handleMouseMove}
                    onMouseUp={interactions.handleMouseUp}
                    onNodeClick={interactions.handleNodeClick}
                    onNodeMouseDown={interactions.handleNodeMouseDown}
                    onClusterMouseDown={interactions.handleClusterMouseDown}
                    onResizeMouseDown={handleResizeMouseDown}
                    onBoxResizeStart={interactions.handleBoxResizeStart}
                    onOutcomeBoxMouseDown={interactions.handleOutcomeBoxMouseDown}
                />

                {interactions.renderInfoPanel()}
            </div>

            <style jsx>{`
                .graph-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .graph-stats {
                    display: flex;
                    gap: 20px;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    flex-wrap: wrap;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.7);
                }

                .stat-item i {
                    color: #34d399;
                    font-size: 14px;
                }

                .stat-item.success i {
                    color: #10b981;
                }

                .stat-item.partial i {
                    color: #f59e0b;
                }

                .stat-item.failure i {
                    color: #ef4444;
                }

                .stat-item.no-outcome i {
                    color: #94a3b8;
                }

                .cluster-legend {
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                }

                .legend-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 0 0 12px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .legend-items {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                }

                .legend-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .legend-label {
                    font-weight: 500;
                }

                .legend-count {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 11px;
                }

                .instructions {
                    display: flex;
                    gap: 20px;
                    padding: 10px 16px;
                    background: rgba(52, 211, 153, 0.05);
                    border: 1px solid rgba(52, 211, 153, 0.2);
                    border-radius: 8px;
                    flex-wrap: wrap;
                }

                .instruction-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: rgba(52, 211, 153, 0.9);
                }

                .instruction-item i {
                    font-size: 13px;
                }

                @media (max-width: 768px) {
                    .graph-stats {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .legend-items {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .instructions {
                        flex-direction: column;
                        gap: 8px;
                    }
                }
            `}</style>
        </>
    );
}