'use client';

import { Award, GitCompareArrows, Pill, ShieldCheck } from 'lucide-react';

import type {
    PredictionResponse,
    SafetyStatus,
} from '../../../api/recommendations.types';

interface KeyStatsStripProps {
    prediction: PredictionResponse;
}

const SAFETY_LABEL: Record<SafetyStatus, string> = {
    CLEAR: 'Clear',
    WARNING: 'Warning',
    CONTRAINDICATION_FOUND: 'Contraindication',
};

const SAFETY_TONE: Record<SafetyStatus, string> = {
    CLEAR: 'text-primary',
    WARNING: 'text-warning',
    CONTRAINDICATION_FOUND: 'text-destructive',
};

interface Tile {
    label: string;
    value: string;
    sub?: string;
    icon: typeof Pill;
    accent: string;
    valueTone?: string;
}

export function KeyStatsStrip({ prediction }: KeyStatsStripProps) {
    const tiles: Tile[] = [
        {
            label: 'Treatment',
            value: prediction.recommendedTreatment,
            sub: 'Recommended pick',
            icon: Pill,
            accent: 'bg-primary/12 border-primary/25 text-primary',
        },
        {
            label: 'Runner-up',
            value: prediction.runnerUp,
            sub: `${(Number(prediction.runnerUpWinRate) * 100).toFixed(1)}% win rate`,
            icon: Award,
            accent: 'bg-info/12 border-info/25 text-info',
        },
        {
            label: 'Mean gap',
            value: Number(prediction.meanGap).toFixed(3),
            sub: 'Reward gap vs runner-up',
            icon: GitCompareArrows,
            accent: 'bg-info/12 border-info/25 text-info',
        },
        {
            label: 'Safety',
            value: SAFETY_LABEL[prediction.safetyStatus] ?? '—',
            sub: 'Recommended-treatment audit',
            icon: ShieldCheck,
            accent:
                prediction.safetyStatus === 'CLEAR'
                    ? 'bg-primary/12 border-primary/25 text-primary'
                    : prediction.safetyStatus === 'WARNING'
                      ? 'bg-warning/12 border-warning/25 text-warning'
                      : 'bg-destructive/12 border-destructive/25 text-destructive',
            valueTone: SAFETY_TONE[prediction.safetyStatus],
        },
    ];

    return (
        <section
            aria-label="Key prediction metrics"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
            {tiles.map((tile) => {
                const Icon = tile.icon;
                return (
                    <article
                        key={tile.label}
                        className="flex items-start gap-3 p-3.5 rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm"
                    >
                        <div
                            className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${tile.accent}`}
                        >
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                {tile.label}
                            </p>
                            <p
                                className={`text-md font-semibold tracking-tight truncate ${
                                    tile.valueTone ?? 'text-foreground'
                                }`}
                            >
                                {tile.value}
                            </p>
                            {tile.sub && (
                                <p className="text-xs text-muted-foreground/60 truncate">
                                    {tile.sub}
                                </p>
                            )}
                        </div>
                    </article>
                );
            })}
        </section>
    );
}
