'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import { SimilarPatientDetail } from '../../api/similar-patients.types';
import {
    ArrowLeft,
    IdCard,
    User,
    ChartLine,
    Pill,
    CheckCircle,
    XCircle,
} from 'lucide-react';

interface DetailHeaderProps {
    patientCase: SimilarPatientDetail;
}

export function DetailHeader({ patientCase }: DetailHeaderProps) {
    const router = useRouter();

    const stats = [
        {
            icon: User,
            label: 'Demographics',
            value: `${patientCase.demographics.age} yrs • ${patientCase.demographics.gender}`,
            accent: 'text-blue-400 bg-blue-500/[0.12] border-blue-500/20',
        },
        {
            icon: ChartLine,
            label: 'HbA1c Baseline',
            value: `${patientCase.clinical_features.hba1c_baseline}%`,
            accent: 'text-primary bg-primary/[0.12] border-primary/20',
        },
        ...(patientCase.treatment
            ? [{
                icon: Pill,
                label: 'Treatment',
                value: patientCase.treatment.drug_name,
                accent: 'text-purple-400 bg-purple-500/[0.12] border-purple-500/20',
            }]
            : []),
        ...(patientCase.outcome
            ? [{
                icon: patientCase.outcome.success ? CheckCircle : XCircle,
                label: 'Outcome',
                value: patientCase.outcome.outcome_category,
                accent: patientCase.outcome.success
                    ? 'text-primary bg-primary/[0.12] border-primary/20'
                    : 'text-red-400 bg-red-500/[0.12] border-red-500/20',
            }]
            : []),
    ];

    return (
        <div className="mb-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="rounded-none h-8 px-3.5 text-[12px] font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground mb-5"
            >
                <ArrowLeft className="h-3 w-3 mr-1.5" />
                Back
            </Button>

            <Card className="border-white/[0.08] bg-white/[0.03] rounded-none p-5">
                {/* Title */}
                <div className="mb-5 pb-4 border-b border-white/[0.08]">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-primary/[0.12] border border-primary/20 rounded-none text-[11px] font-semibold text-primary mb-3">
                        <IdCard className="h-3 w-3" />
                        <span>{patientCase.patient_id}</span>
                    </div>
                    <h1 className="text-[24px] font-bold text-foreground tracking-tight mb-1">
                        Similar Patient Case
                    </h1>
                    <p className="text-[12px] text-muted-foreground/50">
                        Historical case from training dataset
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                    {stats.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="flex items-center gap-3 p-3.5 bg-white/[0.02] border border-white/5 rounded-none hover:bg-white/[0.04] transition-colors">
                                <div className={`w-10 h-10 rounded-none border flex items-center justify-center flex-shrink-0 ${s.accent}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col gap-px min-w-0">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                        {s.label}
                                    </span>
                                    <span className="text-[13px] font-semibold text-foreground truncate">
                                        {s.value}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}