/**
 * Predictions/Recommendations Feature Types
 */

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Patient summary for predictions
 */
export interface PatientSummary {
    id: string;
    first_name: string;
    last_name: string;
    age: number;
    gender: string;
}

/**
 * Q-value for treatment option
 */
export interface PredictionQValue {
    id: string;
    treatment: string;
    q_value: string; // Decimal as string
    rank: number;
}

/**
 * Explanation feature with SHAP values
 */
export interface ExplanationFeature {
    id: string;
    feature_name: string;
    scaled_value: string; // Decimal as string
    raw_value: string; // Decimal as string
    shap_value: string; // Decimal as string
    rank: number;
    interpretation: string;
    reference_range: string | null;
}

/**
 * Alternative treatment option
 */
export interface ExplanationAlternative {
    id: string;
    rank: number;
    treatment: string;
    predicted_reduction: string; // Decimal as string
    pros: string;
    cons: string;
    when_to_consider: string;
}

/**
 * Safety warning for treatment
 */
export interface SafetyWarning {
    id: string;
    severity: string;
    concern: string;
    patient_factor: string;
    mitigation: string;
    reason: string | null;
}

/**
 * Prediction explanation with features and alternatives
 */
export interface PredictionExplanation {
    id: string;
    summary_text: string;
    confidence_level: string;
    clinical_priority: string;
    why_this_treatment: string;
    why_not_alternatives: string;
    base_value: string; // Decimal as string
    prediction_value: string; // Decimal as string
    feature_interactions: string | null;
    features: ExplanationFeature[];
    alternatives: ExplanationAlternative[];
    created_at: string;
}

/**
 * Basic prediction response
 */
export interface Prediction {
    id: string;
    patient_id: string;
    patient: PatientSummary;
    model_version: string;
    recommended_treatment: string;
    treatment_index: number;
    predicted_reduction: string; // Decimal as string
    confidence_score: string; // Decimal as string
    confidence_margin: string; // Decimal as string
    created_at: string;
}

/**
 * Detailed prediction with Q-values, explanation, and safety warnings
 */
export interface PredictionDetail {
    id: string;
    patient_id: string;
    patient: PatientSummary;
    model_version: string;
    recommended_treatment: string;
    treatment_index: number;
    predicted_reduction: string; // Decimal as string
    confidence_score: string; // Decimal as string
    confidence_margin: string; // Decimal as string
    q_values: PredictionQValue[];
    explanation: PredictionExplanation | null;
    safety_warnings: SafetyWarning[];
    created_at: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Request to generate a new prediction
 */
export interface GeneratePredictionRequest {
    patient_id: string;
}

/**
 * Request to get a single prediction by ID
 */
export interface GetPredictionRequest {
    prediction_id: string;
}

/**
 * Request to get all predictions for a patient
 */
export interface GetPatientPredictionsRequest {
    patient_id: string;
    limit?: number; // 1-100
}

/**
 * Parameters for listing predictions with pagination
 */
export interface ListPredictionsParams {
    page?: number; // >= 1
    per_page?: number; // 1-100, default 20
    patient_id?: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Paginated list of predictions
 */
export interface PredictionsListResponse {
    predictions: Prediction[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    };
}