'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { SimilarPatientsGraphResponse } from '../../api/similar-patients.types';
import { GraphControls } from './GraphControls';
import { GraphCanvas } from './GraphCanvas';
import { GraphInteractions } from './GraphInteractions';
import { useGraphLayout, LayoutType } from '../../hooks/useGraphLayout';
import { ScrollArea } from '@/src/components/shadcn/scroll-area';
import {
    CircleDot, Link, SearchCheck, Layers,
    CheckCircle, XCircle, Clock, CircleDashed,
    MousePointer, Move, Hand, ZoomIn, Expand, ChartLine,
    GripHorizontal, Maximize2, Minimize2,
} from 'lucide-react';

interface SimilarPatientsGraphProps {
    graphData: SimilarPatientsGraphResponse;
}

const MIN_HEIGHT = 400;
const DEFAULT_HEIGHT = 600;
const MAX_HEIGHT = 1200;

export function SimilarPatientsGraph({ graphData }: SimilarPatientsGraphProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [zoom, setZoom] = useState(1);
    const [layout, setLayout] = useState<LayoutType>('force');
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [viewBox, setViewBox] = useState({ width: 1200, height: 600 });
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [containerHeight, setContainerHeight] = useState(DEFAULT_HEIGHT);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStartY = useRef(0);
    const resizeStartHeight = useRef(0);

    const filteredGraphData = useMemo<SimilarPatientsGraphResponse>(() => {
        const pid = graphData.patient_id;
        return {
            ...graphData,
            nodes: graphData.nodes.filter(n => n.id !== pid && n.type !== 'query_patient'),
            edges: graphData.edges.filter(e => e.source !== pid && e.target !== pid),
        };
    }, [graphData]);

    const {
        nodePositions, setNodePositions,
        clusters, setClusters,
        outcomeBoxDimensions, setOutcomeBoxDimensions,
        calculatedHeight,
    } = useGraphLayout(filteredGraphData, layout, viewBox);

    // Derive viewBox height directly — no state update to avoid re-triggering layout
    const effectiveViewBox = useMemo(() => ({
        width: viewBox.width,
        height: calculatedHeight,
    }), [viewBox.width, calculatedHeight]);

    const interactions = GraphInteractions({
        svgRef, viewBox: effectiveViewBox, zoom,
        nodePositions, setNodePositions,
        clusters, setClusters,
        selectedNode, setSelectedNode,
        graphData: filteredGraphData,
        outcomeBoxDimensions, setOutcomeBoxDimensions,
    });

    // Lock body scroll in fullscreen + reset pan on toggle
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        // Reset pan when switching modes so canvas size doesn't carry over
        interactions.handleMouseUp();
        interactions.resetPan?.();
        return () => { document.body.style.overflow = ''; };
    }, [isFullscreen]);

    // Escape to exit fullscreen
    useEffect(() => {
        if (!isFullscreen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullscreen(false);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isFullscreen]);

    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        resizeStartY.current = e.clientY;
        resizeStartHeight.current = containerHeight;
    }, [containerHeight]);

    useEffect(() => {
        if (!isResizing) return;
        const handleMouseMove = (e: MouseEvent) => {
            const delta = e.clientY - resizeStartY.current;
            setContainerHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, resizeStartHeight.current + delta)));
        };
        const handleMouseUp = () => setIsResizing(false);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
    }, [isResizing]);

    const outcomeStats = {
        success: filteredGraphData.nodes.filter(n => n.data.outcome_category === 'Success').length,
        failure: filteredGraphData.nodes.filter(n => n.data.outcome_category === 'Failure').length,
        partial: filteredGraphData.nodes.filter(n => n.data.outcome_category === 'Partial').length,
        noOutcome: filteredGraphData.nodes.filter(n => {
            const c = (n.data.outcome_category as string) || '';
            return !c || !['Success', 'Failure', 'Partial'].includes(c);
        }).length,
    };

    const statItems = [
        { icon: CircleDot, label: `${filteredGraphData.nodes.length} Nodes` },
        { icon: Link, label: `${filteredGraphData.edges.length} Connections` },
        { icon: SearchCheck, label: `${graphData.metadata.results_found} Cases Found` },
        ...(layout === 'cluster' ? [{ icon: Layers, label: `${clusters.length} Treatment Groups` }] : []),
        ...(layout === 'outcome' ? [
            { icon: CheckCircle, label: `${outcomeStats.success} Success`, color: 'text-emerald-400' },
            { icon: CircleDashed, label: `${outcomeStats.partial} Partial`, color: 'text-amber-400' },
            { icon: XCircle, label: `${outcomeStats.failure} Failure`, color: 'text-red-400' },
            ...(outcomeStats.noOutcome > 0 ? [{ icon: Clock, label: `${outcomeStats.noOutcome} No Data`, color: 'text-slate-400' }] : []),
        ] : []),
    ];

    const instructions = [
        { icon: MousePointer, text: 'Double-click nodes to view details' },
        { icon: Move, text: 'Click & drag nodes to reposition' },
        ...(layout === 'cluster' ? [{ icon: Layers, text: 'Click & drag cluster backgrounds to move groups' }] : []),
        ...(layout === 'outcome' ? [
            { icon: ChartLine, text: 'View outcomes: Green=Success, Orange=Partial, Red=Failure, Gray=No Data' },
            { icon: Expand, text: 'Drag box edges to resize outcome sections' },
        ] : []),
        { icon: Hand, text: 'Click & drag canvas to pan' },
        { icon: ZoomIn, text: 'Use zoom controls' },
    ];

    const dynamicCanvasHeight = useMemo(() => {
        const base = effectiveViewBox.height;
        const panExtra = Math.abs(interactions.panOffset.y) / zoom;
        const zoomExtra = base * Math.max(zoom - 1, 0);
        return base + panExtra + zoomExtra;
    }, [effectiveViewBox.height, interactions.panOffset.y, zoom]);

    const renderCanvas = (height: string) => (
        <div style={{ height, minWidth: '100%', minHeight: height }}>
            <GraphCanvas
                svgRef={svgRef} displayNodes={filteredGraphData.nodes} displayEdges={filteredGraphData.edges}
                viewBox={effectiveViewBox} zoom={zoom}
                panOffset={interactions.panOffset} nodePositions={nodePositions} clusters={clusters}
                layout={layout} selectedNode={selectedNode} draggedNode={interactions.draggedNode}
                cursorStyle={interactions.getCursorStyle()}
                outcomeBoxDimensions={outcomeBoxDimensions}
                onCanvasMouseDown={interactions.handleCanvasMouseDown}
                onMouseMove={interactions.handleMouseMove} onMouseUp={interactions.handleMouseUp}
                onNodeClick={interactions.handleNodeClick} onNodeMouseDown={interactions.handleNodeMouseDown}
                onClusterMouseDown={interactions.handleClusterMouseDown}
                onBoxResizeStart={interactions.handleBoxResizeStart}
                onOutcomeBoxMouseDown={interactions.handleOutcomeBoxMouseDown}
            />
        </div>
    );

    // ── FULLSCREEN ──────────────────────────────────────────────────────
    if (isFullscreen) {
        return (
            <div
                className="fixed inset-0 z-50 flex flex-col"
                style={{ background: 'linear-gradient(135deg, #0a1210 0%, #0f1f1a 50%, #132a22 100%)' }}
            >
                {/* Compact toolbar: everything right-aligned */}
                <div className="flex items-center justify-end gap-3 px-3 py-2 border-b border-white/[0.08] bg-white/[0.04] backdrop-blur-sm flex-shrink-0">
                    {/* Stats */}
                    {statItems.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/60">
                                <Icon className={`h-3 w-3 ${'color' in s ? s.color : 'text-primary'}`} />
                                <span>{s.label}</span>
                            </div>
                        );
                    })}

                    <div className="w-px h-5 bg-white/[0.1]" />

                    {/* Controls */}
                    <GraphControls
                        zoom={zoom} onZoomChange={setZoom}
                        layout={layout} onLayoutChange={setLayout}
                        showLabels={false} onShowLabelsChange={() => {}} onReset={() => {}}
                        compact
                    />

                    <div className="w-px h-5 bg-white/[0.1]" />

                    {/* Exit */}
                    <button
                        onClick={() => setIsFullscreen(false)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-none text-[11px] font-semibold text-muted-foreground/70 hover:bg-white/[0.1] hover:text-foreground transition-colors"
                        title="Exit fullscreen (Esc)"
                    >
                        <Minimize2 className="h-3 w-3" />
                        Exit
                    </button>
                </div>

                {/* Scrollable graph area — transparent so system bg shows through */}
                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full w-full">
                        {renderCanvas(`${Math.max(dynamicCanvasHeight, 800)}px`)}
                    </ScrollArea>
                    {interactions.renderInfoPanel()}
                </div>
            </div>
        );
    }

    // ── NORMAL MODE ─────────────────────────────────────────────────────
    return (
        <div className="relative flex flex-col gap-4">
            <GraphControls
                zoom={zoom} onZoomChange={setZoom}
                layout={layout} onLayoutChange={setLayout}
                showLabels={false} onShowLabelsChange={() => {}} onReset={() => {}}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(true)}
            />

            {/* Stats */}
            <div className="flex gap-5 px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-none flex-wrap">
                {statItems.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="flex items-center gap-2 text-[12px] text-foreground/70">
                            <Icon className={`h-3.5 w-3.5 ${'color' in s ? s.color : 'text-primary'}`} />
                            <span>{s.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Cluster Legend */}
            {layout === 'cluster' && clusters.length > 0 && (
                <div className="px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-none">
                    <h4 className="text-[11px] font-semibold text-foreground/90 uppercase tracking-wider mb-3">Treatment Clusters</h4>
                    <div className="flex flex-wrap gap-4">
                        {clusters.map(c => (
                            <div key={c.treatment} className="flex items-center gap-2 text-[11px] text-foreground/80">
                                <div className="w-3.5 h-3.5 rounded-none border border-white/20" style={{ backgroundColor: c.color }} />
                                <span className="font-medium">{c.treatment}</span>
                                <span className="text-muted-foreground/50">({c.nodeIds.length})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="flex gap-5 px-4 py-2.5 bg-primary/[0.05] border border-primary/20 rounded-none flex-wrap">
                {instructions.map((ins, i) => {
                    const Icon = ins.icon;
                    return (
                        <span key={i} className="flex items-center gap-2 text-[11px] text-primary/90">
                            <Icon className="h-3 w-3" />
                            {ins.text}
                        </span>
                    );
                })}
            </div>

            {/* Graph Container */}
            <div className="relative" ref={containerRef}>
                <div
                    className="border border-white/[0.08] rounded-none overflow-hidden"
                    style={{ height: `${containerHeight}px` }}
                >
                    <ScrollArea className="h-full w-full">
                        {renderCanvas(`${Math.max(containerHeight, dynamicCanvasHeight)}px`)}
                    </ScrollArea>
                </div>

                <div
                    onMouseDown={handleResizeMouseDown}
                    className={`
                        flex items-center justify-center w-full h-4 
                        border border-t-0 border-white/[0.08] rounded-none
                        bg-white/[0.04] hover:bg-white/[0.08] 
                        cursor-ns-resize transition-colors select-none
                        ${isResizing ? 'bg-primary/10 border-primary/20' : ''}
                    `}
                >
                    <GripHorizontal className="h-3 w-3 text-muted-foreground/40" />
                </div>
            </div>

            {interactions.renderInfoPanel()}
        </div>
    );
}