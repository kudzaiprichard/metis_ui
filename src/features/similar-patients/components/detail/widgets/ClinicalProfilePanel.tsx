'use client';

import { Activity, FlaskConical, HeartPulse, Stethoscope } from 'lucide-react';

import type { ClinicalFeatures } from '../../../api/similar-patients.types';

interface ClinicalProfilePanelProps {
    features: ClinicalFeatures;
}

interface Field {
    label: string;
    value: string | number;
    unit?: string;
    highlight?: boolean;
}

interface Group {
    title: string;
    icon: typeof HeartPulse;
    fields: Field[];
}

export function ClinicalProfilePanel({ features }: ClinicalProfilePanelProps) {
    const groups: Group[] = [
        {
            title: 'Diabetes profile',
            icon: Activity,
            fields: [
                { label: 'HbA1c baseline', value: features.hba1cBaseline.toFixed(1), unit: '%', highlight: true },
                { label: 'Diabetes duration', value: features.diabetesDuration.toFixed(1), unit: 'yrs' },
                { label: 'Fasting glucose', value: features.fastingGlucose.toFixed(0), unit: 'mg/dL' },
                { label: 'C-peptide', value: features.cPeptide.toFixed(2), unit: 'ng/mL' },
                { label: 'Previous prediabetes', value: features.previousPrediabetes ? 'Yes' : 'No' },
            ],
        },
        {
            title: 'Cardiometabolic',
            icon: HeartPulse,
            fields: [
                { label: 'BMI', value: features.bmi.toFixed(1), unit: 'kg/m²', highlight: true },
                { label: 'eGFR', value: features.egfr.toFixed(0), unit: 'mL/min' },
                { label: 'BP systolic', value: features.bpSystolic, unit: 'mmHg' },
                { label: 'BP diastolic', value: features.bpDiastolic, unit: 'mmHg' },
            ],
        },
        {
            title: 'Lipid & liver',
            icon: FlaskConical,
            fields: [
                { label: 'LDL', value: features.ldl.toFixed(0), unit: 'mg/dL' },
                { label: 'HDL', value: features.hdl.toFixed(0), unit: 'mg/dL' },
                { label: 'Triglycerides', value: features.triglycerides.toFixed(0), unit: 'mg/dL' },
                { label: 'ALT', value: features.alt.toFixed(0), unit: 'U/L' },
            ],
        },
    ];

    return (
        <section
            aria-label="Clinical profile"
            className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm overflow-hidden"
        >
            <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Stethoscope className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Reference vitals & labs</h3>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    Snapshot at presentation
                </span>
            </header>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                {groups.map((group) => {
                    const Icon = group.icon;
                    return (
                        <div key={group.title} className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                <Icon className="h-3 w-3" />
                                {group.title}
                            </div>
                            <dl className="flex flex-col gap-1.5">
                                {group.fields.map((f) => (
                                    <div
                                        key={f.label}
                                        className="flex items-baseline justify-between gap-3 px-3 py-2 rounded-md bg-white/[0.025] border border-white/[0.06]"
                                    >
                                        <dt className="text-xs text-muted-foreground/70 truncate">
                                            {f.label}
                                        </dt>
                                        <dd
                                            className={`text-sm font-semibold tabular-nums whitespace-nowrap ${
                                                f.highlight ? 'text-warning' : 'text-foreground'
                                            }`}
                                        >
                                            {f.value}
                                            {f.unit && (
                                                <span className="text-xs font-medium text-muted-foreground/60 ml-1">
                                                    {f.unit.replace('m²', 'm²')}
                                                </span>
                                            )}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

