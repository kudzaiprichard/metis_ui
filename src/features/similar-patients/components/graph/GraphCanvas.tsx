/**
 * GraphCanvas Component (Updated)
 * Handles SVG rendering with dynamic box sizing, solid borders, draggable and resize handles
 */

'use client';

import { SimilarPatientsGraphResponse } from '../../api/similar-patients.types';

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

interface GraphCanvasProps {
    svgRef: React.RefObject<SVGSVGElement | null>;
    graphData: SimilarPatientsGraphResponse;
    viewBox: { width: number; height: number };
    zoom: number;
    panOffset: { x: number; y: number };
    nodePositions: Map<string, NodePosition>;
    clusters: ClusterInfo[];
    layout: 'force' | 'radial' | 'hierarchical' | 'cluster' | 'outcome';
    selectedNode: string | null;
    draggedNode: string | null;
    canvasHeight: number;
    cursorStyle: string;
    outcomeBoxDimensions?: OutcomeBoxDimensions;
    onCanvasMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
    onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
    onMouseUp: () => void;
    onNodeClick: (nodeId: string, e: React.MouseEvent) => void;
    onNodeMouseDown: (nodeId: string, e: React.MouseEvent) => void;
    onClusterMouseDown: (treatment: string, e: React.MouseEvent) => void;
    onResizeMouseDown: (e: React.MouseEvent) => void;
    onBoxResizeStart?: (box: 'success' | 'partial' | 'failure' | 'noOutcome', edge: 'left' | 'right' | 'top' | 'bottom', e: React.MouseEvent) => void;
    onOutcomeBoxMouseDown?: (box: 'success' | 'partial' | 'failure' | 'noOutcome', e: React.MouseEvent) => void;
}

