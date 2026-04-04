/**
 * Inference Feature Types
 *
 * Mirrors spec §5 "Module: Inference" — stateless ML inference. Request
 * bodies are the raw 16-feature payload in snake_case (what the backend
 * accepts); responses are the spec-documented camelCase DTOs.
 *
 * Note (spec §5): in PredictionResponse.patient, the binary comorbidity
 * fields (`cvd`, `ckd`, `nafld`, `hypertension`) are returned as
 * "Yes"/"No" strings, not 0/1 integers — this is a deliberate presentation
 * formatting applied server-side by `extract_patient_context()`.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Treatment labels used across inference + predictions.
 * Spec §5: recommendedTreatment, runnerUp, final_treatment are drawn from
 * this fixed set.
 */
export type TreatmentLabel = 'Metformin' | 'GLP-1' | 'SGLT-2' | 'DPP-4' | 'Insulin';

/**
 * Confidence tier derived from `confidencePct`.
 * Spec §5: HIGH ≥ 85, MODERATE 60–84, LOW < 60.
 */
export type ConfidenceLabel = 'HIGH' | 'MODERATE' | 'LOW';

/**
 * Safety status for the recommended treatment.
 * Spec §5:
 *   CLEAR                  — no contraindications or warnings
 *   WARNING                — no contraindications, but ≥1 warning applies
 *   CONTRAINDICATION_FOUND — ≥1 hard contraindication on recommended treatment
 */
export type SafetyStatus = 'CLEAR' | 'WARNING' | 'CONTRAINDICATION_FOUND';

/**
 * Binary comorbidity flag as serialised in `PredictionResponse.patient`.
 * Spec §5 note: presentation-formatted to "Yes"/"No" strings.
 */
export type BinaryFlag = 'Yes' | 'No';

// ============================================================================
// REQUEST DTOs
// ============================================================================

/**
 * The 16 clinical features accepted by every `/inference/*` endpoint.
 * Field names are snake_case as required by the backend; numeric ranges
 * are documented inline from spec §5 "PredictRequest" and should be
 * enforced by the calling form's validator before dispatch.
 */
export interface PredictRequest {
    age: number; // int, 18–120
    bmi: number; // float, 10–80
    hba1c_baseline: number; // float, 3–20
    egfr: number; // float, 5–200
    diabetes_duration: number; // float, 0–60
    fasting_glucose: number; // float, 50–500
    c_peptide: number; // float, 0–10
    cvd: 0 | 1;
    ckd: 0 | 1;
    nafld: 0 | 1;
    hypertension: 0 | 1;
    bp_systolic: number; // float, 60–250
    ldl: number; // float, 20–400
    hdl: number; // float, 10–150
    triglycerides: number; // float, 30–800
    alt: number; // float, 5–500
}

/**
 * Batch prediction request. Spec §5 caps `patients` at 50 items.
 */
export interface BatchPredictRequest {
    patients: PredictRequest[];
}

/**
 * Body for `POST /inference/explain` — generates an explanation from an
 * already-computed prediction payload without re-running the model.
 * Fields are passed through as returned by a prior `PredictionResponse`,
 * so they are typed in their response shape (camelCase, "Yes"/"No"
 * comorbidity strings).
 */
export interface ExplainRequest {
    patient: PatientContext;
    decision: DecisionContext;
    safety: SafetyContext;
    fairness: FairnessContext;
}

// ============================================================================
// RESPONSE SUB-OBJECTS
// ============================================================================

/**
 * `patient` section of `PredictionResponse`. Binary comorbidities are
 * returned as "Yes"/"No" strings per the spec §5 presentation formatting.
 */
export interface PatientContext {
    age: number;
    bmi: number;
    hba1cBaseline: number;
    egfr: number;
    diabetesDuration: number;
    fastingGlucose: number;
    cPeptide: number;
    bpSystolic: number;
    ldl: number;
    hdl: number;
    triglycerides: number;
    cvd: BinaryFlag;
    ckd: BinaryFlag;
    nafld: BinaryFlag;
    hypertension: BinaryFlag;
}

/**
 * `decision` section of `PredictionResponse`.
 * `winRates` and `posteriorMeans` are keyed by treatment label; they
 * always contain all five treatments.
 */
export interface DecisionContext {
    recommendedTreatment: TreatmentLabel;
    recommendedIdx: number;
    confidencePct: number;
    confidenceLabel: ConfidenceLabel;
    winRates: Record<TreatmentLabel, number>;
    posteriorMeans: Record<TreatmentLabel, number>;
    runnerUp: TreatmentLabel;
    runnerUpWinRate: number;
    meanGap: number;
    nDraws: number;
}

/**
 * `safety` section of `PredictionResponse`.
 * `excludedTreatments` and `allWarnings` are keyed by treatment label;
 * only treatments with data are present.
 */
export interface SafetyContext {
    status: SafetyStatus;
    recommendedContraindications: string[];
    recommendedWarnings: string[];
    excludedTreatments: Partial<Record<TreatmentLabel, string[]>>;
    allWarnings: Partial<Record<TreatmentLabel, string[]>>;
}

/**
 * `fairness` section of `PredictionResponse`.
 * `dualUseFeatures` maps a feature name to the rationale for its inclusion.
 */
export interface FairnessContext {
    decisionFeatures: string[];
    dualUseFeatures: Record<string, string>;
    excludedProtectedFeatures: string[];
    statement: string;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Response from `POST /inference/predict` and each item in the
 * `/inference/predict-batch` response array.
 */
export interface PredictionResponse {
    patient: PatientContext;
    decision: DecisionContext;
    safety: SafetyContext;
    fairness: FairnessContext;
}

/**
 * Response from `POST /inference/explain`. Spec §5 "ExplanationResponse".
 * Field names are the inference-module variants — distinct from the
 * predictions-module stored explanation (see spec §5 predictions note).
 */
export interface ExplanationResponse {
    recommendationSummary: string;
    runnerUpAnalysis: string;
    confidenceStatement: string;
    safetyAssessment: string;
    monitoringNote: string;
    disclaimer: string;
}

/**
 * Response from `POST /inference/predict-with-explanation`.
 * Spec §5 references this DTO by name without a separate table; it is
 * the full `PredictionResponse` with the LLM `explanation` attached.
 */
export interface PredictionWithExplanationResponse extends PredictionResponse {
    explanation: ExplanationResponse;
}
