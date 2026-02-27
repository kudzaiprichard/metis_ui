/**
 * Similar Patients Feature Types
 */

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Patient profile information
 */
export interface PatientProfile {
    age: number;
    gender: string;
    ethnicity: string;
    hba1c_baseline: string; // Decimal as string
    c_peptide: string; // Decimal as string
    bmi: string; // Decimal as string
    egfr: string; // Decimal as string
    diabetes_duration: string; // Decimal as string
    bp_systolic: number;
    fasting_glucose: string; // Decimal as string
}

/**
 * Treatment outcome information
 */
export interface Outcome {
    hba1c_reduction: string; // Decimal as string
    hba1c_followup: string; // Decimal as string
    time_to_target: string;
    adverse_events: string;
    outcome_category: string;
    success: boolean;
}

/**
 * Single similar patient case (tabular format)
 */
export interface SimilarPatientCase {
    case_id: string;
    similarity_score: number;
    clinical_similarity: number;
    comorbidity_similarity: number;
    profile: PatientProfile;
    comorbidities: string[];
    treatment_given: string;
    drug_class: string;
    outcome: Outcome;
}

/**
 * Similar patients response (tabular format)
 */
export interface SimilarPatientsResponse {
    patient_id: string;
    similar_cases: SimilarPatientCase[];
    total_found: number;
    filters_applied: Record<string, unknown>;
}

// ============================================================================
// GRAPH TYPES
// ============================================================================

/**
 * Graph node styling
 */
export interface GraphNodeStyle {
    color: string;
    size: string;
    shape: string;
}

/**
 * Graph node
 */
export interface GraphNode {
    id: string;
    type: string;
    label: string;
    data: Record<string, unknown>;
    style: GraphNodeStyle;
}

/**
 * Graph edge styling
 */
export interface GraphEdgeStyle {
    width: number;
    color: string;
}

/**
 * Graph edge
 */
export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    type: string;
    label: string;
    data: Record<string, unknown>;
    style: GraphEdgeStyle;
}

/**
 * Graph metadata
 */
export interface GraphMetadata {
    query_patient: Record<string, unknown>;
    filters_applied: Record<string, unknown>;
    results_found: number;
    similarity_range?: Record<string, unknown>;
}

/**
 * Similar patients graph response
 */
export interface SimilarPatientsGraphResponse {
    patient_id: string;
    nodes: GraphNode[];
    edges: GraphEdge[];
    metadata: GraphMetadata;
}

// ============================================================================
// PATIENT DETAIL TYPES
// ============================================================================

/**
 * Demographics information
 */
export interface Demographics {
    age: number;
    gender: string;
    ethnicity: string;
    age_group: string;
}

/**
 * Clinical features (21 base features)
 */
export interface ClinicalFeatures {
    hba1c_baseline: string; // Decimal as string
    diabetes_duration: string; // Decimal as string
    fasting_glucose: string; // Decimal as string
    c_peptide: string; // Decimal as string
    egfr: string; // Decimal as string
    bmi: string; // Decimal as string
    bp_systolic: number;
    bp_diastolic: number;
    alt: string; // Decimal as string
    ldl: string; // Decimal as string
    hdl: string; // Decimal as string
    triglycerides: string; // Decimal as string
    previous_prediabetes: boolean;
}

/**
 * Clinical categories
 */
export interface ClinicalCategories {
    bmi_category: string;
    hba1c_severity: string;
    kidney_function: string;
}

/**
 * Treatment information
 */
export interface TreatmentInfo {
    drug_name: string;
    drug_class: string;
    cost_category: string;
    evidence_level: string;
}

/**
 * Complete similar patient detail
 */
export interface SimilarPatientDetail {
    patient_id: string;
    demographics: Demographics;
    clinical_features: ClinicalFeatures;
    clinical_categories: ClinicalCategories;
    comorbidities: string[];
    treatment: TreatmentInfo | null;
    outcome: Outcome | null;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Request to find similar patients (tabular)
 */
export interface FindSimilarPatientsRequest {
    patient_id: string;
    limit?: number; // 1-20, default 5
    treatment_filter?: string; // e.g., 'Metformin', 'GLP-1', 'SGLT-2'
    min_similarity?: number; // 0.0-1.0, default 0.5
}

/**
 * Request to find similar patients (graph)
 */
export interface FindSimilarPatientsGraphRequest {
    patient_id: string;
    limit?: number; // 1-20, default 5
    treatment_filter?: string;
    min_similarity?: number; // 0.0-1.0, default 0.5
}