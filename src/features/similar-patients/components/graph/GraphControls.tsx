'use client';

import { Minus, Plus, CircleDot, GitFork, Layers, ChartLine, Maximize2, Minimize2 } from 'lucide-react';
import { LayoutType } from '../../hooks/useGraphLayout';

interface GraphControlsProps {
    zoom: number;
    onZoomChange: (zoom: number) => void;
    layout: LayoutType;
    onLayoutChange: (layout: LayoutType) => void;
    showLabels: boolean;
    onShowLabelsChange: (show: boolean) => void;
    onReset: () => void;
    /** Compact mode — renders inline without wrapper/labels for fullscreen toolbar */
    compact?: boolean;
    /** Normal mode fullscreen props */
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
}

export function GraphControls({
                                  zoom,
                                  onZoomChange,
                                  layout,
                                  onLayoutChange,
                                  compact,
                                  isFullscreen,
                                  onToggleFullscreen,
                              }: GraphControlsProps) {
    const layouts: { id: LayoutType; label: string; icon: React.ElementType }[] = [
        { id: 'force', label: 'Force', icon: CircleDot },
        { id: 'hierarchical', label: 'Tree', icon: GitFork },
        { id: 'cluster', label: 'Cluster', icon: Layers },
        { id: 'outcome', label: 'Outcome', icon: ChartLine },
    ];

    // ── Compact: inline controls without wrapper, no labels ─────────────
    if (compact) {
        return (
            <>
                {/* Zoom */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onZoomChange(Math.max(zoom - 0.2, 0.5))}
                        disabled={zoom <= 0.5}
                        className="w-6 h-6 flex items-center justify-center bg-white/[0.04] border border-white/10 rounded-none text-muted-foreground/70 hover:bg-white/[0.08] hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <Minus className="h-2.5 w-2.5" />
                    </button>
                    <span className="text-[11px] font-semibold text-primary min-w-[36px] text-center">
                        {(zoom * 100).toFixed(0)}%
                    </span>
                    <button
                        onClick={() => onZoomChange(Math.min(zoom + 0.2, 2))}
                        disabled={zoom >= 2}
                        className="w-6 h-6 flex items-center justify-center bg-white/[0.04] border border-white/10 rounded-none text-muted-foreground/70 hover:bg-white/[0.08] hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus className="h-2.5 w-2.5" />
                    </button>
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/[0.1]" />

                {/* Layout */}
                <div className="flex gap-0.5">
                    {layouts.map((l) => {
                        const Icon = l.icon;
                        return (
                            <button
                                key={l.id}
                                onClick={() => onLayoutChange(l.id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-none text-[10px] font-semibold transition-colors whitespace-nowrap ${
                                    layout === l.id
                                        ? 'bg-primary/15 text-primary'
                                        : 'text-muted-foreground/60 hover:bg-white/[0.05] hover:text-foreground/90'
                                }`}
                                title={l.label}
                            >
                                <Icon className="h-3 w-3" />
                                <span>{l.label}</span>
                            </button>
                        );
                    })}
                </div>
            </>
        );
    }

    // ── Normal: full controls with wrapper ──────────────────────────────
    return (
        <div className="flex items-center gap-5 px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-none flex-wrap">
            {/* Zoom */}
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Zoom</span>
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-none p-1">
                    <button
                        onClick={() => onZoomChange(Math.max(zoom - 0.2, 0.5))}
                        disabled={zoom <= 0.5}
                        className="w-7 h-7 flex items-center justify-center bg-white/[0.04] border border-white/10 rounded-none text-muted-foreground/70 hover:bg-white/[0.08] hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-[12px] font-semibold text-primary min-w-[45px] text-center">
                        {(zoom * 100).toFixed(0)}%
                    </span>
                    <button
                        onClick={() => onZoomChange(Math.min(zoom + 0.2, 2))}
                        disabled={zoom >= 2}
                        className="w-7 h-7 flex items-center justify-center bg-white/[0.04] border border-white/10 rounded-none text-muted-foreground/70 hover:bg-white/[0.08] hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                </div>
            </div>

            {/* Layout */}
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Layout</span>
                <div className="flex gap-1 bg-white/[0.04] border border-white/10 rounded-none p-1">
                    {layouts.map((l) => {
                        const Icon = l.icon;
                        return (
                            <button
                                key={l.id}
                                onClick={() => onLayoutChange(l.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[11px] font-semibold transition-colors whitespace-nowrap ${
                                    layout === l.id
                                        ? 'bg-primary/15 text-primary'
                                        : 'text-muted-foreground/60 hover:bg-white/[0.05] hover:text-foreground/90'
                                }`}
                            >
                                <Icon className="h-3 w-3" />
                                <span>{l.label}</span>
                            </button>
                        );
                    })}

                    {/* Fullscreen toggle inside the layout group */}
                    {onToggleFullscreen && (
                        <>
                            <div className="w-px bg-white/[0.1] mx-0.5" />
                            <button
                                onClick={onToggleFullscreen}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[11px] font-semibold text-muted-foreground/60 hover:bg-white/[0.05] hover:text-foreground/90 transition-colors whitespace-nowrap"
                                title="Enter fullscreen"
                            >
                                <Maximize2 className="h-3 w-3" />
                                <span>Fullscreen</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}