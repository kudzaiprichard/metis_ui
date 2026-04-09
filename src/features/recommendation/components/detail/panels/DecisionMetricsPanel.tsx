/**
 * DecisionMetricsPanel — surfaces the numeric decision signals on a stored
 * prediction (spec §5 Predictions "PredictionResponse"):
 *
 *   • recommendedTreatment + confidencePct + confidenceLabel tier
 *   • runnerUp + runnerUpWinRate + meanGap
 *   • winRates map, drawn as per-treatment bars (recommended treatment
 *     highlighted, runner-up muted-but-accented, rest baseline)
 *   • posteriorMeans map as a compact auxiliary row
 *
 * Tier colouring follows spec §5 Predictions thresholds — HIGH ≥ 85,
 * MODERATE 60–84, LOW < 60.
 */

'use client';

import { TrendingUp, Medal } from 'lucide-react';

import type {
    ConfidenceLabel,
    PredictionResponse,
    TreatmentLabel,
} from '../../../api/recommendations.types';

const TIER_STYLES: Record<ConfidenceLabel, string> = {
    HIGH: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
    MODERATE: 'text-warning border-warning/30 bg-warning/10',
    LOW: 'text-rose-300 border-rose-400/30 bg-rose-500/10',
};

const TIER_COPY: Record<ConfidenceLabel, string> = {
    HIGH: 'Strong agreement across the Thompson samples.',
    MODERATE: 'Useful signal but check safety and explanation before prescribing.',
    LOW: 'The model is uncertain — weight against clinical judgement.',
};

interface DecisionMetricsPanelProps {
    prediction: PredictionResponse;
}

export function DecisionMetricsPanel({ prediction }: DecisionMetricsPanelProps) {
    const tierStyle = TIER_STYLES[prediction.confidenceLabel] ?? TIER_STYLES.MODERATE;

    return (
        <section className="rounded-lg border border-primary/20 bg-background/60 p-5 space-y-5">
            <header className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Model recommendation
                </p>
                <div className="flex items-baseline flex-wrap gap-3">
                    <h2 className="text-xl font-bold tracking-tight">
                        {prediction.recommendedTreatment}
                    </h2>
                    <span
                        className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${tierStyle}`}
                    >
                        {prediction.confidenceLabel} · {Number(prediction.confidencePct).toFixed(1)}%
                    </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {TIER_COPY[prediction.confidenceLabel]}
                </p>
            </header>

            <RunnerUpStrip
                runnerUp={prediction.runnerUp}
                runnerUpWinRate={prediction.runnerUpWinRate}
                meanGap={prediction.meanGap}
            />

            <WinRatesChart
                winRates={prediction.winRates}
                recommendedTreatment={prediction.recommendedTreatment}
                runnerUp={prediction.runnerUp}
            />

            <PosteriorMeansRow posteriorMeans={prediction.posteriorMeans} />
        </section>
    );
}

// ---------------------------------------------------------------------------

function RunnerUpStrip({
    runnerUp,
    runnerUpWinRate,
    meanGap,
}: {
    runnerUp: TreatmentLabel;
    runnerUpWinRate: number;
    meanGap: number;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5">
            <Stat
                icon={<Medal className="h-3.5 w-3.5 text-primary/80" />}
                label="Runner-up"
                value={runnerUp}
                accent={`${(Number(runnerUpWinRate) * 100).toFixed(1)}% win rate`}
            />
            <Stat
                icon={<TrendingUp className="h-3.5 w-3.5 text-primary/80" />}
                label="Mean gap"
                value={Number(meanGap).toFixed(3)}
                accent="reward gap vs runner-up"
            />
        </div>
    );
}

function Stat({
    icon,
    label,
    value,
    accent,
}: {
    icon?: React.ReactNode;
    label: string;
    value: string;
    accent?: string;
}) {
    return (
        <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {icon}
                {label}
            </p>
            <p className="mt-0.5 text-md font-semibold text-foreground">{value}</p>
            {accent && (
                <p className="text-xs text-muted-foreground/80">{accent}</p>
            )}
        </div>
    );
}

function WinRatesChart({
    winRates,
    recommendedTreatment,
    runnerUp,
}: {
    winRates: Record<TreatmentLabel, number>;
    recommendedTreatment: TreatmentLabel;
    runnerUp: TreatmentLabel;
}) {
    if (!winRates || Object.keys(winRates).length === 0) return null;
    const entries = (Object.entries(winRates) as [TreatmentLabel, number][]).sort(
        (a, b) => b[1] - a[1],
    );
    const max = Math.max(...entries.map(([, v]) => Number(v) || 0), 1e-6);

    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Per-treatment win rate
            </p>
            <div className="space-y-2">
                {entries.map(([treatment, rate]) => {
                    const pct = (rate / max) * 100;
                    const isRecommended = treatment === recommendedTreatment;
                    const isRunnerUp = treatment === runnerUp;
                    const barTone = isRecommended
                        ? 'bg-primary/80'
                        : isRunnerUp
                          ? 'bg-primary/35'
                          : 'bg-white/15';
                    return (
                        <div key={treatment} className="grid grid-cols-[120px_1fr_60px] items-center gap-3 text-sm">
                            <span
                                className={`truncate ${
                                    isRecommended ? 'font-semibold text-foreground' : 'text-muted-foreground'
                                }`}
                            >
                                {treatment}
                            </span>
                            <div className="relative h-1.5 bg-white/[0.04] overflow-hidden">
                                <div
                                    className={`absolute inset-y-0 left-0 ${barTone}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="text-right tabular-nums text-muted-foreground">
                                {(Number(rate) * 100).toFixed(1)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PosteriorMeansRow({
    posteriorMeans,
}: {
    posteriorMeans: Record<TreatmentLabel, number>;
}) {
    if (!posteriorMeans) return null;
    const entries = Object.entries(posteriorMeans) as [TreatmentLabel, number][];
    if (entries.length === 0) return null;
    return (
        <div className="pt-3 border-t border-white/5 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Posterior means
            </p>
            <dl className="grid grid-cols-2 sm:grid-cols-5 gap-x-3 gap-y-1.5 text-sm">
                {entries.map(([treatment, mean]) => (
                    <div key={treatment} className="flex flex-col">
                        <dt className="text-xs text-muted-foreground/70 truncate">
                            {treatment}
                        </dt>
                        <dd className="font-mono tabular-nums text-foreground">
                            {mean.toFixed(3)}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
