'use client';

import { Button } from '@/src/components/shadcn/button';
import { SimulationLifecycle } from '../types';
import { Play, Pause, RotateCw, XCircle, Loader2 } from 'lucide-react';

interface ControlsBarProps {
    status: SimulationLifecycle;
    step: number;
    totalSteps: number;
    onConnect: () => void;
    onDisconnect: () => void;
    onCancel: () => Promise<void>;
    onReset: () => void;
}

export function ControlsBar({
    status,
    step,
    totalSteps,
    onConnect,
    onDisconnect,
    onCancel,
    onReset,
}: ControlsBarProps) {
    const isStreaming = status === 'streaming';
    const isPaused = status === 'paused';
    const isConnecting = status === 'connecting';
    const isTerminal =
        status === 'completed' ||
        status === 'cancelled' ||
        status === 'failed';

    const progress =
        totalSteps > 0 ? Math.min((step / totalSteps) * 100, 100) : 0;

    return (
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
                {/* Run / Pause toggle */}
                {!isTerminal && (
                    <Button
                        onClick={isStreaming ? onDisconnect : onConnect}
                        disabled={isConnecting}
                        className={`rounded-lg h-9 px-5 text-sm font-semibold border ${
                            isStreaming
                                ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
                                : isConnecting
                                  ? 'bg-white/[0.04] border-white/10 text-muted-foreground'
                                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                        }`}
                        variant="ghost"
                    >
                        {isConnecting ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                Connecting...
                            </>
                        ) : isStreaming ? (
                            <>
                                <Pause className="h-3 w-3 mr-1.5" /> Pause
                            </>
                        ) : (
                            <>
                                <Play className="h-3 w-3 mr-1.5" />{' '}
                                {isPaused ? 'Resume' : 'Watch Live'}
                            </>
                        )}
                    </Button>
                )}

                {/* Cancel — only when simulation is actively running server-side */}
                {(isStreaming || isPaused || isConnecting) && (
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="rounded-lg h-9 px-4 text-sm font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                    >
                        <XCircle className="h-3 w-3 mr-1.5" />
                        Cancel
                    </Button>
                )}

                {/* Reset — always available once a simulation exists */}
                <Button
                    variant="ghost"
                    onClick={onReset}
                    className="rounded-lg h-9 px-4 text-sm font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                >
                    <RotateCw className="h-3 w-3 mr-1.5" />
                    New Simulation
                </Button>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground font-semibold tabular-nums">
                    {step.toLocaleString()}{' '}
                    <span className="text-muted-foreground/40">/</span>{' '}
                    {totalSteps.toLocaleString()} patients
                </div>
                <div className="w-32 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-150 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="text-xs text-muted-foreground/60 font-semibold tabular-nums w-10 text-right">
                    {progress.toFixed(0)}%
                </span>
            </div>
        </div>
    );
}
