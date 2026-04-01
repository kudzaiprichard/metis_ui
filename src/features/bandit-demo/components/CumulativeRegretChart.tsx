/**
 * CumulativeRegretChart — spec §6.5 "Running Aggregates".
 *
 * The spec treats sub-linear regret growth as *the* primary learning signal:
 *
 *   > Should grow slower over time (sub-linear) as the model improves.
 *   > A linear growth indicates no learning.
 *
 * To let users eyeball sub-linearity we overlay a dashed linear reference
 * line. The baseline slope is estimated from an early window (first 10% of
 * steps, capped at 50) — the period before Thompson sampling has had time to
 * converge. If actual regret bends below this line, the bandit is learning.
 *
 * Data source: each step event carries `cumulativeRegret`, which we store on
 * `HistoryEntry` so the chart can be plotted without recomputing.
 */

'use client';

import { useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Card } from '@/src/components/shadcn/card';

import type { HistoryEntry } from '../types';

interface CumulativeRegretChartProps {
    history: HistoryEntry[];
}

interface RegretPoint {
    step: number;
    regret: number;
    baseline: number;
}

export function CumulativeRegretChart({ history }: CumulativeRegretChartProps) {
    const chartData = useMemo<RegretPoint[]>(() => {
        if (history.length < 2) return [];

        // Down-sample to ~80 points for smooth rendering on long runs.
        const stride = Math.max(1, Math.floor(history.length / 80));
        const samples: HistoryEntry[] = [];
        for (let i = 0; i < history.length; i += stride) samples.push(history[i]);
        const last = history[history.length - 1];
        if (samples[samples.length - 1] !== last) samples.push(last);

        // Slope estimate from an early window (first 10% or 50 steps, whichever
        // is smaller) — proxies a "no-learning" regret accumulation rate.
        const earlyEndIdx = Math.max(
            1,
            Math.min(history.length - 1, Math.min(50, Math.ceil(history.length * 0.1))),
        );
        const early = history[earlyEndIdx];
        const earlySlope = early.step > 0 ? early.cumulativeRegret / early.step : 0;

        return samples.map((s) => ({
            step: s.step,
            regret: parseFloat(s.cumulativeRegret.toFixed(3)),
            baseline: parseFloat((earlySlope * s.step).toFixed(3)),
        }));
    }, [history]);

    if (chartData.length < 2) {
        return (
            <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5">
                <div className="flex items-center gap-2.5">
                    <TrendingDown className="h-4 w-4 text-rose-400" />
                    <p className="text-md text-muted-foreground">
                        Waiting for data to build cumulative regret chart…
                    </p>
                </div>
            </Card>
        );
    }

    const last = chartData[chartData.length - 1];
    const savingsVsBaseline = last.baseline > 0 ? (1 - last.regret / last.baseline) * 100 : 0;
    const isBending = savingsVsBaseline > 5;

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5">
            <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2.5 mb-1.5">
                        <TrendingDown className="h-4 w-4 text-rose-400" />
                        Cumulative Regret
                    </h2>
                    <p className="text-base text-muted-foreground">
                        Σ (oracle optimal − chosen reward). A learning bandit bends sub-linear; a linear curve means no learning.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-white/[0.04] rounded-lg">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                        vs early-rate baseline
                    </span>
                    <span
                        className={`text-base font-bold tabular-nums ${
                            isBending ? 'text-emerald-300' : 'text-warning'
                        }`}
                    >
                        {savingsVsBaseline >= 0 ? '−' : '+'}
                        {Math.abs(savingsVsBaseline).toFixed(1)}%
                    </span>
                </div>
            </div>

            <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="step"
                            tick={{ fill: '#7daa96', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickLine={false}
                            label={{
                                value: 'Patient #',
                                position: 'insideBottomRight',
                                offset: -5,
                                fill: '#7daa96',
                                fontSize: 10,
                            }}
                        />
                        <YAxis
                            tick={{ fill: '#7daa96', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickLine={false}
                            domain={[0, 'auto']}
                        />
                        <Tooltip content={<RegretTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="regret"
                            stroke="#f43f5e"
                            fill="#f43f5e"
                            fillOpacity={0.18}
                            strokeWidth={2}
                            isAnimationActive={false}
                            name="Cumulative regret"
                        />
                        <Line
                            type="linear"
                            dataKey="baseline"
                            stroke="rgba(148,163,184,0.6)"
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            dot={false}
                            isAnimationActive={false}
                            name="Linear projection (no-learning)"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-4 h-0.5 bg-rose-400" />
                    Cumulative regret
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div
                        className="w-4"
                        style={{ borderTop: '1.5px dashed rgba(148,163,184,0.6)', height: 0 }}
                    />
                    Early-rate linear projection
                </div>
            </div>
        </Card>
    );
}

function RegretTooltip({ active, payload }: { active?: boolean; payload?: { payload: RegretPoint }[] }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const delta = d.baseline > 0 ? (1 - d.regret / d.baseline) * 100 : 0;
    return (
        <div className="bg-background/95 border border-white/10 p-3 text-sm">
            <p className="text-muted-foreground mb-1.5">Patient #{d.step}</p>
            <div className="flex flex-col gap-1">
                <span className="text-rose-300">
                    Regret: <span className="font-semibold tabular-nums">{d.regret.toFixed(2)}</span>
                </span>
                <span className="text-slate-300">
                    Baseline: <span className="font-semibold tabular-nums">{d.baseline.toFixed(2)}</span>
                </span>
                <span className={delta >= 0 ? 'text-emerald-300' : 'text-warning'}>
                    {delta >= 0 ? '−' : '+'}
                    {Math.abs(delta).toFixed(1)}% vs baseline
                </span>
            </div>
        </div>
    );
}
