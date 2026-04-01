/**
 * AggregateMetricsStrip — secondary row of running aggregate metrics that the
 * spec (§6.5 "Running Aggregates" + §6.3 "Event: complete") exposes but the
 * original dashboard omitted.
 *
 *   • Cumulative reward      — live, from SSE step event
 *   • Cumulative regret      — live, from SSE step event
 *   • Mean reward            — derived live; replaced with backend value once
 *                              the `complete` event delivers finalAggregates
 *   • Mean regret            — same pattern as mean reward
 *   • Thompson explore rate  — running fraction of steps where `explored=true`;
 *                              once COMPLETED we show the backend's exact value
 *
 * During a live run every value is derived client-side from the step event
 * stream. On completion the backend-provided values take precedence because
 * they're the canonical totals (rounding-free).
 */

'use client';

import { Card } from '@/src/components/shadcn/card';
import { Coins, Compass, DollarSign, Gauge, TrendingDown } from 'lucide-react';

import type {
    HistoryEntry,
    SimulationAggregatesResponse,
    SSECompleteEvent,
} from '../types';

interface AggregateMetricsStripProps {
    step: number;
    cumulativeReward: number;
    cumulativeRegret: number;
    history: HistoryEntry[];
    finalAggregates: SSECompleteEvent | null;
    simulationAggregates: SimulationAggregatesResponse | null;
}

export function AggregateMetricsStrip({
    step,
    cumulativeReward,
    cumulativeRegret,
    history,
    finalAggregates,
    simulationAggregates,
}: AggregateMetricsStripProps) {
    const hasData = step > 0;

    // Prefer backend values post-completion; otherwise derive from the stream.
    const meanReward =
        simulationAggregates?.meanReward ??
        finalAggregates?.mean_reward ??
        (hasData ? cumulativeReward / step : 0);
    const meanRegret =
        simulationAggregates?.meanRegret ??
        finalAggregates?.mean_regret ??
        (hasData ? cumulativeRegret / step : 0);

    // Thompson exploration rate: fraction of steps where the bandit deviated
    // from the greedy posterior mean. We compute it live from history.explored
    // and override once the backend delivers the final value.
    const liveExploreRate = hasData
        ? history.filter((h) => h.explored).length / history.length
        : 0;
    const thompsonRate =
        simulationAggregates?.thompsonExplorationRate ??
        finalAggregates?.thompson_exploration_rate ??
        liveExploreRate;

    const metrics: MetricCardProps[] = [
        {
            label: 'Cumulative Reward',
            value: cumulativeReward.toFixed(2),
            icon: Coins,
            tone: 'text-emerald-300',
            iconBg: 'bg-emerald-500/10 border-emerald-400/20',
            hint: 'Σ observed reward',
        },
        {
            label: 'Cumulative Regret',
            value: cumulativeRegret.toFixed(2),
            icon: TrendingDown,
            tone: 'text-rose-300',
            iconBg: 'bg-rose-500/10 border-rose-400/20',
            hint: 'Σ oracle − chosen · should bend flat',
        },
        {
            label: 'Mean Reward',
            value: meanReward.toFixed(3),
            icon: DollarSign,
            tone: 'text-emerald-300/90',
            iconBg: 'bg-emerald-500/10 border-emerald-400/20',
            hint: 'reward / step',
        },
        {
            label: 'Mean Regret',
            value: meanRegret.toFixed(3),
            icon: Gauge,
            tone: 'text-rose-300/90',
            iconBg: 'bg-rose-500/10 border-rose-400/20',
            hint: 'regret / step',
        },
        {
            label: 'Thompson Explore Rate',
            value: `${(thompsonRate * 100).toFixed(1)}%`,
            icon: Compass,
            tone: 'text-info',
            iconBg: 'bg-info/10 border-info/20',
            hint: 'explored / total',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {metrics.map((m) => (
                <MetricCard key={m.label} {...m} />
            ))}
        </div>
    );
}

interface MetricCardProps {
    label: string;
    value: string;
    icon: React.ElementType;
    tone: string;
    iconBg: string;
    hint: string;
}

function MetricCard({ label, value, icon: Icon, tone, iconBg, hint }: MetricCardProps) {
    return (
        <Card className="border-white/[0.08] bg-white/[0.03] rounded-lg p-3 flex items-center gap-3 hover:bg-white/[0.05] transition-colors">
            <div
                className={`w-9 h-9 rounded-lg ${iconBg} border flex items-center justify-center flex-shrink-0`}
            >
                <Icon className={`h-4 w-4 ${tone}`} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {label}
                </span>
                <span className={`text-lg font-bold tabular-nums tracking-tight ${tone}`}>
                    {value}
                </span>
                <span className="text-xs text-muted-foreground/70">{hint}</span>
            </div>
        </Card>
    );
}
