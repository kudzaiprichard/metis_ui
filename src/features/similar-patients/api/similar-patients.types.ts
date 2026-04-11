/**
 * Similar Patients Feature Types — camelCase to match backend Pydantic aliases.
 *
 * Numeric clinical fields are typed `number` because the backend Pydantic
 * models (SimilarPatientProfileResponse, SimilarPatientOutcomeResponse,
 * SimilarPatientClinicalFeaturesResponse) all serialize these as `float` /
 * `int`. Earlier versions of this file mistakenly typed them as `string`,
 * which forced consumers to `parseFloat(...)` even though the runtime value
 * was already a number.
 */

// ============================================================================
// ENTITY TYPES
// ============================================================================

export interface PatientProfile {
    age: number;
    gender: string;
    ethnicity: string;
    hba1cBaseline: number;
    cPeptide: number;
    bmi: number;
    egfr: number;
    diabetesDuration: number;
    bpSystolic: number;
    fastingGlucose: number;
}

export interface Outcome {
    hba1cReduction: number;
    hba1cFollowup: number;
    // Required. Backend has no tolerance for missing BMI fields — if the
    // value is absent at the API boundary the request errors out before it
    // reaches us, so the frontend can rely on these being present.
    bmiReduction: number;
    bmiFollowup: number;
    timeToTarget: string;
    adverseEvents: string;
    outcomeCategory: string;
    success: boolean;
}

/**
 * Single similar patient case (tabular format).
 * `outcome` can be null when historical data is incomplete.
 */
export interface SimilarPatientCase {
    caseId: string;
    similarityScore: number;
    clinicalSimilarity: number;
    comorbiditySimilarity: number;
    profile: PatientProfile;
    comorbidities: string[];
    treatmentGiven: string;
    drugClass: string;
    outcome: Outcome | null;
}

export interface SimilarPatientsSearchResult {
    cases: SimilarPatientCase[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// ============================================================================
// GRAPH TYPES
// ============================================================================

export interface GraphNodeStyle {
    color: string;
    size: string;
    shape: string;
}

export interface GraphNode {
    id: string;
    type: string;
    label: string;
    data: Record<string, unknown>;
    style: GraphNodeStyle;
}

export interface GraphEdgeStyle {
    width: number;
    color: string;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    type: string;
    label: string;
    data: Record<string, unknown>;
    style: GraphEdgeStyle;
}

export interface QueryPatient {
    id: string;
    // All fields are required: the graph endpoint always populates them
    // from the patient's MedicalRecord (numeric fields) and Patient (gender),
    // and throws if either lookup misses. Treat missing values here as a
    // backend bug, not a runtime case to handle.
    age: number;
    gender: string;
    hba1cBaseline: number;
    bmi: number;
    diabetesDuration: number;
}

export interface SimilarityRange {
    min: number;
    max: number;
}

export interface GraphMetadata {
    queryPatient: QueryPatient | null;
    filtersApplied: string[];
    similarityRange: SimilarityRange | null;
    resultsFound: number;
}

export interface SimilarPatientsGraphResponse {
    patientId: string;
    nodes: GraphNode[];
    edges: GraphEdge[];
    metadata: GraphMetadata;
}

// ============================================================================
// PATIENT DETAIL TYPES
// ============================================================================

export interface Demographics {
    age: number;
    gender: string;
    ethnicity: string;
    ageGroup: string;
}

export interface ClinicalFeatures {
    hba1cBaseline: number;
    diabetesDuration: number;
    fastingGlucose: number;
    cPeptide: number;
    egfr: number;
    bmi: number;
    bpSystolic: number;
    bpDiastolic: number;
    alt: number;
    ldl: number;
    hdl: number;
    triglycerides: number;
    previousPrediabetes: boolean;
}

export interface ClinicalCategories {
    bmiCategory: string;
    hba1cSeverity: string;
    kidneyFunction: string;
}

export interface TreatmentInfo {
    drugName: string;
    drugClass: string;
    costCategory: string;
    evidenceLevel: string;
}

export interface SimilarPatientDetail {
    patientId: string;
    demographics: Demographics;
    clinicalFeatures: ClinicalFeatures;
    clinicalCategories: ClinicalCategories;
    comorbidities: string[];
    treatment: TreatmentInfo | null;
    outcome: Outcome | null;
}

// ============================================================================
// REQUEST TYPES — snake_case (Pydantic field names, not aliases)
// ============================================================================

export interface FindSimilarPatientsRequest {
    patient_id?: string;
    medical_record_id?: string;
    limit?: number;
    treatment_filter?: string[];
    min_similarity?: number;
}

export interface FindSimilarPatientsGraphRequest {
    patient_id?: string;
    medical_record_id?: string;
    limit?: number;
    treatment_filter?: string[];
    min_similarity?: number;
}
