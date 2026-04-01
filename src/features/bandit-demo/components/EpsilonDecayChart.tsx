'use client';

import { useMemo } from 'react';
import { Card } from '@/src/components/shadcn/card';
import { HistoryEntry } from '../types';
import { Activity } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

interface EpsilonDecayChartProps {
    history: HistoryEntry[];
    minEpsilon: number;
}

export function EpsilonDecayChart({ history, minEpsilon }: EpsilonDecayChartProps) {
    const chartData = useMemo(() => {
        if (history.length === 0) return [];

        const step = Math.max(1, Math.floor(history.length / 80));
        const data: { step: number; epsilon: number; exploreRate: number }[] = [];

        for (let i = 0; i < history.length; i += step) {
            const windowStart = Math.max(0, i - 20);
            const window = history.slice(windowStart, i + 1);
            const exploreCount = window.filter((h) => h.explored).length;

            data.push({
                step: history[i].step,
                epsilon: parseFloat((history[i].epsilon * 100).toFixed(2)),
                exploreRate: parseFloat(((exploreCount / window.length) * 100).toFixed(1)),
            });
        }

        // Always include last point
        const last = history[history.length - 1];
        const windowStart = Math.max(0, history.length - 21);
        const window = history.slice(windowStart);
        const exploreCount = window.filter((h) => h.explored).length;
        data.push({
            step: last.step,
            epsilon: parseFloat((last.epsilon * 100).toFixed(2)),
            exploreRate: parseFloat(((exploreCount / window.length) * 100).toFixed(1)),
        });

        return data;
    }, [history]);

    if (chartData.length < 2) {
        return (
            <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5">
                <div className="flex items-center gap-2.5">
                    <Activity className="h-4.5 w-4.5 text-primary" />
                    <p className="text-md text-muted-foreground">
                        Waiting for data to build epsilon decay chart...
                    </p>
                </div>
            </Card>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0].payload;
        return (
            <div className="bg-background/95 border border-white/10 p-3 text-sm">
                <p className="text-muted-foreground mb-1.5">Patient #{d.step}</p>
                <div className="flex flex-col gap-1">
                    <span className="text-warning">
                        ε = <span className="font-semibold">{d.epsilon}%</span>
                    </span>
                    <span className="text-info">
                        Thompson explore rate: <span className="font-semibold">{d.exploreRate}%</span>
                    </span>
                </div>
            </div>
        );
    };

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2.5 mb-1.5">
                    <Activity className="h-4.5 w-4.5 text-primary" />
                    Epsilon Decay & Exploration Rate
                </h2>
                <p className="text-base text-muted-foreground">
                    As epsilon decays, Thompson sampling transitions from exploring random treatments to exploiting the best posterior estimate
                </p>
            </div>

            <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="step"
                            tick={{ fill: '#7daa96', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickLine={false}
                            label={{ value: 'Patient #', position: 'insideBottomRight', offset: -5, fill: '#7daa96', fontSize: 10 }}
                        />
                        <YAxis
                            tick={{ fill: '#7daa96', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickLine={false}
                            tickFormatter={(v) => `${v}%`}
                            domain={[0, 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            y={minEpsilon * 100}
                            stroke="var(--destructive)"
                            strokeOpacity={0.4}
                            strokeDasharray="4 4"
                            label={{ value: `Min ε (${(minEpsilon * 100).toFixed(0)}%)`, fill: 'var(--destructive)', fontSize: 10, position: 'right' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="epsilon"
                            stroke="var(--warning)"
                            fill="var(--warning)"
                            fillOpacity={0.15}
                            strokeWidth={2}
                            isAnimationActive={false}
                            name="Epsilon (ε)"
                        />
                        <Area
                            type="monotone"
                            dataKey="exploreRate"
                            stroke="var(--info)"
                            fill="var(--info)"
                            fillOpacity={0.1}
                            strokeWidth={1.5}
                            strokeDasharray="4 2"
                            isAnimationActive={false}
                            name="Thompson Explore Rate"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-4 h-0.5 bg-warning" />
                    Epsilon (ε) — exploration probability
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-4 h-0.5 bg-info border-dashed" style={{ borderTop: '1.5px dashed #3b82f6', height: 0 }} />
                    Actual Thompson explore rate
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-4 h-0.5 bg-red-500 opacity-40" style={{ borderTop: '1.5px dashed #ef4444', height: 0 }} />
                    Min epsilon floor
                </div>
            </div>
        </Card>
    );
}
