/**
 * Shared zod field schemas — single source of truth for primitive
 * validation rules used across multiple forms.
 *
 * Compose these into form-level schemas under `auth.ts`, `clinical.ts`,
 * `users.ts`, etc. Don't duplicate the rules at the form layer; if a
 * constraint changes, it should change here.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

/** Spec §2.2 / §5 — basic email shape, max 254 to align with RFC 5321. */
export const email = z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long');

/** Spec §2.2 — username 3-100 chars, alnum + dot/underscore/dash. */
export const username = z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must be 100 characters or fewer');

/** Spec §2.2 / §2.8 — first/last name 1-100 chars. */
export const personName = z
    .string()
    .trim()
    .min(1, 'Required')
    .max(100, 'Must be 100 characters or fewer');

/** Spec §2.2 — password 8-128 chars. */
export const password = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or fewer');

// ---------------------------------------------------------------------------
// Clinical-feature ranges (spec §5 PredictRequest)
// ---------------------------------------------------------------------------

const inRange = (label: string, min: number, max: number, integer = false) => {
    let s = z
        .number({ message: `${label} is required` })
        .min(min, `${label} must be ≥ ${min}`)
        .max(max, `${label} must be ≤ ${max}`);
    if (integer) s = s.int(`${label} must be a whole number`);
    return s;
};

export const age = inRange('Age', 18, 120, true);
export const bmi = inRange('BMI', 10, 80);
export const bpSystolic = inRange('Systolic BP', 60, 250);
export const hba1c = inRange('HbA1c', 3, 20);
export const diabetesDuration = inRange('Diabetes duration', 0, 60);
export const fastingGlucose = inRange('Fasting glucose', 50, 500);
export const cPeptide = inRange('C-peptide', 0, 10);
export const egfr = inRange('eGFR', 5, 200);
export const alt = inRange('ALT', 5, 500);
export const ldl = inRange('LDL cholesterol', 20, 400);
export const hdl = inRange('HDL cholesterol', 10, 150);
export const triglycerides = inRange('Triglycerides', 30, 800);

/** Binary comorbidity flag — accepts the API's 0/1 integer encoding. */
export const binaryFlag = z
    .union([z.literal(0), z.literal(1)], { message: 'Required' });
