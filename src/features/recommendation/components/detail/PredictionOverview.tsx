'use client';

import { Card } from '@/src/components/shadcn/card';
import { PredictionDetail } from '../../api/recommendations.types';
import { TreatmentBadge } from '../shared/TreatmentBadge';
import { ConfidenceBadge } from '../shared/ConfidenceBadge';
import { TrendingDown, ShieldCheck, BarChart3, Trophy } from 'lucide-react';

interface PredictionOverviewProps {
    prediction: PredictionDetail;
}

export function PredictionOverview({ prediction }: PredictionOverviewProps) {
    const confidenceScore = parseFloat(prediction.confidence_score);
    const predictedReduction = parseFloat(prediction.predicted_reduction);
    const confidenceMargin = parseFloat(prediction.confidence_margin);

    const stats = [
        {
            label: 'Predicted HbA1c Reduction',
            value: `${predictedReduction.toFixed(2)}%`,
            desc: 'Expected improvement from baseline',
            icon: TrendingDown,
            primary: true,
        },
        {
            label: 'Confidence Score',
            value: `${confidenceScore.toFixed(1)}%`,
            desc: 'Model confidence in prediction',
            icon: ShieldCheck,
            badge: <ConfidenceBadge score={confidenceScore} showLabel={false} />,
        },
        {
            label: 'Confidence Margin',
            value: `${confidenceMargin.toFixed(1)}%`,
            desc: 'Advantage over second-best option',
            icon: BarChart3,
        },
        {
            label: 'Treatment Rank',
            value: `#${prediction.treatment_index}`,
            desc: 'Position in treatment options',
            icon: Trophy,
        },
    ];

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-none p-5 mb-5">
            <h2 className="text-[18px] font-semibold text-foreground flex items-center gap-2.5 mb-5">
                <TrendingDown className="h-4.5 w-4.5 text-primary" />
                Prediction Overview
            </h2>

            {/* Treatment Banner */}
            <div className="p-5 bg-primary/[0.08] border border-primary/15 rounded-none mb-5">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold block mb-3">
                    Recommended Treatment
                </span>
                <TreatmentBadge treatment={prediction.recommended_treatment} variant="large" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className={`flex gap-4 p-4 rounded-none border transition-colors ${
                            s.primary
                                ? 'bg-primary/[0.08] border-primary/15 hover:bg-primary/[0.12]'
                                : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]'
                        }`}
                    >
                        <div className="w-11 h-11 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <s.icon className="h-[18px] w-[18px] text-primary" />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {s.label}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className={`text-[24px] font-bold leading-none tracking-tight ${s.primary ? 'text-primary' : 'text-foreground'}`}>
                                    {s.value}
                                </span>
                                {s.badge}
                            </div>
                            <span className="text-[12px] text-muted-foreground/60">
                                {s.desc}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}