/**
 * Clinical-feature schemas — the 16 fields the ML model expects, used by both
 * the inference form (`PredictionForm`) and the medical-record form
 * (`NewMedicalRecordModal`). Spec §5 PredictRequest defines the canonical
 * ranges; the field schemas in `fields.ts` enforce them.
 */

import { z } from 'zod';

import {
    age,
    alt,
    binaryFlag,
    bmi,
    bpSystolic,
    cPeptide,
    diabetesDuration,
    egfr,
    fastingGlucose,
    hba1c,
    hdl,
    ldl,
    triglycerides,
} from './fields';

export const clinicalFeaturesSchema = z.object({
    age,
    bmi,
    hba1c_baseline: hba1c,
    egfr,
    diabetes_duration: diabetesDuration,
    fasting_glucose: fastingGlucose,
    c_peptide: cPeptide,
    cvd: binaryFlag,
    ckd: binaryFlag,
    nafld: binaryFlag,
    hypertension: binaryFlag,
    bp_systolic: bpSystolic,
    ldl,
    hdl,
    triglycerides,
    alt,
});
export type ClinicalFeaturesValues = z.infer<typeof clinicalFeaturesSchema>;
