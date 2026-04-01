/**
 * OutcomesSummaryPanel — final decision-quality distributions from the
 * `complete` SSE event (spec §6.3) or `SimulationAggregatesResponse`
 * (spec §6.5 "Final Aggregates").
 *
 * Rendered once the simulation has finished with aggregates populated. Both
 * distributions are step counts, which we render as horizontal bars so tiers
 * can be compared at a glance.
 *
 *   confidenceDistribution — { HIGH, MODERATE, LOW } decision confidence
 *   safetyDistribution     — { CLEAR, WARNING, CONTRAINDICATION_FOUND }
 *
 * Source priority:
 *   1. simulationAggregates (post-complete camelCase envelope) — canonical.
 *   2. finalAggregates.confidence_distribution / .safety_distribution — the
 *      raw `complete` event payload, as a fallback if camelCase wasn't set
 *      (defensive; shouldn't normally happen).
 */

'use client';

import { BadgeCheck, ShieldAlert } from 'lucide-react';

import { Card } from '@/src/components/shadcn/card';

import type { SimulationAggregatesResponse, SSECompleteEvent } from '../types';

interface OutcomesSummaryPanelProps {
    finalAggregates: SSECompleteEvent | null;
    simulationAggregates: SimulationAggregatesResponse | null;
}

type BucketSpec<K extends string> = {
    key: K;
    label: string;
    tone: string;
    barTone: string;
};

const CONFIDENCE_BUCKETS: BucketSpec<'HIGH' | 'MODERATE' | 'LOW'>[] = [
    { key: 'HIGH', label: 'High', tone: 'text-emerald-300', barTone: 'bg-emerald-400/70' },
    { key: 'MODERATE', label: 'Moderate', tone: 'text-warning', barTone: 'bg-warning/70' },
    { key: 'LOW', label: 'Low', tone: 'text-rose-300', barTone: 'bg-rose-400/70' },
];

const SAFETY_BUCKETS: BucketSpec<'CLEAR' | 'WARNING' | 'CONTRAINDICATION_FOUND'>[] = [
    { key: 'CLEAR', label: 'Clear', tone: 'text-emerald-300', barTone: 'bg-emerald-400/70' },
    { key: 'WARNING', label: 'Warning', tone: 'text-warning', barTone: 'bg-warning/70' },
    {
        key: 'CONTRAINDICATION_FOUND',
        label: 'Contraindication',
        tone: 'text-rose-300',
        barTone: 'bg-rose-400/70',
    },
];

export function OutcomesSummaryPanel({
    finalAggregates,
    simulationAggregates,
}: OutcomesSummaryPanelProps) {
    const confidence =
        simulationAggregates?.confidenceDistribution ??
        finalAggregates?.confidence_distribution ??
        null;
    const safety =
        simulationAggregates?.safetyDistribution ??
        finalAggregates?.safety_distribution ??
        null;

    // Hide entirely while the run is still in flight or the backend didn't
    // return either distribution.
    if (!confidence && !safety) return null;

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2.5 mb-1.5">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    Decision Quality Distribution
                </h2>
                <p className="text-base text-muted-foreground">
                    How confidently — and how safely — the bandit recommended across the run.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {confidence && (
                    <DistributionBlock
                        title="Confidence"
                        icon={BadgeCheck}
                        data={confidence}
                        buckets={CONFIDENCE_BUCKETS}
                    />
                )}
                {safety && (
                    <DistributionBlock
                        title="Safety"
                        icon={ShieldAlert}
                        data={safety}
                        buckets={SAFETY_BUCKETS}
                    />
                )}
            </div>
        </Card>
    );
}

function DistributionBlock<K extends string>({
    title,
    icon: Icon,
    data,
    buckets,
}: {
    title: string;
    icon: React.ElementType;
    data: Record<string, number>;
    buckets: BucketSpec<K>[];
}) {
    const total = buckets.reduce((sum, b) => sum + (data[b.key] ?? 0), 0) || 1;

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {title}
                </h3>
            </div>
            <div className="flex flex-col gap-2.5">
                {buckets.map((b) => {
                    const count = data[b.key] ?? 0;
                    const pct = (count / total) * 100;
                    return (
                        <div key={b.key} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className={`font-semibold ${b.tone}`}>{b.label}</span>
                                <span className="text-muted-foreground tabular-nums">
                                    {count.toLocaleString()}{' '}
                                    <span className="text-muted-foreground/60">
                                        · {pct.toFixed(1)}%
                                    </span>
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-white/[0.04] rounded-lg overflow-hidden">
                                <div
                                    className={`h-full ${b.barTone} transition-[width] duration-300`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
