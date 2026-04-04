/**
 * Clinical feature metadata for the inference form.
 *
 * Ranges come straight from spec §5 "PredictRequest" — they are the
 * authoritative bounds the backend validates against. The `group` field
 * drives visual grouping in the form; it has no semantic meaning server-side.
 */

import { PredictRequest } from '../api/inference.types';

export type NumericFeatureKey = Exclude<
    keyof PredictRequest,
    'cvd' | 'ckd' | 'nafld' | 'hypertension'
>;

export type BinaryFeatureKey = 'cvd' | 'ckd' | 'nafld' | 'hypertension';

export interface NumericFeatureDef {
    key: NumericFeatureKey;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    kind: 'int' | 'float';
    group: 'demographics' | 'vitals' | 'diabetes' | 'kidney-liver' | 'lipids';
}

export interface BinaryFeatureDef {
    key: BinaryFeatureKey;
    label: string;
    description: string;
}

export const NUMERIC_FEATURES: NumericFeatureDef[] = [
    { key: 'age', label: 'Age', unit: 'years', min: 18, max: 120, step: 1, kind: 'int', group: 'demographics' },
    { key: 'bmi', label: 'BMI', unit: 'kg/m²', min: 10, max: 80, step: 0.1, kind: 'float', group: 'vitals' },
    { key: 'bp_systolic', label: 'Systolic BP', unit: 'mmHg', min: 60, max: 250, step: 1, kind: 'float', group: 'vitals' },
    { key: 'hba1c_baseline', label: 'HbA1c (baseline)', unit: '%', min: 3, max: 20, step: 0.1, kind: 'float', group: 'diabetes' },
    { key: 'diabetes_duration', label: 'Diabetes duration', unit: 'years', min: 0, max: 60, step: 0.5, kind: 'float', group: 'diabetes' },
    { key: 'fasting_glucose', label: 'Fasting glucose', unit: 'mg/dL', min: 50, max: 500, step: 1, kind: 'float', group: 'diabetes' },
    { key: 'c_peptide', label: 'C-peptide', unit: 'ng/mL', min: 0, max: 10, step: 0.1, kind: 'float', group: 'diabetes' },
    { key: 'egfr', label: 'eGFR', unit: 'mL/min/1.73m²', min: 5, max: 200, step: 1, kind: 'float', group: 'kidney-liver' },
    { key: 'alt', label: 'ALT', unit: 'U/L', min: 5, max: 500, step: 1, kind: 'float', group: 'kidney-liver' },
    { key: 'ldl', label: 'LDL cholesterol', unit: 'mg/dL', min: 20, max: 400, step: 1, kind: 'float', group: 'lipids' },
    { key: 'hdl', label: 'HDL cholesterol', unit: 'mg/dL', min: 10, max: 150, step: 1, kind: 'float', group: 'lipids' },
    { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', min: 30, max: 800, step: 1, kind: 'float', group: 'lipids' },
];

export const BINARY_FEATURES: BinaryFeatureDef[] = [
    { key: 'cvd', label: 'Cardiovascular disease', description: 'Prior MI, stroke, HF, or established ASCVD' },
    { key: 'ckd', label: 'Chronic kidney disease', description: 'Diagnosed CKD (any stage)' },
    { key: 'nafld', label: 'Non-alcoholic fatty liver', description: 'Diagnosed NAFLD / MASLD' },
    { key: 'hypertension', label: 'Hypertension', description: 'Diagnosed hypertension or on anti-hypertensives' },
];

export const GROUP_TITLES: Record<NumericFeatureDef['group'], string> = {
    demographics: 'Demographics',
    vitals: 'Vitals',
    diabetes: 'Diabetes profile',
    'kidney-liver': 'Kidney & liver',
    lipids: 'Lipids',
};
