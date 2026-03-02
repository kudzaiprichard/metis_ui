'use client';

import { Card } from '@/src/components/shadcn/card';
import { Outcome } from '../../api/similar-patients.types';
import {
    CheckCircle,
    XCircle,
    Trophy,
    TriangleAlert,
    TrendingDown,
    ChartLine,
    Clock,
    CircleAlert,
    Lightbulb,
} from 'lucide-react';

interface OutcomeSectionProps {
    outcome: Outcome;
}

export function OutcomeSection({ outcome }: OutcomeSectionProps) {
    const hba1cReduction = parseFloat(outcome.hba1c_reduction);
    const hba1cFollowup = parseFloat(outcome.hba1c_followup);
    const hasAdverse = outcome.adverse_events && outcome.adverse_events.trim() !== '' && outcome.adverse_events.toLowerCase() !== 'none';

    return (
        <div className="flex flex-col gap-5">
            {/* Outcome Status */}
            <Card className={`rounded-none p-5 ${outcome.success ? 'border-primary/15 bg-primary/[0.05]' : 'border-red-500/15 bg-red-500/[0.05]'}`}>
                <h3 className={`text-[12px] font-bold uppercase tracking-wider pb-3 mb-4 border-b border-white/[0.08] flex items-center gap-2 ${outcome.success ? 'text-primary' : 'text-red-400'}`}>
                    {outcome.success ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    Treatment Outcome
                </h3>
                <div className="flex flex-col items-center gap-4 py-5 text-center">
                    <div className={`flex flex-col items-center gap-3 px-8 py-5 rounded-none border-2 ${outcome.success ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-red-500/15 border-red-500/30 text-red-400'}`}>
                        {outcome.success
                            ? <Trophy className="h-10 w-10" />
                            : <TriangleAlert className="h-10 w-10" />
                        }
                        <span className="text-[18px] font-bold">{outcome.outcome_category}</span>
                    </div>
                    <p className="text-[13px] text-muted-foreground/70 max-w-[500px]">
                        {outcome.success
                            ? 'Treatment achieved desired therapeutic goals'
                            : 'Treatment did not meet expected outcomes'}
                    </p>
                </div>
            </Card>

            {/* HbA1c Results */}
            <div className="grid grid-cols-3 gap-5">
                {[
                    { icon: TrendingDown, label: 'HbA1c Reduction', value: hba1cReduction.toFixed(2), unit: '%', sub: 'Absolute reduction achieved', color: 'text-primary' },
                    { icon: ChartLine, label: 'HbA1c Follow-up', value: hba1cFollowup.toFixed(2), unit: '%', sub: 'Final HbA1c level', color: 'text-blue-400' },
                    { icon: Clock, label: 'Time to Target', value: outcome.time_to_target, unit: '', sub: 'Duration to reach goal', color: 'text-orange-400' },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <Card key={item.label} className="border-white/[0.08] bg-white/[0.03] rounded-none p-5">
                            <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-3 mb-4 border-b border-white/[0.08] flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5" />
                                {item.label}
                            </h3>
                            <div className="flex flex-col items-center gap-3 py-4">
                                <div className={`flex items-baseline gap-1 ${item.color}`}>
                                    {item.unit ? (
                                        <>
                                            <span className="text-[32px] font-bold tracking-tight">{item.value}</span>
                                            <span className="text-[18px] font-semibold opacity-80">{item.unit}</span>
                                        </>
                                    ) : (
                                        <span className="text-[16px] font-bold">{item.value}</span>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground/50 text-center">{item.sub}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Adverse Events */}
            <Card className="border-white/[0.08] bg-white/[0.03] rounded-none p-5">
                <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-3 mb-4 border-b border-white/[0.08] flex items-center gap-2">
                    <TriangleAlert className="h-3.5 w-3.5" />
                    Adverse Events
                </h3>
                {hasAdverse ? (
                    <div className="flex items-start gap-3 p-3.5 bg-orange-500/[0.08] border border-orange-500/20 rounded-none">
                        <CircleAlert className="h-4 w-4 text-orange-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[12px] text-foreground/80 leading-relaxed">{outcome.adverse_events}</p>
                    </div>
                ) : (
                    <div className="flex items-start gap-3 p-3.5 bg-primary/[0.08] border border-primary/20 rounded-none">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-[12px] text-muted-foreground/70 leading-relaxed">No adverse events reported</p>
                    </div>
                )}
            </Card>

            {/* Info Note */}
            <div className="flex gap-3 p-3.5 bg-purple-500/[0.08] border border-purple-500/15 rounded-none">
                <Lightbulb className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                    These outcomes are historical results from a similar patient case. Individual patient
                    responses may vary based on multiple factors including adherence, comorbidities, and
                    individual physiology. Use this information as reference data, not as a guarantee of results.
                </p>
            </div>
        </div>
    );
}