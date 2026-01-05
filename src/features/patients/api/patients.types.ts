/**
 * Patients Feature Types
 */

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
 * Patient medical data entity
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
    updated_at: string;
}

/**
 * Patient with medical data (detail view)
 */
export interface PatientDetail {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    mobile_number: string | null;
    created_at: string;
    updated_at: string;
    medical_data: PatientMedicalData | null;
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
    patient_id: string;
}