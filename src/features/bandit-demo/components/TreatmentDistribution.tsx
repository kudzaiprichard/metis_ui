'use client';

import { useMemo } from 'react';
import { Card } from '@/src/components/shadcn/card';
import { Badge } from '@/src/components/shadcn/badge';
import { Treatment } from '../types';
import { BarChart3, Star } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer,
    LabelList,
} from 'recharts';

interface TreatmentDistributionProps {
    treatments: Treatment[];
    treatmentCounts: number[];
    runningEstimates: number[];
    bestTreatmentIdx: number;
    step: number;
}

export function TreatmentDistribution({
    treatments,
    treatmentCounts,
    runningEstimates,
    bestTreatmentIdx,
    step,
}: TreatmentDistributionProps) {
    const totalSelections = treatmentCounts.reduce((a, b) => a + b, 0) || 1;

    const chartData = useMemo(() => {
        return treatments.map((t, i) => ({
            name: t.name,
            selected: parseFloat(((treatmentCounts[i] / totalSelections) * 100).toFixed(1)),
            estimated: parseFloat(runningEstimates[i].toFixed(2)),
            count: treatmentCounts[i],
            color: t.color,
            isBest: i === bestTreatmentIdx && step > 20,
        }));
    }, [treatments, treatmentCounts, runningEstimates, totalSelections, bestTreatmentIdx, step]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0].payload;
        return (
            <div className="bg-background/95 border border-white/10 p-3 text-sm">
                <p className="font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                    {d.name}
                    {d.isBest && <Star className="h-3 w-3 text-emerald-400" />}
                </p>
                <div className="flex flex-col gap-1 text-muted-foreground">
                    <span>Selected: <span className="text-foreground font-semibold">{d.count}x</span> ({d.selected}%)</span>
                    <span>Mean reward: <span className="text-foreground font-semibold">{d.estimated}</span></span>
                </div>
            </div>
        );
    };

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2.5 mb-1.5">
                    <BarChart3 className="h-4.5 w-4.5 text-primary" />
                    Treatment Selection Distribution
                </h2>
                <p className="text-base text-muted-foreground">
                    How often each treatment has been selected by the NeuralThompson bandit
                </p>
            </div>

            <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 50, left: 10, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                        <XAxis
                            type="number"
                            tick={{ fill: '#7daa96', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickLine={false}
                            tickFormatter={(v) => `${v}%`}
                            domain={[0, 'auto']}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: '#e0ede8', fontSize: 12, fontWeight: 600 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickLine={false}
                            width={90}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="selected" radius={[0, 0, 0, 0]} barSize={28} isAnimationActive={false}>
                            {chartData.map((entry, idx) => (
                                <Cell
                                    key={idx}
                                    fill={entry.color}
                                    fillOpacity={entry.isBest ? 0.9 : 0.65}
                                    stroke={entry.isBest ? entry.color : 'transparent'}
                                    strokeWidth={entry.isBest ? 1 : 0}
                                />
                            ))}
                            <LabelList
                                dataKey="selected"
                                position="right"
                                formatter={(v) => `${v}%`}
                                style={{ fill: '#7daa96', fontSize: 11, fontWeight: 600 }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-5 gap-3 mt-4">
                {chartData.map((d) => (
                    <div
                        key={d.name}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                            d.isBest
                                ? 'bg-primary/[0.06] border-primary/15'
                                : 'bg-white/[0.03] border-white/[0.08]'
                        }`}
                    >
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                            {d.name}
                        </p>
                        <p className="text-base font-bold text-foreground">{d.count}x</p>
                        <div className="flex items-center justify-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>Mean: <span className="text-foreground">{d.estimated}</span></span>
                        </div>
                        {d.isBest && (
                            <Badge
                                variant="secondary"
                                className="rounded-lg text-xs font-bold px-1.5 py-0 mt-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            >
                                <Star className="h-2 w-2 mr-0.5" />
                                Best
                            </Badge>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}
