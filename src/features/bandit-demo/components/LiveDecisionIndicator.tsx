'use client';

import { Card } from '@/src/components/shadcn/card';
import { Treatment, HistoryEntry } from '../types';
import { Search, Target, Zap, Pill } from 'lucide-react';

interface LiveDecisionIndicatorProps {
    history: HistoryEntry[];
    treatments: Treatment[];
    step: number;
}

export function LiveDecisionIndicator({ history, treatments, step }: LiveDecisionIndicatorProps) {
    const last = history.length > 0 ? history[history.length - 1] : null;

    if (!last) {
        return (
            <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2.5">
                    <Zap className="h-4 w-4 text-muted-foreground/40" />
                    <p className="text-base text-muted-foreground">Awaiting first decision...</p>
                </div>
            </Card>
        );
    }

    const isExplore = last.explored;
    const treatment = treatments[last.selectedIdx];
    const reward = last.observedReward;
    const epsilon = (last.epsilon * 100).toFixed(1);

    // Recent explore/exploit ratio (last 20)
    const recentWindow = history.slice(-20);
    const recentExplore = recentWindow.filter((h) => h.explored).length;
    const recentExploit = recentWindow.length - recentExplore;

    return (
        <Card className={`backdrop-blur-sm rounded-lg p-4 border transition-colors ${
            isExplore
                ? 'border-warning/20 bg-warning/[0.04]'
                : 'border-emerald-500/20 bg-emerald-500/[0.04]'
        }`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Decision */}
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                        isExplore
                            ? 'bg-warning/15 border-warning/25'
                            : 'bg-emerald-500/15 border-emerald-500/25'
                    }`}>
                        {isExplore ? (
                            <Search className="h-4 w-4 text-warning" />
                        ) : (
                            <Target className="h-4 w-4 text-emerald-400" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`text-base font-bold ${isExplore ? 'text-warning' : 'text-emerald-400'}`}>
                                {isExplore ? 'THOMPSON EXPLORED' : 'EXPLOITED'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Patient #{step}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Pill className="h-3 w-3 text-primary" />
                            <span className="text-sm text-foreground font-semibold">
                                {treatment?.name ?? '—'}
                            </span>
                            <span className="text-xs text-muted-foreground">→</span>
                            <span className={`text-sm font-semibold ${reward > 5 ? 'text-emerald-400' : reward > 2 ? 'text-warning' : 'text-red-400'}`}>
                                Reward: {reward.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Current epsilon + recent ratio */}
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block">
                            ε Value
                        </span>
                        <span className="text-md font-bold text-warning">{epsilon}%</span>
                    </div>
                    <div className="w-px h-8 bg-white/[0.08]" />
                    <div className="text-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block">
                            Last 20
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-warning font-semibold">{recentExplore} explore</span>
                            <span className="text-xs text-muted-foreground/40">/</span>
                            <span className="text-xs text-emerald-400 font-semibold">{recentExploit} exploit</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
