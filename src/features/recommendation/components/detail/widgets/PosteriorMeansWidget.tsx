'use client';

import { Sigma } from 'lucide-react';

import type {
    PredictionResponse,
    TreatmentLabel,
} from '../../../api/recommendations.types';

interface PosteriorMeansWidgetProps {
    prediction: PredictionResponse;
}

/**
 * Compact horizontal-bar view of the posterior reward means. Bars are
 * normalised against the largest absolute value so negative means render
 * to the left of the zero line and positive means to the right. The
 * recommended treatment is highlighted; the runner-up gets a softer
 * accent.
 */
export function PosteriorMeansWidget({ prediction }: PosteriorMeansWidgetProps) {
    const posterior = prediction.posteriorMeans ?? {};
    const entries = (Object.entries(posterior) as [TreatmentLabel, number][]).map(
        ([t, v]) => [t, Number(v) || 0] as [TreatmentLabel, number],
    );

    if (entries.length === 0) return null;

    const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)), 1e-6);

    return (
        <section
            aria-labelledby="posterior-heading"
            className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-5"
        >
            <header className="flex items-center gap-2.5 mb-4">
                <Sigma className="h-4 w-4 text-primary" />
                <h3 id="posterior-heading" className="text-md font-semibold text-foreground">
                    Posterior reward means
                </h3>
            </header>
            <p className="text-xs text-muted-foreground/70 leading-relaxed mb-4">
                Expected reward per treatment after Thompson sampling. Higher is better; bars to the
                left of the zero line are below baseline.
            </p>

            <ul className="space-y-2.5">
                {entries.map(([treatment, mean]) => {
                    const isRecommended = treatment === prediction.recommendedTreatment;
                    const isRunnerUp = treatment === prediction.runnerUp;
                    const widthPct = (Math.abs(mean) / maxAbs) * 50; // half the row each side
                    const barTone = isRecommended
                        ? 'bg-primary'
                        : isRunnerUp
                          ? 'bg-info/70'
                          : 'bg-white/20';
                    return (
                        <li
                            key={treatment}
                            className="grid grid-cols-[120px_1fr_64px] items-center gap-3 text-sm"
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
                                {/* Centre line */}
                                <div className="absolute inset-y-0 left-1/2 w-px bg-white/15" />
                                {mean >= 0 ? (
                                    <div
                                        className={`absolute inset-y-0 left-1/2 rounded-r-lg ${barTone}`}
                                        style={{ width: `${widthPct}%` }}
                                    />
                                ) : (
                                    <div
                                        className={`absolute inset-y-0 right-1/2 rounded-l-lg ${barTone}`}
                                        style={{ width: `${widthPct}%` }}
                                    />
                                )}
                            </div>
                            <span className="text-right tabular-nums font-mono text-foreground">
                                {mean.toFixed(3)}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
