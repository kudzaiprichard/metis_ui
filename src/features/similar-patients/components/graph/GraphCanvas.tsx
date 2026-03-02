'use client';

import { SimilarPatientsGraphResponse, GraphNode, GraphEdge } from '../../api/similar-patients.types';
import { NodePosition, ClusterInfo, OutcomeBoxDimensions, OutcomeBoxKey, LayoutType } from '../../hooks/useGraphLayout';

interface GraphCanvasProps {
    svgRef: React.RefObject<SVGSVGElement | null>;
    displayNodes: GraphNode[];
    displayEdges: GraphEdge[];
    viewBox: { width: number; height: number };
    zoom: number;
    panOffset: { x: number; y: number };
    nodePositions: Map<string, NodePosition>;
    clusters: ClusterInfo[];
    layout: LayoutType;
    selectedNode: string | null;
    draggedNode: string | null;
    cursorStyle: string;
    outcomeBoxDimensions?: OutcomeBoxDimensions;
    onCanvasMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
    onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
    onMouseUp: () => void;
    onNodeClick: (nodeId: string, e: React.MouseEvent) => void;
    onNodeMouseDown: (nodeId: string, e: React.MouseEvent) => void;
    onClusterMouseDown: (treatment: string, e: React.MouseEvent) => void;
    onBoxResizeStart?: (box: OutcomeBoxKey, edge: 'left' | 'right' | 'top' | 'bottom', e: React.MouseEvent) => void;
    onOutcomeBoxMouseDown?: (box: OutcomeBoxKey, e: React.MouseEvent) => void;
}

function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

