/**
 * Session history for the stateless inference page.
 *
 * The /inference module never persists predictions server-side, so a
 * doctor running through what-if scenarios has no record of what they
 * just tried. This helper mirrors a small ring buffer of recent attempts
 * in `localStorage` so the inference page can offer a "recent" rail and
 * one-click restore-to-form.
 *
 * Scope: device-local, single-user. Cleared explicitly via `clearRecent`.
 */

import type { PredictRequest } from '../api/inference.types';
import type { ClinicalFeaturesValues } from '@/src/lib/schemas/clinical';

const STORAGE_KEY = 'metis:inference:recent';
const MAX_ENTRIES = 5;

export interface RecentEntry {
    id: string;
    timestamp: number;
    payload: PredictRequest;
    treatment: string;
    confidencePct: number;
    confidenceLabel: 'HIGH' | 'MODERATE' | 'LOW';
}

function safeParse(raw: string | null): RecentEntry[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function loadRecent(): RecentEntry[] {
    if (typeof window === 'undefined') return [];
    return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveRecent(entry: Omit<RecentEntry, 'id' | 'timestamp'>): RecentEntry[] {
    if (typeof window === 'undefined') return [];
    const existing = loadRecent();
    const next: RecentEntry[] = [
        {
            ...entry,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: Date.now(),
        },
        ...existing,
    ].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('metis:inference-recent-changed'));
    return next;
}

export function clearRecent(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('metis:inference-recent-changed'));
}

/** Maps an entry's payload back into the form's input shape. */
export function payloadToFormValues(payload: PredictRequest): ClinicalFeaturesValues {
    return {
        age: payload.age,
        bmi: payload.bmi,
        hba1c_baseline: payload.hba1c_baseline,
        egfr: payload.egfr,
        diabetes_duration: payload.diabetes_duration,
        fasting_glucose: payload.fasting_glucose,
        c_peptide: payload.c_peptide,
        cvd: payload.cvd,
        ckd: payload.ckd,
        nafld: payload.nafld,
        hypertension: payload.hypertension,
        bp_systolic: payload.bp_systolic,
        ldl: payload.ldl,
        hdl: payload.hdl,
        triglycerides: payload.triglycerides,
        alt: payload.alt,
    };
}
