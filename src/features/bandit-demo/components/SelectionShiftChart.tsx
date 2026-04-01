'use client';

import { useMemo } from 'react';
import { Card } from '@/src/components/shadcn/card';
import { Treatment, HistoryEntry } from '../types';
import { TrendingUp } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface SelectionShiftChartProps {
    history: HistoryEntry[];
    treatments: Treatment[];
    bucketSize?: number;
    /** Plot area height in pixels. Default 280; bump for hero placement. */
    height?: number;
}

export function SelectionShiftChart({
    history,
    treatments,
    bucketSize = 25,
    height = 280,
}: SelectionShiftChartProps) {
    const chartData = useMemo(() => {
        if (history.length < bucketSize) return [];

        const data: Record<string, string | number>[] = [];

        for (let i = 0; i < history.length; i += bucketSize) {
            const slice = history.slice(i, i + bucketSize);
            if (slice.length < Math.min(10, bucketSize)) break;
            const counts = new Array(treatments.length).fill(0);
            slice.forEach((h) => counts[h.selectedIdx]++);
            const total = slice.length;

            const entry: Record<string, string | number> = {
                bucket: `${i + 1}–${Math.min(i + bucketSize, history.length)}`,
            };

            treatments.forEach((t, idx) => {
                entry[t.name] = parseFloat(((counts[idx] / total) * 100).toFixed(1));
            });

            data.push(entry);
        }

        return data;
    }, [history, treatments, bucketSize]);

    if (chartData.length < 1) {
        return (
            <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5">
                <div className="flex items-center gap-2.5">
                    <TrendingUp className="h-4.5 w-4.5 text-primary" />
                    <p className="text-md text-muted-foreground">
                        Waiting for data to build selection shift chart...
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2.5 mb-1.5">
                    <TrendingUp className="h-4.5 w-4.5 text-primary" />
                    Selection Shift Over Time
                </h2>
                <p className="text-base text-muted-foreground">
                    Early: even spread (exploring) → Later: converges on best treatment (exploiting)
                </p>
            </div>

            <div className="w-full" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                            dataKey="bucket"
                            tick={{ fill: '#7daa96', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: '#7daa96', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickLine={false}
                            tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(10,31,26,0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 0,
                                fontSize: 12,
                                color: '#e0ede8',
                            }}
                            itemStyle={{ color: '#e0ede8', fontSize: 12 }}
                            labelStyle={{ color: '#7daa96', fontSize: 11, marginBottom: 4 }}
                            formatter={(value) => `${value}%`}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: 11, color: '#7daa96', paddingTop: 8 }}
                            iconType="square"
                            iconSize={10}
                        />
                        {treatments.map((t) => (
                            <Area
                                key={t.name}
                                type="monotone"
                                dataKey={t.name}
                                stackId="1"
                                stroke={t.color}
                                fill={t.color}
                                fillOpacity={0.7}
                                isAnimationActive={false}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