export function GraphCanvas({
                                svgRef,
                                graphData,
                                viewBox,
                                zoom,
                                panOffset,
                                nodePositions,
                                clusters,
                                layout,
                                selectedNode,
                                draggedNode,
                                canvasHeight,
                                cursorStyle,
                                outcomeBoxDimensions,
                                onCanvasMouseDown,
                                onMouseMove,
                                onMouseUp,
                                onNodeClick,
                                onNodeMouseDown,
                                onClusterMouseDown,
                                onResizeMouseDown,
                                onBoxResizeStart,
                                onOutcomeBoxMouseDown,
                            }: GraphCanvasProps) {

    // Helper to get node counts by outcome
    const getOutcomeCounts = () => {
        const noOutcomeTreatments = graphData.nodes.filter(n => {
            const cat = (n.data.outcome_category as string) || '';
            return n.type === 'treatment' && (!cat || (cat !== 'Success' && cat !== 'Failure' && cat !== 'Partial')) && n.id !== graphData.patient_id;
        }).length;

        const noOutcomePatients = graphData.nodes.filter(n => {
            const cat = (n.data.outcome_category as string) || '';
            return n.type === 'patient' && (!cat || (cat !== 'Success' && cat !== 'Failure' && cat !== 'Partial')) && n.id !== graphData.patient_id;
        }).length;

        return {
            noOutcomeTreatments,
            noOutcomePatients,
            hasNoOutcome: noOutcomeTreatments > 0 || noOutcomePatients > 0
        };
    };

    const outcomeCounts = getOutcomeCounts();

    return (
        <>
            <div className="graph-canvas" style={{ height: `${canvasHeight}px` }}>
                <svg
                    ref={svgRef}
                    className="graph-svg"
                    width="100%"
                    height={canvasHeight}
                    viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
                    style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        cursor: cursorStyle
                    }}
                    onMouseDown={onCanvasMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                >
                    <defs>
                        <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="10"
                            refX="8"
                            refY="3"
                            orient="auto"
                        >
                            <polygon points="0 0, 10 3, 0 6" fill="rgba(255, 255, 255, 0.3)" />
                        </marker>

                        {clusters.map(cluster => (
                            <radialGradient key={`gradient-${cluster.treatment}`} id={`clusterGradient-${cluster.treatment}`}>
                                <stop offset="0%" stopColor={`${cluster.color}40`} />
                                <stop offset="100%" stopColor={`${cluster.color}10`} />
                            </radialGradient>
                        ))}

                        {/* Outcome section gradients - subtle like clusters */}
                        <radialGradient id="successGradient">
                            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.15)" />
                            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
                        </radialGradient>
                        <radialGradient id="failureGradient">
                            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.15)" />
                            <stop offset="100%" stopColor="rgba(239, 68, 68, 0.05)" />
                        </radialGradient>
                        <radialGradient id="partialGradient">
                            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.15)" />
                            <stop offset="100%" stopColor="rgba(245, 158, 11, 0.05)" />
                        </radialGradient>
                        <radialGradient id="noOutcomeGradient">
                            <stop offset="0%" stopColor="rgba(148, 163, 184, 0.15)" />
                            <stop offset="100%" stopColor="rgba(148, 163, 184, 0.05)" />
                        </radialGradient>
                    </defs>

                    <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}
                       style={{ transformOrigin: `${viewBox.width / 2}px ${viewBox.height / 2}px` }}>

                        {/* Render outcome section backgrounds */}
                        {layout === 'outcome' && outcomeBoxDimensions && (
                            <g className="outcome-sections">
                                {/* No Outcome section (top) - only if there are no-outcome nodes */}
                                {outcomeCounts.hasNoOutcome && (
                                    <g className="no-outcome-box">
                                        <rect
                                            x={outcomeBoxDimensions.noOutcome.x}
                                            y={outcomeBoxDimensions.noOutcome.y}
                                            width={outcomeBoxDimensions.noOutcome.width}
                                            height={outcomeBoxDimensions.noOutcome.height}
                                            fill="url(#noOutcomeGradient)"
                                            stroke="rgba(148, 163, 184, 0.4)"
                                            strokeWidth="2"
                                            strokeDasharray="5,5"
                                            rx="12"
                                            opacity="0.6"
                                            className="outcome-box"
                                            style={{ cursor: 'move' }}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                if (onOutcomeBoxMouseDown) {
                                                    onOutcomeBoxMouseDown('noOutcome', e);
                                                }
                                            }}
                                        />

                                        {/* Resize handles for no-outcome box */}
                                        {onBoxResizeStart && (
                                            <>
                                                {/* Right handle */}
                                                <rect
                                                    x={outcomeBoxDimensions.noOutcome.x + outcomeBoxDimensions.noOutcome.width - 8}
                                                    y={outcomeBoxDimensions.noOutcome.y + outcomeBoxDimensions.noOutcome.height / 2 - 30}
                                                    width="8"
                                                    height="60"
                                                    fill="rgba(148, 163, 184, 0.4)"
                                                    rx="4"
                                                    className="resize-handle resize-handle-right"
                                                    style={{ cursor: 'ew-resize' }}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        onBoxResizeStart('noOutcome', 'right', e);
                                                    }}
                                                />
                                                {/* Left handle */}
                                                <rect
                                                    x={outcomeBoxDimensions.noOutcome.x}
                                                    y={outcomeBoxDimensions.noOutcome.y + outcomeBoxDimensions.noOutcome.height / 2 - 30}
                                                    width="8"
                                                    height="60"
                                                    fill="rgba(148, 163, 184, 0.4)"
                                                    rx="4"
                                                    className="resize-handle resize-handle-left"
                                                    style={{ cursor: 'ew-resize' }}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        onBoxResizeStart('noOutcome', 'left', e);
                                                    }}
                                                />
                                                {/* Bottom handle */}
                                                <rect
                                                    x={outcomeBoxDimensions.noOutcome.x + outcomeBoxDimensions.noOutcome.width / 2 - 30}
                                                    y={outcomeBoxDimensions.noOutcome.y + outcomeBoxDimensions.noOutcome.height - 8}
                                                    width="60"
                                                    height="8"
                                                    fill="rgba(148, 163, 184, 0.4)"
                                                    rx="4"
                                                    className="resize-handle resize-handle-bottom"
                                                    style={{ cursor: 'ns-resize' }}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        onBoxResizeStart('noOutcome', 'bottom', e);
                                                    }}
                                                />
                                                {/* Top handle */}
                                                <rect
                                                    x={outcomeBoxDimensions.noOutcome.x + outcomeBoxDimensions.noOutcome.width / 2 - 30}
                                                    y={outcomeBoxDimensions.noOutcome.y}
                                                    width="60"
                                                    height="8"
                                                    fill="rgba(148, 163, 184, 0.4)"
                                                    rx="4"
                                                    className="resize-handle resize-handle-top"
                                                    style={{ cursor: 'ns-resize' }}
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        onBoxResizeStart('noOutcome', 'top', e);
                                                    }}
                                                />
                                            </>
                                        )}
                                    </g>
                                )}

                                {/* Success section (left) */}
                                <g className="success-box">
                                    <rect
                                        x={outcomeBoxDimensions.success.x}
                                        y={outcomeBoxDimensions.success.y}
                                        width={outcomeBoxDimensions.success.width}
                                        height={outcomeBoxDimensions.success.height}
                                        fill="url(#successGradient)"
                                        stroke="rgba(16, 185, 129, 0.4)"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                        rx="12"
                                        opacity="0.6"
                                        className="outcome-box"
                                        style={{ cursor: 'move' }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            if (onOutcomeBoxMouseDown) {
                                                onOutcomeBoxMouseDown('success', e);
                                            }
                                        }}
                                    />

                                    {/* Resize handles */}
                                    {onBoxResizeStart && (
                                        <>
                                            {/* Right handle */}
                                            <rect
                                                x={outcomeBoxDimensions.success.x + outcomeBoxDimensions.success.width - 8}
                                                y={outcomeBoxDimensions.success.y + outcomeBoxDimensions.success.height / 2 - 30}
                                                width="8"
                                                height="60"
                                                fill="rgba(16, 185, 129, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-right"
                                                style={{ cursor: 'ew-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('success', 'right', e);
                                                }}
                                            />
                                            {/* Left handle */}
                                            <rect
                                                x={outcomeBoxDimensions.success.x}
                                                y={outcomeBoxDimensions.success.y + outcomeBoxDimensions.success.height / 2 - 30}
                                                width="8"
                                                height="60"
                                                fill="rgba(16, 185, 129, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-left"
                                                style={{ cursor: 'ew-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('success', 'left', e);
                                                }}
                                            />
                                            {/* Bottom handle */}
                                            <rect
                                                x={outcomeBoxDimensions.success.x + outcomeBoxDimensions.success.width / 2 - 30}
                                                y={outcomeBoxDimensions.success.y + outcomeBoxDimensions.success.height - 8}
                                                width="60"
                                                height="8"
                                                fill="rgba(16, 185, 129, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-bottom"
                                                style={{ cursor: 'ns-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('success', 'bottom', e);
                                                }}
                                            />
                                            {/* Top handle */}
                                            <rect
                                                x={outcomeBoxDimensions.success.x + outcomeBoxDimensions.success.width / 2 - 30}
                                                y={outcomeBoxDimensions.success.y}
                                                width="60"
                                                height="8"
                                                fill="rgba(16, 185, 129, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-top"
                                                style={{ cursor: 'ns-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('success', 'top', e);
                                                }}
                                            />
                                        </>
                                    )}
                                </g>

                                {/* Partial section (center) */}
                                <g className="partial-box">
                                    <rect
                                        x={outcomeBoxDimensions.partial.x}
                                        y={outcomeBoxDimensions.partial.y}
                                        width={outcomeBoxDimensions.partial.width}
                                        height={outcomeBoxDimensions.partial.height}
                                        fill="url(#partialGradient)"
                                        stroke="rgba(245, 158, 11, 0.4)"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                        rx="12"
                                        opacity="0.6"
                                        className="outcome-box"
                                        style={{ cursor: 'move' }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            if (onOutcomeBoxMouseDown) {
                                                onOutcomeBoxMouseDown('partial', e);
                                            }
                                        }}
                                    />

                                    {/* Resize handles */}
                                    {onBoxResizeStart && (
                                        <>
                                            {/* Right handle */}
                                            <rect
                                                x={outcomeBoxDimensions.partial.x + outcomeBoxDimensions.partial.width - 8}
                                                y={outcomeBoxDimensions.partial.y + outcomeBoxDimensions.partial.height / 2 - 30}
                                                width="8"
                                                height="60"
                                                fill="rgba(245, 158, 11, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-right"
                                                style={{ cursor: 'ew-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('partial', 'right', e);
                                                }}
                                            />
                                            {/* Left handle */}
                                            <rect
                                                x={outcomeBoxDimensions.partial.x}
                                                y={outcomeBoxDimensions.partial.y + outcomeBoxDimensions.partial.height / 2 - 30}
                                                width="8"
                                                height="60"
                                                fill="rgba(245, 158, 11, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-left"
                                                style={{ cursor: 'ew-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('partial', 'left', e);
                                                }}
                                            />
                                            {/* Bottom handle */}
                                            <rect
                                                x={outcomeBoxDimensions.partial.x + outcomeBoxDimensions.partial.width / 2 - 30}
                                                y={outcomeBoxDimensions.partial.y + outcomeBoxDimensions.partial.height - 8}
                                                width="60"
                                                height="8"
                                                fill="rgba(245, 158, 11, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-bottom"
                                                style={{ cursor: 'ns-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('partial', 'bottom', e);
                                                }}
                                            />
                                            {/* Top handle */}
                                            <rect
                                                x={outcomeBoxDimensions.partial.x + outcomeBoxDimensions.partial.width / 2 - 30}
                                                y={outcomeBoxDimensions.partial.y}
                                                width="60"
                                                height="8"
                                                fill="rgba(245, 158, 11, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-top"
                                                style={{ cursor: 'ns-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('partial', 'top', e);
                                                }}
                                            />
                                        </>
                                    )}
                                </g>

                                {/* Failure section (right) */}
                                <g className="failure-box">
                                    <rect
                                        x={outcomeBoxDimensions.failure.x}
                                        y={outcomeBoxDimensions.failure.y}
                                        width={outcomeBoxDimensions.failure.width}
                                        height={outcomeBoxDimensions.failure.height}
                                        fill="url(#failureGradient)"
                                        stroke="rgba(239, 68, 68, 0.4)"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                        rx="12"
                                        opacity="0.6"
                                        className="outcome-box"
                                        style={{ cursor: 'move' }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            if (onOutcomeBoxMouseDown) {
                                                onOutcomeBoxMouseDown('failure', e);
                                            }
                                        }}
                                    />

                                    {/* Resize handles */}
                                    {onBoxResizeStart && (
                                        <>
                                            {/* Right handle */}
                                            <rect
                                                x={outcomeBoxDimensions.failure.x + outcomeBoxDimensions.failure.width - 8}
                                                y={outcomeBoxDimensions.failure.y + outcomeBoxDimensions.failure.height / 2 - 30}
                                                width="8"
                                                height="60"
                                                fill="rgba(239, 68, 68, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-right"
                                                style={{ cursor: 'ew-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('failure', 'right', e);
                                                }}
                                            />
                                            {/* Left handle */}
                                            <rect
                                                x={outcomeBoxDimensions.failure.x}
                                                y={outcomeBoxDimensions.failure.y + outcomeBoxDimensions.failure.height / 2 - 30}
                                                width="8"
                                                height="60"
                                                fill="rgba(239, 68, 68, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-left"
                                                style={{ cursor: 'ew-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('failure', 'left', e);
                                                }}
                                            />
                                            {/* Bottom handle */}
                                            <rect
                                                x={outcomeBoxDimensions.failure.x + outcomeBoxDimensions.failure.width / 2 - 30}
                                                y={outcomeBoxDimensions.failure.y + outcomeBoxDimensions.failure.height - 8}
                                                width="60"
                                                height="8"
                                                fill="rgba(239, 68, 68, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-bottom"
                                                style={{ cursor: 'ns-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('failure', 'bottom', e);
                                                }}
                                            />
                                            {/* Top handle */}
                                            <rect
                                                x={outcomeBoxDimensions.failure.x + outcomeBoxDimensions.failure.width / 2 - 30}
                                                y={outcomeBoxDimensions.failure.y}
                                                width="60"
                                                height="8"
                                                fill="rgba(239, 68, 68, 0.4)"
                                                rx="4"
                                                className="resize-handle resize-handle-top"
                                                style={{ cursor: 'ns-resize' }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    onBoxResizeStart('failure', 'top', e);
                                                }}
                                            />
                                        </>
                                    )}
                                </g>
                            </g>
                        )}

                        {/* Render cluster backgrounds if in cluster mode */}
                        {layout === 'cluster' && clusters.map(cluster => (
                            <g key={`cluster-${cluster.treatment}`}>
                                <circle
                                    cx={cluster.centerX}
                                    cy={cluster.centerY}
                                    r={120}
                                    fill={`url(#clusterGradient-${cluster.treatment})`}
                                    stroke={cluster.color}
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    opacity="0.6"
                                    style={{ cursor: 'grab' }}
                                    onMouseDown={(e) => onClusterMouseDown(cluster.treatment, e)}
                                />
                                <text
                                    x={cluster.centerX}
                                    y={cluster.centerY - 130}
                                    className="cluster-label"
                                    textAnchor="middle"
                                    fill={cluster.color}
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {cluster.treatment}
                                </text>
                            </g>
                        ))}

                        {/* Render edges */}
                        <g className="edges">
                            {graphData.edges.map((edge) => {
                                const sourcePos = nodePositions.get(edge.source);
                                const targetPos = nodePositions.get(edge.target);

                                if (!sourcePos || !targetPos) return null;

                                const midX = (sourcePos.x + targetPos.x) / 2;
                                const midY = (sourcePos.y + targetPos.y) / 2;

                                return (
                                    <g key={edge.id}>
                                        <line
                                            x1={sourcePos.x}
                                            y1={sourcePos.y}
                                            x2={targetPos.x}
                                            y2={targetPos.y}
                                            stroke={edge.style.color}
                                            strokeWidth={edge.style.width}
                                            markerEnd="url(#arrowhead)"
                                            opacity="0.4"
                                            style={{ pointerEvents: 'none' }}
                                        />
                                        {edge.label && (
                                            <text
                                                x={midX}
                                                y={midY}
                                                className="edge-label"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                {edge.label}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </g>

                        {/* Render nodes */}
                        <g className="nodes">
                            {graphData.nodes.map((node) => {
                                const pos = nodePositions.get(node.id);
                                if (!pos) return null;

                                const isSelected = selectedNode === node.id;
                                const isDragging = draggedNode === node.id;
                                const size = layout === 'hierarchical' ? 30 : (parseFloat(node.style.size) || 20);

                                return (
                                    <g
                                        key={node.id}
                                        className="node-group"
                                        onMouseDown={(e) => onNodeMouseDown(node.id, e)}
                                        onClick={(e) => onNodeClick(node.id, e)}
                                        style={{
                                            cursor: isDragging ? 'grabbing' : 'grab',
                                            opacity: isDragging ? 0.7 : 1
                                        }}
                                    >
                                        <circle
                                            cx={pos.x}
                                            cy={pos.y}
                                            r={size}
                                            fill={node.style.color}
                                            stroke={isSelected ? '#34d399' : 'rgba(255, 255, 255, 0.2)'}
                                            strokeWidth={isSelected ? 3 : 1}
                                            className="node-circle"
                                            style={{ pointerEvents: 'all' }}
                                        />
                                        <text
                                            x={pos.x}
                                            y={pos.y + size + 15}
                                            className="node-label"
                                            textAnchor="middle"
                                            style={{ pointerEvents: 'none' }}
                                        >
                                            {node.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </g>
                </svg>

                {/* Resize Handle */}
                <div
                    className="resize-handle"
                    onMouseDown={onResizeMouseDown}
                >
                    <div className="resize-indicator">
                        <i className="fa-solid fa-grip-lines"></i>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .graph-canvas {
                    position: relative;
                    width: 100%;
                    min-height: 400px;
                    max-height: 1200px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    overflow: hidden;
                    transition: height 0.1s ease;
                }

                .resize-handle {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 12px;
                    cursor: ns-resize;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(
                            to top,
                            rgba(255, 255, 255, 0.08),
                            transparent
                    );
                    transition: background 0.2s ease;
                }

                .resize-handle:hover {
                    background: linear-gradient(
                            to top,
                            rgba(52, 211, 153, 0.15),
                            transparent
                    );
                }

                .resize-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 60px;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 10px;
                }

                .resize-handle:hover .resize-indicator {
                    background: rgba(52, 211, 153, 0.2);
                    color: rgba(52, 211, 153, 0.6);
                }

                .graph-svg {
                    display: block;
                    user-select: none;
                }

                .outcome-box {
                    transition: opacity 0.2s ease, stroke 0.2s ease;
                }

                .outcome-box:hover {
                    opacity: 0.8 !important;
                    stroke-width: 3;
                }

                .resize-handle {
                    opacity: 0;
                    transition: opacity 0.2s ease, fill 0.2s ease;
                    pointer-events: all;
                }

                .outcome-box:hover ~ .resize-handle,
                .resize-handle:hover {
                    opacity: 1 !important;
                }

                .resize-handle-left:hover,
                .resize-handle-right:hover,
                .resize-handle-top:hover,
                .resize-handle-bottom:hover {
                    opacity: 1 !important;
                    fill: rgba(52, 211, 153, 0.6) !important;
                }

                .node-group {
                    transition: none;
                }

                .node-circle {
                    transition: stroke 0.2s ease, stroke-width 0.2s ease;
                }

                .node-group:hover .node-circle {
                    stroke: #34d399 !important;
                    stroke-width: 2;
                }

                .node-label {
                    fill: rgba(255, 255, 255, 0.9);
                    font-size: 12px;
                    font-weight: 500;
                    pointer-events: none;
                    user-select: none;
                }

                .cluster-label {
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    user-select: none;
                }

                .edge-label {
                    fill: rgba(255, 255, 255, 0.6);
                    font-size: 10px;
                    pointer-events: none;
                    user-select: none;
                }

                @media (max-width: 768px) {
                    .graph-canvas {
                        min-height: 400px;
                    }
                }
            `}</style>
        </>
    );
}