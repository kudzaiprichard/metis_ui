/**
 * Patients Feature Types
 */

// ============================================================================
// PREDICTION TYPES (nested in medical data)
// ============================================================================

export interface PredictionQValue {
    id: string;
    treatment: string;
    q_value: string;
    rank: number;
}

export interface ExplanationFeature {
    id: string;
    feature_name: string;
    scaled_value: string;
    raw_value: string;
    shap_value: string;
    rank: number;
    interpretation: string;
    reference_range: string | null;
}

export interface ExplanationAlternative {
    id: string;
    rank: number;
    treatment: string;
    predicted_reduction: string;
    pros: string;
    cons: string;
    when_to_consider: string;
}

export interface SafetyWarning {
    id: string;
    severity: string;
    concern: string;
    patient_factor: string;
    mitigation: string;
    reason: string | null;
}

export interface PredictionExplanation {
    id: string;
    summary_text: string;
    confidence_level: string;
    clinical_priority: string;
    why_this_treatment: string;
    why_not_alternatives: string;
    base_value: string;
    prediction_value: string;
    feature_interactions: string | null;
    features: ExplanationFeature[];
    alternatives: ExplanationAlternative[];
    created_at: string;
}

export interface PatientSummary {
    id: string;
    first_name: string;
    last_name: string;
    age: number;
    gender: string;
}

export interface PredictionDetailResponse {
    id: string;
    medical_data_id: string;
    patient: PatientSummary;
    model_version: string;
    recommended_treatment: string;
    treatment_index: number;
    predicted_reduction: string;
    confidence_score: string;
    confidence_margin: string;
    q_values: PredictionQValue[];
    explanation: PredictionExplanation | null;
    safety_warnings: SafetyWarning[];
    created_at: string;
}

// ============================================================================
// PATIENT TYPES
// ============================================================================

/**
 * Patient entity
 */
export interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    mobile_number: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Patient medical data entity (one per visit)
 */
export interface PatientMedicalData {
    id: string;
    patient_id: string;
    age: number;
    gender: string;
    ethnicity: string;
    hba1c_baseline: string;
    diabetes_duration: string;
    fasting_glucose: string;
    c_peptide: string;
    egfr: string;
    bmi: string;
    bp_systolic: number;
    bp_diastolic: number;
    alt: string;
    ldl: string;
    hdl: string;
    triglycerides: string;
    previous_prediabetes: boolean;
    hypertension: boolean;
    ckd: boolean;
    cvd: boolean;
    nafld: boolean;
    retinopathy: boolean;
    prediction: PredictionDetailResponse | null;
    created_at: string;
    updated_at: string;
}

/**
 * Patient with all medical records (detail view)
 */
export interface PatientDetail {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    mobile_number: string | null;
    created_at: string;
    updated_at: string;
    medical_records: PatientMedicalData[];
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Data required to create a new patient
 */
export interface CreatePatientRequest {
    first_name: string;
    last_name: string;
    email?: string;
    mobile_number?: string;
}

/**
 * Data for updating patient contact information
 */
export interface UpdatePatientContactRequest {
    first_name?: string;
    last_name?: string;
    email?: string;
    mobile_number?: string;
}

/**
 * Data required to create patient medical data
 */
export interface CreatePatientMedicalDataRequest {
    patient_id: string;
    age: number;
    gender: 'Male' | 'Female';
    ethnicity: 'Caucasian' | 'African' | 'Asian' | 'Hispanic' | 'Other';
    hba1c_baseline: number;
    diabetes_duration: number;
    fasting_glucose: number;
    c_peptide: number;
    egfr: number;
    bmi: number;
    bp_systolic: number;
    bp_diastolic: number;
    alt: number;
    ldl: number;
    hdl: number;
    triglycerides: number;
    previous_prediabetes: boolean;
    hypertension: boolean;
    ckd: boolean;
    cvd: boolean;
    nafld: boolean;
    retinopathy: boolean;
}

/**
 * Data for updating patient medical data
 */
export interface UpdatePatientMedicalDataRequest {
    age?: number;
    gender?: 'Male' | 'Female';
    ethnicity?: 'Caucasian' | 'African' | 'Asian' | 'Hispanic' | 'Other';
    hba1c_baseline?: number;
    diabetes_duration?: number;
    fasting_glucose?: number;
    c_peptide?: number;
    egfr?: number;
    bmi?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
    alt?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    previous_prediabetes?: boolean;
    hypertension?: boolean;
    ckd?: boolean;
    cvd?: boolean;
    nafld?: boolean;
    retinopathy?: boolean;
}

/**
 * Parameters for filtering and paginating patients list
 */
export interface ListPatientsParams {
    page?: number;
    per_page?: number;
    search?: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Paginated list of patients
 */
export interface PatientsListResponse {
    patients: Patient[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    };
}

/**
 * Confirmation of patient deletion
 */
export interface DeletePatientResponse {
    deleted: boolean;
    patient_id: string;
}

/**
 * Confirmation of medical data deletion
 */
export interface DeleteMedicalDataResponse {
    deleted: boolean;
    medical_data_id: string;
}