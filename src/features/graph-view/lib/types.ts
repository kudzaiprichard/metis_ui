import type { Outcome } from './tokens';

export type LayoutType = 'force' | 'tree' | 'cluster' | 'outcome';

export type OutcomeFilter = 'all' | Outcome;

export type TopNFilter = 5 | 10 | 20 | 'all';

export interface Treatment {
    id: string;
    name: string;
    color: string;
    short: string;
}

export interface Patient {
    id: string;
    tx: string;
    out: Outcome;
    sim: number;
    age: number;
    sex: 'F' | 'M';
    hba1c: number;
    bmi: number;
    dHba1c: number;
    dBmi: number;
    /** Backend ships this on every patient node; empty array when none. */
    comorbidities: string[];
}

/** Display-formatted query patient pill for the context strip. */
export interface QueryPatient {
    id: string;
    hba1c: string;
    bmi: string;
    age: string;
    dx: string;
}

/** Numeric query patient vitals — used by the inspector "vs current" math. */
export interface QueryVitals {
    hba1c: number;
    bmi: number;
    age: number;
}

export interface Position {
    x: number;
    y: number;
}

export type SelectedNode =
    | ({ kind: 'patient' } & Patient)
    | ({ kind: 'treatment'; patients: Patient[]; rate: number } & Treatment);
