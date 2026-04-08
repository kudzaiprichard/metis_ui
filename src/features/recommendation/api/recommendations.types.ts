/**
 * Predictions Feature Types — spec §5 "Module: Predictions".
 *
 * The folder is named `recommendation/` for legacy reasons; the module is
 * authoritatively "Predictions" per the API spec. The DTOs below mirror the
 * stored `PredictionResponse` (spec §5 table) verbatim.
 *
 * IMPORTANT: the stored `explanation` object uses DIFFERENT field names than
 * the inference module's `ExplanationResponse`:
 *   stored:     summary, runnerUp, confidence, safety, monitoring, disclaimer
 *   inference:  recommendationSummary, runnerUpAnalysis, confidenceStatement,
 *               safetyAssessment, monitoringNote, disclaimer
 * Do not substitute one for the other. See spec §5 Predictions note.
 */

import type {
    TreatmentLabel,
    ConfidenceLabel,
    SafetyStatus,
    FairnessContext,
} from '@/src/features/inference/api/inference.types';

// Re-export shared enums so consumers don't need to reach into the inference
// module to type a predictions response.
export type { TreatmentLabel, ConfidenceLabel, SafetyStatus } from '@/src/features/inference/api/inference.types';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Doctor decision state on a stored prediction.
 * Spec §5: PENDING until the doctor records a decision; ACCEPTED keeps the
 * recommendation; OVERRIDDEN requires `final_treatment` in the request.
 */
export type DoctorDecision = 'PENDING' | 'ACCEPTED' | 'OVERRIDDEN';

// ============================================================================
// RESPONSE SUB-OBJECTS
// ============================================================================

/**
 * `safetyDetails` — per spec §5 Predictions "safetyDetails object" table.
 * `excludedTreatments` / `allWarnings` are keyed by treatment name and only
 * contain treatments with data; they are not guaranteed to list all five.
 */
export interface SafetyDetails {
    recommendedContraindications: string[];
    recommendedWarnings: string[];
    excludedTreatments: Partial<Record<TreatmentLabel, string[]>>;
    allWarnings: Partial<Record<TreatmentLabel, string[]>>;
}

/**
 * Stored explanation DTO — DISTINCT from the inference module's
 * `ExplanationResponse`. Spec §5 Predictions "explanation fields" table.
 */
export interface StoredExplanation {
    summary: string;
    runnerUp: string;
    confidence: string;
    safety: string;
    monitoring: string;
    disclaimer: string;
}

// ============================================================================
// RESPONSE DTO
// ============================================================================

/**
 * Stored prediction record — spec §5 Predictions "PredictionResponse" table.
 * Returned from every endpoint in this module except `listByPatient`, which
 * returns a paginated envelope of these.
 */
export interface PredictionResponse {
    id: string;
    medicalRecordId: string;
    patientId: string;
    createdBy: string;

    recommendedTreatment: TreatmentLabel;
    recommendedIdx: number;
    confidencePct: number;
    confidenceLabel: ConfidenceLabel;
    meanGap: number;
    runnerUp: TreatmentLabel;
    runnerUpWinRate: number;
    winRates: Record<TreatmentLabel, number>;
    posteriorMeans: Record<TreatmentLabel, number>;

    safetyStatus: SafetyStatus;
    safetyDetails: SafetyDetails;

    // Spec types this as "Raw fairness dict". The backend serialises the same
    // dict the inference module produces, so we reuse FairnessContext. If a
    // future payload drifts, widen this to Record<string, unknown>.
    fairness: FairnessContext;

    explanation: StoredExplanation;

    doctorDecision: DoctorDecision;
    finalTreatment?: TreatmentLabel; // set once a decision is recorded
    doctorNotes?: string;

    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// REQUEST DTOs
// ============================================================================

/**
 * Body for `POST /predictions` — spec §5 Predictions.
 * `medical_record_id` must exist and belong to `patient_id`, otherwise the
 * server returns `RECORD_NOT_FOUND` (404) or `RECORD_PATIENT_MISMATCH` (400).
 */
export interface CreatePredictionRequest {
    medical_record_id: string;
    patient_id: string;
}

/**
 * Body for `PATCH /predictions/{id}/decision` — spec §5 Predictions.
 *
 * Conditional rule (enforced server-side): when `decision = "OVERRIDDEN"`,
 * `final_treatment` is required and must be one of the five valid labels.
 * When `decision = "ACCEPTED"`, the server sets `final_treatment` to the
 * recommended treatment automatically; sending one here is harmless.
 *
 * `doctor_notes` is optional and capped at 1000 characters by the backend.
 */
export interface DoctorDecisionRequest {
    decision: 'ACCEPTED' | 'OVERRIDDEN';
    final_treatment?: TreatmentLabel;
    doctor_notes?: string;
}

/**
 * Query parameters for `GET /predictions/patient/{id}`.
 * Spec §3.2: paginated endpoints take camelCase `page` / `pageSize`.
 */
export interface ListPredictionsByPatientParams {
    page?: number;
    pageSize?: number;
}

// ============================================================================
// PAGINATED RESULT SHAPE
// ============================================================================

/**
 * Normalised pagination envelope for the patient-history endpoint.
 * Keys are camelCase per spec §3.2 — api-client.ts tolerates either case but
 * consumers should expect camelCase from this module.
 */
export interface PredictionsByPatientResult {
    predictions: PredictionResponse[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// Legacy alias — list components reference this name; PredictionResponse is the canonical type.
export type Prediction = PredictionResponse;
