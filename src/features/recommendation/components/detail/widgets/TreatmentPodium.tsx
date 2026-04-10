'use client';

import { BarChart3, Crown, Medal, Trophy } from 'lucide-react';

import type {
    PredictionResponse,
    TreatmentLabel,
} from '../../../api/recommendations.types';

interface TreatmentPodiumProps {
    prediction: PredictionResponse;
}

const RANK_ICONS = [Trophy, Crown, Medal];
const RANK_TONES = [
    'text-primary border-primary/30 bg-primary/[0.08]',
    'text-info border-info/30 bg-info/[0.08]',
    'text-warning border-warning/30 bg-warning/[0.08]',
];

/**
 * Visualises the full Thompson win-rate ranking. The top three treatments
 * get a podium card each (with a rank badge); every treatment also appears
 * in a horizontal-bar chart so the doctor can compare the full distribution
 * at a glance.
 */
export function TreatmentPodium({ prediction }: TreatmentPodiumProps) {
    const winRates = prediction.winRates ?? {};
    const entries = (Object.entries(winRates) as [TreatmentLabel, number][])
        .map(([t, v]) => [t, Number(v) || 0] as [TreatmentLabel, number])
        .sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
        return null;
    }

    const max = Math.max(...entries.map(([, v]) => v), 1e-6);
    const top3 = entries.slice(0, 3);

    return (
        <section
            aria-labelledby="podium-heading"
            className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-5"
        >
            <header className="flex items-center gap-2.5 mb-4">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h3 id="podium-heading" className="text-md font-semibold text-foreground">
                    Thompson win rates
                </h3>
            </header>

            {/* Top-3 podium */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {top3.map(([treatment, rate], idx) => {
                    const Icon = RANK_ICONS[idx];
                    const tone = RANK_TONES[idx];
                    const isRecommended = treatment === prediction.recommendedTreatment;
                    return (
                        <article
                            key={treatment}
                            className={`relative flex flex-col gap-1.5 p-3.5 rounded-lg border ${tone}`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-80">
                                    <Icon className="h-3.5 w-3.5" />
                                    Rank {idx + 1}
                                </span>
                                {isRecommended && (
                                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-lg bg-primary/20 text-primary border border-primary/30">
                                        Picked
                                    </span>
                                )}
                            </div>
                            <p className="text-md font-bold text-foreground truncate">
                                {treatment}
                            </p>
                            <p className="text-xl font-bold tabular-nums">
                                {(rate * 100).toFixed(1)}
                                <span className="text-sm font-semibold ml-0.5">%</span>
                            </p>
                        </article>
                    );
                })}
            </div>

            {/* Full distribution */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    Full distribution
                </p>
                <ul className="space-y-2">
                    {entries.map(([treatment, rate]) => {
                        const pct = (rate / max) * 100;
                        const isRecommended = treatment === prediction.recommendedTreatment;
                        const isRunnerUp = treatment === prediction.runnerUp;
                        const barTone = isRecommended
                            ? 'bg-primary'
                            : isRunnerUp
                              ? 'bg-info/70'
                              : 'bg-white/15';
                        return (
                            <li
                                key={treatment}
                                className="grid grid-cols-[120px_1fr_56px] items-center gap-3 text-sm"
                            >
                                <span
                                    className={`truncate ${
                                        isRecommended
                                            ? 'font-semibold text-foreground'
                                            : 'text-muted-foreground'
                                    }`}
                                    title={treatment}
                                >
                                    {treatment}
                                </span>
                                <div className="relative h-2 rounded-lg bg-white/[0.04] overflow-hidden">
                                    <div
                                        className={`absolute inset-y-0 left-0 rounded-lg ${barTone}`}
                                        style={{
                                            width: `${pct}%`,
                                            transition: 'width 600ms ease-out',
                                        }}
                                    />
                                </div>
                                <span className="text-right tabular-nums text-muted-foreground">
                                    {(rate * 100).toFixed(1)}%
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