export function GraphCanvas({
                                svgRef, displayNodes, displayEdges, viewBox, zoom, panOffset, nodePositions, clusters,
                                layout, selectedNode, draggedNode, cursorStyle,
                                outcomeBoxDimensions, onCanvasMouseDown, onMouseMove, onMouseUp,
                                onNodeClick, onNodeMouseDown, onClusterMouseDown,
                                onBoxResizeStart, onOutcomeBoxMouseDown,
                            }: GraphCanvasProps) {

    const renderResizeHandles = (
        box: OutcomeBoxKey,
        dim: { x: number; y: number; width: number; height: number },
        color: string
    ) => {
        if (!onBoxResizeStart) return null;
        const handles = [
            { edge: 'right' as const, x: dim.x + dim.width - 8, y: dim.y + dim.height / 2 - 30, w: 8, h: 60, cursor: 'ew-resize' },
            { edge: 'left' as const, x: dim.x, y: dim.y + dim.height / 2 - 30, w: 8, h: 60, cursor: 'ew-resize' },
            { edge: 'bottom' as const, x: dim.x + dim.width / 2 - 30, y: dim.y + dim.height - 8, w: 60, h: 8, cursor: 'ns-resize' },
            { edge: 'top' as const, x: dim.x + dim.width / 2 - 30, y: dim.y, w: 60, h: 8, cursor: 'ns-resize' },
        ];
        return handles.map((h) => (
            <rect
                key={`${box}-${h.edge}`}
                x={h.x} y={h.y} width={h.w} height={h.h}
                fill={color} rx="4"
                opacity="0"
                style={{ cursor: h.cursor, pointerEvents: 'all', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => { (e.target as SVGRectElement).setAttribute('opacity', '1'); }}
                onMouseLeave={(e) => { (e.target as SVGRectElement).setAttribute('opacity', '0'); }}
                onMouseDown={(e) => { e.stopPropagation(); onBoxResizeStart(box, h.edge, e); }}
            />
        ));
    };

    const renderOutcomeBox = (
        box: OutcomeBoxKey,
        dim: { x: number; y: number; width: number; height: number },
        gradientId: string,
        strokeColor: string,
        handleColor: string
    ) => (
        <g>
            <rect
                x={dim.x} y={dim.y} width={dim.width} height={dim.height}
                fill={`url(#${gradientId})`} stroke={strokeColor}
                strokeWidth="2" strokeDasharray="5,5" rx="0" opacity="0.6"
                style={{ cursor: 'move', transition: 'opacity 0.2s, stroke-width 0.2s' }}
                onMouseDown={(e) => { e.stopPropagation(); onOutcomeBoxMouseDown?.(box, e); }}
            />
            {renderResizeHandles(box, dim, handleColor)}
        </g>
    );

    return (
        <div className="relative w-full h-full">
            <svg
                ref={svgRef}
                className="block select-none w-full"
                viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
                preserveAspectRatio="xMidYMin meet"
                style={{ cursor: cursorStyle, minHeight: '100%', overflow: 'visible' }}
                onMouseDown={onCanvasMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="rgba(255,255,255,0.3)" />
                    </marker>
                    <radialGradient id="successGradient"><stop offset="0%" stopColor="rgba(16,185,129,0.15)" /><stop offset="100%" stopColor="rgba(16,185,129,0.05)" /></radialGradient>
                    <radialGradient id="failureGradient"><stop offset="0%" stopColor="rgba(239,68,68,0.15)" /><stop offset="100%" stopColor="rgba(239,68,68,0.05)" /></radialGradient>
                    <radialGradient id="partialGradient"><stop offset="0%" stopColor="rgba(245,158,11,0.15)" /><stop offset="100%" stopColor="rgba(245,158,11,0.05)" /></radialGradient>
                    <radialGradient id="noOutcomeGradient"><stop offset="0%" stopColor="rgba(148,163,184,0.15)" /><stop offset="100%" stopColor="rgba(148,163,184,0.05)" /></radialGradient>
                    <radialGradient id="patientsGradient"><stop offset="0%" stopColor="rgba(59,130,246,0.15)" /><stop offset="100%" stopColor="rgba(59,130,246,0.05)" /></radialGradient>
                    <radialGradient id="treatmentsGradient"><stop offset="0%" stopColor="rgba(148,163,184,0.15)" /><stop offset="100%" stopColor="rgba(148,163,184,0.05)" /></radialGradient>
                </defs>

                <g transform={`translate(${panOffset.x},${panOffset.y}) scale(${zoom})`} style={{ transformOrigin: `${viewBox.width / 2}px ${viewBox.height / 2}px` }}>

                    {layout === 'outcome' && outcomeBoxDimensions && (
                        <g>
                            {outcomeBoxDimensions.patients.height > 0 && (
                                <g>
                                    {renderOutcomeBox('patients', outcomeBoxDimensions.patients, 'patientsGradient', 'rgba(59,130,246,0.4)', 'rgba(59,130,246,0.4)')}
                                    <text x={outcomeBoxDimensions.patients.x + 16} y={outcomeBoxDimensions.patients.y + 28} style={{ fill: 'rgba(59,130,246,0.9)', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', pointerEvents: 'none', userSelect: 'none' }}>Patients</text>
                                </g>
                            )}
                            {outcomeBoxDimensions.treatments.height > 0 && (
                                <g>
                                    {renderOutcomeBox('treatments', outcomeBoxDimensions.treatments, 'treatmentsGradient', 'rgba(148,163,184,0.4)', 'rgba(148,163,184,0.4)')}
                                    <text x={outcomeBoxDimensions.treatments.x + 16} y={outcomeBoxDimensions.treatments.y + 28} style={{ fill: 'rgba(148,163,184,0.9)', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', pointerEvents: 'none', userSelect: 'none' }}>Treatments</text>
                                </g>
                            )}
                            <g>
                                {renderOutcomeBox('success', outcomeBoxDimensions.success, 'successGradient', 'rgba(16,185,129,0.4)', 'rgba(16,185,129,0.4)')}
                                <text x={outcomeBoxDimensions.success.x + 16} y={outcomeBoxDimensions.success.y + 28} style={{ fill: 'rgba(16,185,129,0.9)', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', pointerEvents: 'none', userSelect: 'none' }}>Success</text>
                            </g>
                            <g>
                                {renderOutcomeBox('partial', outcomeBoxDimensions.partial, 'partialGradient', 'rgba(245,158,11,0.4)', 'rgba(245,158,11,0.4)')}
                                <text x={outcomeBoxDimensions.partial.x + 16} y={outcomeBoxDimensions.partial.y + 28} style={{ fill: 'rgba(245,158,11,0.9)', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', pointerEvents: 'none', userSelect: 'none' }}>Partial</text>
                            </g>
                            <g>
                                {renderOutcomeBox('failure', outcomeBoxDimensions.failure, 'failureGradient', 'rgba(239,68,68,0.4)', 'rgba(239,68,68,0.4)')}
                                <text x={outcomeBoxDimensions.failure.x + 16} y={outcomeBoxDimensions.failure.y + 28} style={{ fill: 'rgba(239,68,68,0.9)', fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', pointerEvents: 'none', userSelect: 'none' }}>Failure</text>
                            </g>
                        </g>
                    )}

                    {layout === 'cluster' && clusters.map(c => (
                        <g key={`cl-${c.treatment}`}>
                            <circle
                                cx={c.centerX} cy={c.centerY} r={c.radius}
                                fill={hexToRgba(c.color, 0.08)}
                                stroke={c.color}
                                strokeWidth="2" strokeDasharray="5,5" opacity="0.8"
                                style={{ cursor: 'grab' }}
                                onMouseDown={(e) => onClusterMouseDown(c.treatment, e)}
                            />
                            <text x={c.centerX} y={c.centerY - c.radius - 10} textAnchor="middle" fill={c.color} style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', pointerEvents: 'none', userSelect: 'none' }}>{c.treatment}</text>
                        </g>
                    ))}

                    <g>
                        {displayEdges.map((edge) => {
                            const s = nodePositions.get(edge.source);
                            const t = nodePositions.get(edge.target);
                            if (!s || !t) return null;
                            return (
                                <g key={edge.id}>
                                    <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={edge.style.color} strokeWidth={edge.style.width} markerEnd="url(#arrowhead)" opacity="0.4" style={{ pointerEvents: 'none' }} />
                                    {edge.label && (
                                        <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2} textAnchor="middle" dominantBaseline="middle" style={{ fill: 'rgba(255,255,255,0.6)', fontSize: '10px', pointerEvents: 'none', userSelect: 'none' }}>{edge.label}</text>
                                    )}
                                </g>
                            );
                        })}
                    </g>

                    <g>
                        {displayNodes.map((node) => {
                            const pos = nodePositions.get(node.id);
                            if (!pos) return null;
                            const isSelected = selectedNode === node.id;
                            const isDragging = draggedNode === node.id;
                            const size = parseFloat(node.style.size) || 20;
                            return (
                                <g key={node.id} onMouseDown={(e) => onNodeMouseDown(node.id, e)} onClick={(e) => onNodeClick(node.id, e)} style={{ cursor: isDragging ? 'grabbing' : 'grab', opacity: isDragging ? 0.7 : 1 }}>
                                    <circle cx={pos.x} cy={pos.y} r={size} fill={node.style.color} stroke={isSelected ? '#34d399' : 'rgba(255,255,255,0.2)'} strokeWidth={isSelected ? 3 : 1} style={{ pointerEvents: 'all', transition: 'stroke 0.2s, stroke-width 0.2s' }} />
                                    <text x={pos.x} y={pos.y + size + 15} textAnchor="middle" style={{ fill: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: 500, pointerEvents: 'none', userSelect: 'none' }}>{node.label}</text>
                                </g>
                            );
                        })}
                    </g>
                </g>
            </svg>
        </div>
    );
}