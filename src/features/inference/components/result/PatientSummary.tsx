/**
 * PatientSummary — echoes the `patient` section of a PredictionResponse.
 *
 * Spec §5 note: binary comorbidity fields (`cvd`, `ckd`, `nafld`,
 * `hypertension`) are already "Yes"/"No" strings here — they are
 * presentation-formatted server-side by `extract_patient_context()`.
 * Render them verbatim rather than coercing back to integers.
 */

'use client';

import { PatientContext } from '../../api/inference.types';
import { User } from 'lucide-react';

interface PatientSummaryProps {
    patient: PatientContext;
}

interface FieldRow {
    label: string;
    value: string;
    unit?: string;
}

function formatNumber(n: number, digits: number): string {
    return Number.isInteger(n) ? String(n) : n.toFixed(digits);
}

export function PatientSummary({ patient }: PatientSummaryProps) {
    const clinical: FieldRow[] = [
        { label: 'Age', value: String(patient.age), unit: 'years' },
        { label: 'BMI', value: formatNumber(patient.bmi, 1), unit: 'kg/m²' },
        { label: 'Systolic BP', value: formatNumber(patient.bpSystolic, 0), unit: 'mmHg' },
        { label: 'HbA1c (baseline)', value: formatNumber(patient.hba1cBaseline, 1), unit: '%' },
        { label: 'Diabetes duration', value: formatNumber(patient.diabetesDuration, 1), unit: 'years' },
        { label: 'Fasting glucose', value: formatNumber(patient.fastingGlucose, 0), unit: 'mg/dL' },
        { label: 'C-peptide', value: formatNumber(patient.cPeptide, 2), unit: 'ng/mL' },
        { label: 'eGFR', value: formatNumber(patient.egfr, 0), unit: 'mL/min/1.73m²' },
        { label: 'LDL', value: formatNumber(patient.ldl, 0), unit: 'mg/dL' },
        { label: 'HDL', value: formatNumber(patient.hdl, 0), unit: 'mg/dL' },
        { label: 'Triglycerides', value: formatNumber(patient.triglycerides, 0), unit: 'mg/dL' },
    ];

    // Server returns "Yes"/"No" strings for these — surface as-is.
    const comorbidities: FieldRow[] = [
        { label: 'CVD', value: patient.cvd },
        { label: 'CKD', value: patient.ckd },
        { label: 'NAFLD', value: patient.nafld },
        { label: 'Hypertension', value: patient.hypertension },
    ];

    return (
        <div className="border border-primary/20 bg-background/60 p-5">
            <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-md font-semibold text-foreground">Patient context</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 mb-4">
                {clinical.map((f) => (
                    <FieldCell key={f.label} {...f} />
                ))}
            </div>

            <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Comorbidities
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {comorbidities.map((f) => (
                        <div key={f.label} className="flex items-center justify-between border border-white/10 px-3 py-2">
                            <span className="text-sm text-muted-foreground">{f.label}</span>
                            <span
                                className={`text-sm font-semibold ${
                                    f.value === 'Yes' ? 'text-warning' : 'text-muted-foreground/70'
                                }`}
                            >
                                {f.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FieldCell({ label, value, unit }: FieldRow) {
    return (
        <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
            </p>
            <p className="text-md font-semibold text-foreground mt-0.5">
                {value}
                {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
            </p>
        </div>
    );
}
