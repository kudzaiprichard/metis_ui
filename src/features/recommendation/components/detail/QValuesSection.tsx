'use client';

import { Card } from '@/src/components/shadcn/card';
import { Badge } from '@/src/components/shadcn/badge';
import { PredictionQValue } from '../../api/recommendations.types';
import { Trophy, Pill } from 'lucide-react';

interface QValuesSectionProps {
    qValues: PredictionQValue[];
}

export function QValuesSection({ qValues }: QValuesSectionProps) {
    const sortedQValues = [...qValues].sort((a, b) => a.rank - b.rank);

    const getBarWidth = (qValue: string) => {
        const values = qValues.map(q => parseFloat(q.q_value));
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);
        const range = maxVal - minVal;
        if (range === 0) return 100;
        return ((parseFloat(qValue) - minVal) / range) * 100;
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400';
        if (rank === 2) return 'bg-blue-400/15 border-blue-400/20 text-blue-400';
        if (rank === 3) return 'bg-amber-400/15 border-amber-400/20 text-amber-400';
        return 'bg-white/5 border-white/10 text-muted-foreground';
    };

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-none p-5 mb-5">
            <div className="mb-5">
                <h2 className="text-[18px] font-semibold text-foreground flex items-center gap-2.5 mb-1.5">
                    <Trophy className="h-4.5 w-4.5 text-primary" />
                    Treatment Rankings (Q-Values)
                </h2>
                <p className="text-[13px] text-muted-foreground">
                    All treatment options ranked by predicted effectiveness
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {sortedQValues.map((qv) => {
                    const barWidth = getBarWidth(qv.q_value);
                    const isTop = qv.rank === 1;

                    return (
                        <div
                            key={qv.id}
                            className={`p-4 rounded-none border transition-colors ${
                                isTop
                                    ? 'bg-primary/[0.06] border-primary/15 hover:bg-primary/[0.08]'
                                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]'
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-2.5">
                                <Badge
                                    variant="secondary"
                                    className={`rounded-none w-10 h-10 flex items-center justify-center text-[14px] font-bold border p-0 ${getRankColor(qv.rank)}`}
                                >
                                    #{qv.rank}
                                </Badge>

                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Pill className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                    <span className="text-[15px] font-semibold text-foreground truncate">
                                        {qv.treatment}
                                    </span>
                                </div>

                                <span className="text-[16px] font-bold text-primary flex-shrink-0">
                                    {parseFloat(qv.q_value).toFixed(4)}
                                </span>
                            </div>

                            {/* Bar */}
                            <div className="w-full h-1.5 bg-white/5 rounded-none overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-400 rounded-none transition-all duration-500"
                                    style={{ width: `${barWidth}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}