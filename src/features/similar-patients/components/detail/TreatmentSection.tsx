'use client';

import { Card } from '@/src/components/shadcn/card';
import { TreatmentInfo } from '../../api/similar-patients.types';
import { Pill, DollarSign, FlaskConical, Tag, Award, Info } from 'lucide-react';

interface TreatmentSectionProps {
    treatment: TreatmentInfo;
}

export function TreatmentSection({ treatment }: TreatmentSectionProps) {
    const costStyles: Record<string, string> = {
        Low: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
        Medium: 'text-orange-400 bg-orange-500/15 border-orange-500/25',
        High: 'text-red-400 bg-red-500/15 border-red-500/25',
    };

    const evidenceStyles: Record<string, string> = {
        High: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
        Moderate: 'text-blue-400 bg-blue-500/15 border-blue-500/25',
        Low: 'text-orange-400 bg-orange-500/15 border-orange-500/25',
    };

    const costDesc: Record<string, string> = {
        Low: 'Generally affordable and cost-effective',
        Medium: 'Moderately priced treatment option',
        High: 'Premium priced treatment option',
    };

    const evidenceDesc: Record<string, string> = {
        High: 'Strong clinical evidence supporting efficacy',
        Moderate: 'Adequate clinical evidence available',
        Low: 'Limited clinical evidence available',
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Treatment Overview */}
            <Card className="border-primary/15 bg-primary/[0.05] rounded-none p-5">
                <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-3 mb-4 border-b border-white/[0.08] flex items-center gap-2">
                    <Pill className="h-3.5 w-3.5" />
                    Treatment Given
                </h3>
                <div className="flex justify-between items-center gap-5">
                    <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block mb-2">
                            Drug Name
                        </span>
                        <h2 className="text-[24px] font-bold text-primary tracking-tight truncate">
                            {treatment.drug_name}
                        </h2>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-primary/[0.12] border border-primary/25 rounded-none text-[13px] font-semibold text-primary whitespace-nowrap flex-shrink-0">
                        <Pill className="h-3.5 w-3.5" />
                        {treatment.drug_class}
                    </div>
                </div>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-5">
                {/* Cost */}
                <Card className="border-white/[0.08] bg-white/[0.03] rounded-none p-5">
                    <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-3 mb-4 border-b border-white/[0.08] flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5" />
                        Cost Category
                    </h3>
                    <div className="flex flex-col gap-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-none border text-[14px] font-bold w-fit ${costStyles[treatment.cost_category] || 'text-muted-foreground bg-white/[0.06] border-white/10'}`}>
                            <Tag className="h-3.5 w-3.5" />
                            {treatment.cost_category}
                        </div>
                        <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
                            {costDesc[treatment.cost_category]}
                        </p>
                    </div>
                </Card>

                {/* Evidence */}
                <Card className="border-white/[0.08] bg-white/[0.03] rounded-none p-5">
                    <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-3 mb-4 border-b border-white/[0.08] flex items-center gap-2">
                        <FlaskConical className="h-3.5 w-3.5" />
                        Evidence Level
                    </h3>
                    <div className="flex flex-col gap-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-none border text-[14px] font-bold w-fit ${evidenceStyles[treatment.evidence_level] || 'text-muted-foreground bg-white/[0.06] border-white/10'}`}>
                            <Award className="h-3.5 w-3.5" />
                            {treatment.evidence_level}
                        </div>
                        <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
                            {evidenceDesc[treatment.evidence_level]}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Info Note */}
            <div className="flex gap-3 p-3.5 bg-blue-500/[0.08] border border-blue-500/15 rounded-none">
                <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                    This treatment information is from historical data and represents what was administered
                    to this similar patient case. Always consult current clinical guidelines and patient-specific
                    factors when making treatment decisions.
                </p>
            </div>
        </div>
    );
}