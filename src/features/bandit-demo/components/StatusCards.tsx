'use client';

import { Card } from '@/src/components/shadcn/card';
import { Treatment } from '../types';
import { Users, TrendingUp, Activity, Trophy } from 'lucide-react';

interface StatusCardsProps {
    step: number;
    cumulativeReward: number;
    runningAccuracy: number;
    phase: string;
    bestTreatmentIdx: number;
    treatments: Treatment[];
}

export function StatusCards({
    step,
    cumulativeReward,
    runningAccuracy,
    phase,
    bestTreatmentIdx,
    treatments,
}: StatusCardsProps) {
    const accuracyPct = step > 0 ? (runningAccuracy * 100).toFixed(1) : '0.0';
    const meanReward = step > 0 ? (cumulativeReward / step).toFixed(2) : '0.00';

    const cards = [
        {
            label: 'Patients Treated',
            value: step.toLocaleString(),
            icon: Users,
            color: 'text-primary',
            iconBg: 'bg-primary/15 border-primary/20',
        },
        {
            label: 'Oracle Match Rate',
            value: `${accuracyPct}%`,
            icon: TrendingUp,
            color: 'text-emerald-400',
            iconBg: 'bg-emerald-500/15 border-emerald-500/20',
            subtitle: `Avg reward: ${meanReward}`,
        },
        {
            label: 'Phase',
            value: phase,
            icon: Activity,
            color: 'text-warning',
            iconBg: 'bg-warning/15 border-warning/20',
            small: true,
        },
        {
            label: 'Best Treatment',
            value: treatments[bestTreatmentIdx]?.name ?? '—',
            icon: Trophy,
            color: 'text-info',
            iconBg: 'bg-info/15 border-info/20',
            small: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {cards.map((card) => (
                // min-w-0 + overflow-hidden lets the inner `truncate` actually
                // clip. Without these, grid items default to min-width:auto
                // and the Card grows wide enough to fit a long value like
                // "Exploiting Best Treatment", overflowing its column.
                <Card
                    key={card.label}
                    className="border-white/[0.08] bg-white/[0.03] rounded-lg p-4 flex items-center gap-3 hover:bg-white/[0.05] transition-colors min-w-0 overflow-hidden"
                >
                    <div
                        className={`w-10 h-10 rounded-lg ${card.iconBg} border flex items-center justify-center flex-shrink-0`}
                    >
                        <card.icon className={`h-[18px] w-[18px] ${card.color}`} />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold truncate">
                            {card.label}
                        </span>
                        <span
                            title={card.value}
                            className={`font-bold tracking-tight truncate ${card.color} ${card.small ? 'text-sm' : 'text-lg'}`}
                        >
                            {card.value}
                        </span>
                        {'subtitle' in card && card.subtitle && (
                            <span className="text-[11px] text-muted-foreground truncate">
                                {card.subtitle}
                            </span>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}
