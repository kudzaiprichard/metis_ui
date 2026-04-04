'use client';

import { Sparkles } from 'lucide-react';

import type { ClinicalFeaturesValues } from '@/src/lib/schemas/clinical';

interface Preset {
    label: string;
    summary: string;
    accent: 'primary' | 'info' | 'warning';
    values: ClinicalFeaturesValues;
}

const PRESETS: Preset[] = [
    {
        label: 'Type 2 · uncomplicated',
        summary: 'Mid-50s, mild hyperglycaemia, no major comorbidities',
        accent: 'primary',
        values: {
            age: 54,
            bmi: 28.4,
            hba1c_baseline: 7.2,
            egfr: 92,
            diabetes_duration: 4.5,
            fasting_glucose: 138,
            c_peptide: 2.1,
            bp_systolic: 128,
            ldl: 118,
            hdl: 47,
            triglycerides: 162,
            alt: 28,
            cvd: 0,
            ckd: 0,
            nafld: 0,
            hypertension: 0,
        },
    },
    {
        label: 'CKD risk',
        summary: 'Older adult, reduced eGFR, hypertension on board',
        accent: 'info',
        values: {
            age: 67,
            bmi: 30.1,
            hba1c_baseline: 8.1,
            egfr: 48,
            diabetes_duration: 11,
            fasting_glucose: 162,
            c_peptide: 1.7,
            bp_systolic: 145,
            ldl: 124,
            hdl: 41,
            triglycerides: 188,
            alt: 26,
            cvd: 0,
            ckd: 1,
            nafld: 0,
            hypertension: 1,
        },
    },
    {
        label: 'Cardio-metabolic',
        summary: 'Established CVD, dyslipidaemia, obesity',
        accent: 'warning',
        values: {
            age: 61,
            bmi: 33.6,
            hba1c_baseline: 8.7,
            egfr: 78,
            diabetes_duration: 9,
            fasting_glucose: 174,
            c_peptide: 2.4,
            bp_systolic: 138,
            ldl: 142,
            hdl: 36,
            triglycerides: 220,
            alt: 38,
            cvd: 1,
            ckd: 0,
            nafld: 1,
            hypertension: 1,
        },
    },
];

const accentClasses: Record<Preset['accent'], string> = {
    primary: 'text-primary border-primary/25 bg-primary/[0.08]',
    info: 'text-info border-info/25 bg-info/[0.08]',
    warning: 'text-warning border-warning/25 bg-warning/[0.08]',
};

interface PresetsRailProps {
    onApply: (values: ClinicalFeaturesValues) => void;
}

export function PresetsRail({ onApply }: PresetsRailProps) {
    return (
        <aside className="flex flex-col gap-3 rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-4">
            <header className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sample profiles
                </h3>
            </header>

            <p className="text-xs text-muted-foreground/60 leading-relaxed">
                Pre-fill the form with a typical clinical phenotype to see how the model responds.
            </p>

            <ul className="flex flex-col gap-1.5">
                {PRESETS.map((preset) => (
                    <li key={preset.label}>
                        <button
                            type="button"
                            onClick={() => onApply(preset.values)}
                            className={`w-full flex flex-col gap-1 rounded-lg border px-2.5 py-2 text-left transition-colors hover:brightness-110 active:scale-[0.99] ${accentClasses[preset.accent]}`}
                        >
                            <span className="text-xs font-semibold">{preset.label}</span>
                            <span className="text-xs text-foreground/70 leading-snug">
                                {preset.summary}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
