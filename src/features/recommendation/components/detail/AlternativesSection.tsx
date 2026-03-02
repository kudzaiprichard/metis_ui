'use client';

import { Card } from '@/src/components/shadcn/card';
import { Badge } from '@/src/components/shadcn/badge';
import { ExplanationAlternative } from '../../api/recommendations.types';
import { ListChecks, Pill, TrendingDown, CircleCheck, CircleX, Lightbulb } from 'lucide-react';

interface AlternativesSectionProps {
    alternatives: ExplanationAlternative[];
}

export function AlternativesSection({ alternatives }: AlternativesSectionProps) {
    const sortedAlternatives = [...alternatives].sort((a, b) => a.rank - b.rank);

    const getRankConfig = (rank: number) => {
        if (rank === 1) return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: '2nd Best' };
        if (rank === 2) return { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', label: '3rd Best' };
        return { color: 'text-muted-foreground', bg: 'bg-white/5', border: 'border-white/10', label: `#${rank + 1}` };
    };

    const prosConsConfig = [
        { key: 'pros' as const, label: 'Advantages', icon: CircleCheck, color: 'text-green-500', border: 'border-l-green-500', bg: 'bg-green-500/[0.06]' },
        { key: 'cons' as const, label: 'Disadvantages', icon: CircleX, color: 'text-red-500', border: 'border-l-red-500', bg: 'bg-red-500/[0.06]' },
        { key: 'when_to_consider' as const, label: 'When to Consider', icon: Lightbulb, color: 'text-purple-400', border: 'border-l-purple-400', bg: 'bg-purple-400/[0.06]' },
    ];

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-none p-5 mb-5">
            <div className="mb-5">
                <h2 className="text-[18px] font-semibold text-foreground flex items-center gap-2.5 mb-1.5">
                    <ListChecks className="h-4.5 w-4.5 text-primary" />
                    Alternative Treatment Options
                </h2>
                <p className="text-[13px] text-muted-foreground">
                    Other viable treatments to consider if primary recommendation is not suitable
                </p>
            </div>

            <div className="flex flex-col gap-5">
                {sortedAlternatives.map((alt) => {
                    const config = getRankConfig(alt.rank);
                    const reduction = parseFloat(alt.predicted_reduction);

                    return (
                        <div
                            key={alt.id}
                            className={`p-5 rounded-none border transition-all hover:-translate-y-0.5 bg-white/[0.03] ${config.border}`}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/[0.08] flex-wrap gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Badge
                                        variant="secondary"
                                        className={`rounded-none text-[12px] font-bold uppercase tracking-wider px-3 py-1.5 border ${config.bg} ${config.border} ${config.color}`}
                                    >
                                        {config.label}
                                    </Badge>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Pill className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                        <span className="text-[16px] font-semibold text-foreground truncate">{alt.treatment}</span>
                                    </div>
                                </div>

                                <Badge
                                    variant="secondary"
                                    className={`rounded-none text-[14px] font-bold px-3.5 py-1.5 border flex-shrink-0 ${config.bg} ${config.border} ${config.color}`}
                                >
                                    <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
                                    {reduction.toFixed(2)}%
                                </Badge>
                            </div>

                            {/* Pros / Cons / Consider */}
                            <div className="flex flex-col gap-3.5">
                                {prosConsConfig.map((section) => (
                                    <div
                                        key={section.key}
                                        className={`p-3 rounded-none border-l-[3px] ${section.border} ${section.bg}`}
                                    >
                                        <div className={`flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider mb-1.5 ${section.color}`}>
                                            <section.icon className="h-3 w-3" />
                                            {section.label}
                                        </div>
                                        <p className="text-[13px] text-foreground/80 leading-relaxed">
                                            {alt[section.key]}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}