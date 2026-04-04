'use client';

import { Clock, History, Pill, ShieldCheck, Trash2 } from 'lucide-react';

import { Button } from '@/src/components/shadcn/button';
import { useRecentPredictions } from '../../hooks/useRecentPredictions';
import { clearRecent, payloadToFormValues, type RecentEntry } from '../../lib/recent-predictions';
import type { ClinicalFeaturesValues } from '@/src/lib/schemas/clinical';

interface RecentPredictionsRailProps {
    onRestore: (values: ClinicalFeaturesValues, entry: RecentEntry) => void;
    activeId?: string | null;
}

const formatRelative = (ts: number) => {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const tierStyle = (label: RecentEntry['confidenceLabel']) => {
    switch (label) {
        case 'HIGH':
            return 'text-primary';
        case 'MODERATE':
            return 'text-info';
        default:
            return 'text-warning';
    }
};

export function RecentPredictionsRail({ onRestore, activeId }: RecentPredictionsRailProps) {
    const entries = useRecentPredictions();

    return (
        <aside className="flex flex-col gap-3 rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-4">
            <header className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Recent
                    </h3>
                </div>
                {entries.length > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearRecent}
                        className="h-6 px-1.5 text-xs text-muted-foreground/60 hover:text-foreground"
                        aria-label="Clear recent predictions"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
            </header>

            {entries.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 leading-relaxed py-1">
                    Predictions you run on this device show up here so you can restore them with one
                    click.
                </p>
            ) : (
                <ul className="flex flex-col gap-1.5">
                    {entries.map((entry) => {
                        const isActive = entry.id === activeId;
                        return (
                            <li key={entry.id}>
                                <button
                                    type="button"
                                    onClick={() => onRestore(payloadToFormValues(entry.payload), entry)}
                                    className={`w-full flex flex-col gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-colors active:scale-[0.99] ${
                                        isActive
                                            ? 'bg-primary/10 border-primary/30'
                                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 min-w-0">
                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground truncate">
                                            <Pill className="h-3 w-3 text-primary flex-shrink-0" />
                                            {entry.treatment}
                                        </span>
                                        <span
                                            className={`flex items-center gap-1 text-xs font-bold tabular-nums ${tierStyle(
                                                entry.confidenceLabel,
                                            )}`}
                                        >
                                            <ShieldCheck className="h-3 w-3" />
                                            {entry.confidencePct.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                                        <Clock className="h-2.5 w-2.5" />
                                        <span>{formatRelative(entry.timestamp)}</span>
                                        <span aria-hidden="true">·</span>
                                        <span className="truncate">
                                            Age {entry.payload.age} · HbA1c{' '}
                                            {entry.payload.hba1c_baseline.toFixed(1)}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            <p className="text-xs text-muted-foreground/40 leading-relaxed pt-2 border-t border-white/[0.06]">
                Stored on this device only. Up to 5 entries.
            </p>
        </aside>
    );
}
