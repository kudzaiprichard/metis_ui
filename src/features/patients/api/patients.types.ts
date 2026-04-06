/**
 * Patients feature types — aligned to spec §5 "Module: Patients".
 *
 * Wire conventions:
 *   • Response DTOs (PatientResponse, PatientDetailResponse,
 *     MedicalRecordResponse) are camelCase — Pydantic serialises with
 *     `populate_by_name=True` + camelCase aliases.
 *   • Request bodies are snake_case, matching the Pydantic field names.
 */

// ============================================================================
// RESPONSE DTOs (camelCase)
// ============================================================================

/** Spec §5 Patients — `PatientResponse` (list view). */
export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO 8601 date ("YYYY-MM-DD")
    gender: string;
    email?: string;
    phone?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Spec §5 Patients — `MedicalRecordResponse` (the 16 ML features + notes).
 *
 * Binary comorbidity flags (`cvd`, `ckd`, `nafld`, `hypertension`) arrive as
 * integers `0` or `1`, not booleans (spec table, lines 731-734 / DTO 809-812).
 */
export interface MedicalRecord {
    id: string;
    patientId: string;
    age: number;
    bmi: number;
    hba1cBaseline: number;
    egfr: number;
    diabetesDuration: number;
    fastingGlucose: number;
    cPeptide: number;
    cvd: 0 | 1;
    ckd: 0 | 1;
    nafld: 0 | 1;
    hypertension: 0 | 1;
    bpSystolic: number;
    ldl: number;
    hdl: number;
    triglycerides: number;
    alt: number;
    notes?: string; // omitted when null per spec
    createdAt: string;
    updatedAt: string;
}

/** Spec §5 Patients — `PatientDetailResponse` (GET /patients/{id}). */
export interface PatientDetail extends Patient {
    medicalRecords: MedicalRecord[];
}

// ============================================================================
// REQUEST BODIES (snake_case)
// ============================================================================

/** Spec §5 — gender discriminator, lowercase per spec table line 660. */
export type PatientGender = 'male' | 'female' | 'other';

/** Spec §5 — `CreatePatientRequest`. */
export interface CreatePatientRequest {
    first_name: string;      // 1–100 chars
    last_name: string;       // 1–100 chars
    date_of_birth: string;   // ISO date "YYYY-MM-DD"
    gender: PatientGender;
    email?: string;
    phone?: string;          // max 20 chars
    address?: string;        // max 500 chars
}

/** Spec §5 — `UpdatePatientRequest` (PATCH; all fields optional). */
export interface UpdatePatientRequest {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: PatientGender;
    email?: string;
    phone?: string;
    address?: string;
}

/**
 * Spec §5 — `CreateMedicalRecordRequest` (POST /patients/{id}/medical-records).
 *
 * Binary comorbidity flags are sent as integers `0` | `1`, not booleans
 * (spec table lines 731-734). `notes` is optional, max 1000 chars.
 */
export interface CreateMedicalRecordRequest {
    age: number;                 // 18–120
    bmi: number;                 // 10–80
    hba1c_baseline: number;      // 3–20
    egfr: number;                // 5–200
    diabetes_duration: number;   // 0–60
    fasting_glucose: number;     // 50–500
    c_peptide: number;           // 0–10
    cvd: 0 | 1;
    ckd: 0 | 1;
    nafld: 0 | 1;
    hypertension: 0 | 1;
    bp_systolic: number;         // 60–250
    ldl: number;                 // 20–400
    hdl: number;                 // 10–150
    triglycerides: number;       // 30–800
    alt: number;                 // 5–500
    notes?: string;              // max 1000
}

// ============================================================================
// QUERY PARAMETER SHAPES
// ============================================================================

/** Spec §5 — `GET /patients` accepts `page` and `pageSize`. */
export interface ListPatientsParams {
    page?: number;
    pageSize?: number;
}

/** Spec §5 — `GET /patients/{id}/medical-records` accepts `skip` and `limit`. */
export interface ListMedicalRecordsParams {
    skip?: number;   // ≥ 0, default 0
    limit?: number;  // 1–100, default 50
}

// ============================================================================
// ENVELOPES
// ============================================================================

/**
 * Paginated list of patients. Pagination keys are camelCase per spec §3.2;
 * the runtime normaliser in `patients.api.ts` falls back to the api-client's
 * legacy snake_case shape until that shared helper is migrated.
 */
export interface PatientsListResponse {
    patients: Patient[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// Legacy alias used by older medical record components.
export type PatientMedicalData = MedicalRecord;
