'use client';

import { Card } from '@/src/components/shadcn/card';
import { Demographics } from '../../api/similar-patients.types';
import { User, ClipboardList, CheckCircle, CircleAlert } from 'lucide-react';

interface DemographicsSectionProps {
    demographics: Demographics;
    comorbidities: string[];
}

export function DemographicsSection({ demographics, comorbidities }: DemographicsSectionProps) {
    const demoFields = [
        { label: 'Age', value: `${demographics.age} years` },
        { label: 'Gender', value: demographics.gender },
        { label: 'Ethnicity', value: demographics.ethnicity },
        { label: 'Age Group', value: demographics.age_group },
    ];

    return (
        <div className="flex flex-col gap-5">
            {/* Demographics */}
            <Card className="border-white/[0.08] bg-white/[0.03] rounded-none p-5">
                <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-3 mb-4 border-b border-white/[0.08] flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Demographics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {demoFields.map((f) => (
                        <div key={f.label} className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1.5">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                                {f.label}
                            </span>
                            <span className="text-[13px] font-semibold text-foreground block">
                                {f.value}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Comorbidities */}
            <Card className="border-white/[0.08] bg-white/[0.03] rounded-none p-5">
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/[0.08]">
                    <ClipboardList className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider flex-1">
                        Comorbidities
                    </h3>
                    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-primary/15 border border-primary/30 rounded-none text-[10px] font-bold text-primary">
                        {comorbidities.length}
                    </span>
                </div>

                {comorbidities.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2.5">
                        {comorbidities.map((c, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2.5 p-2.5 bg-red-500/[0.08] border border-red-500/15 rounded-none text-[12px] text-foreground/90 font-medium"
                            >
                                <CircleAlert className="h-3 w-3 text-red-400 flex-shrink-0" />
                                <span>{c}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <CheckCircle className="h-7 w-7 text-primary mb-3" />
                        <p className="text-[13px] text-muted-foreground/60">No comorbidities reported</p>
                    </div>
                )}
            </Card>
        </div>
    );
}