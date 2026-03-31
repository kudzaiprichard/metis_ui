/**
 * Bandit Demo Feature Types
 *
 * All types derived from API_INTEGRATION.md Section 6 (Simulations Module).
 * The 5 treatments are fixed by the backend model.
 */

// ---------------------------------------------------------------------------
// Treatments (fixed set, backend-defined)
// ---------------------------------------------------------------------------

export interface Treatment {
    name: string;
    color: string;
    idx: number;
}

/**
 * The 5 treatments in the backend model, in index order (0–4).
 * Colors map to the theme's --chart-1 … --chart-5 CSS variables so the
 * palette tracks the design tokens defined in app/globals.css.
 */
export const TREATMENTS: Treatment[] = [
    { name: 'Metformin', color: 'var(--chart-1)', idx: 0 },
    { name: 'GLP-1', color: 'var(--chart-2)', idx: 1 },
    { name: 'SGLT-2', color: 'var(--chart-3)', idx: 2 },
    { name: 'DPP-4', color: 'var(--chart-4)', idx: 3 },
    { name: 'Insulin', color: 'var(--chart-5)', idx: 4 },
];

export const TREATMENT_NAMES = TREATMENTS.map((t) => t.name);

// ---------------------------------------------------------------------------
// SSE Event Payloads (lean step event from the stream)
// ---------------------------------------------------------------------------

/** Payload of the SSE `step` event — one per patient row processed. */
export interface SSEStepEvent {
    step: number;
    totalSteps: number;
    selectedIdx: number;
    selectedTreatment: string;
    explored: boolean;
    observedReward: number;
    epsilon: number;
    runningEstimates: Record<string, number>;
    runningAccuracy: number;
    cumulativeReward: number;
    cumulativeRegret: number;
    treatmentCounts: Record<string, number>;
}

/** Payload of the SSE `complete` event. */
export interface SSECompleteEvent {
    status: 'COMPLETED' | 'CANCELLED' | 'FAILED';
    // Present when status = 'COMPLETED' (both live and DB-replay paths)
    final_accuracy?: number;
    final_cumulative_reward?: number;
    final_cumulative_regret?: number;
    mean_reward?: number;
    mean_regret?: number;
    thompson_exploration_rate?: number;
    treatment_counts?: Record<string, number>;
    confidence_distribution?: Record<string, number>;
    safety_distribution?: Record<string, number>;
    // Present only on live CANCELLED path (when stopped mid-loop)
    cancelled_at_step?: number;
}

/** Payload of the SSE `error` event. */
export interface SSEErrorEvent {
    error: string;
}

// ---------------------------------------------------------------------------
// History entry — accumulated per step for chart consumption
// ---------------------------------------------------------------------------

export interface HistoryEntry {
    step: number;
    selectedIdx: number;
    selectedTreatment: string;
    explored: boolean;
    observedReward: number;
    epsilon: number;
    // Running aggregates at this step — populated from the SSE step event so
    // charts can plot cumulativeReward / cumulativeRegret / runningAccuracy
    // curves without recomputing from scratch.
    cumulativeReward: number;
    cumulativeRegret: number;
    runningAccuracy: number;
}

// ---------------------------------------------------------------------------
// Simulation upload config (form fields sent with POST /simulations)
// ---------------------------------------------------------------------------

export interface SimulationUploadConfig {
    initialEpsilon: number;
    epsilonDecay: number;
    minEpsilon: number;
    randomSeed: number;
    resetPosterior: boolean;
}

export const DEFAULT_UPLOAD_CONFIG: SimulationUploadConfig = {
    initialEpsilon: 0.3,
    epsilonDecay: 0.997,
    minEpsilon: 0.01,
    randomSeed: 42,
    resetPosterior: true,
};

// ---------------------------------------------------------------------------
// Simulation lifecycle
// ---------------------------------------------------------------------------

/** Backend simulation status values. */
export type SimulationBackendStatus =
    | 'PENDING'
    | 'RUNNING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED';

/** Frontend lifecycle states (superset of backend status). */
export type SimulationLifecycle =
    | 'idle'
    | 'uploading'
    | 'connecting'
    | 'streaming'
    | 'paused'
    | 'completed'
    | 'cancelled'
    | 'failed';

// ---------------------------------------------------------------------------
// Backend DTOs (from GET /simulations/{id})
// ---------------------------------------------------------------------------

export interface SimulationConfigResponse {
    initialEpsilon: number;
    epsilonDecay: number;
    minEpsilon: number;
    randomSeed: number;
    resetPosterior: boolean;
    datasetFilename: string;
    datasetRowCount: number;
}

export interface SimulationAggregatesResponse {
    finalAccuracy: number | null;
    finalCumulativeReward: number | null;
    finalCumulativeRegret: number | null;
    meanReward: number | null;
    meanRegret: number | null;
    thompsonExplorationRate: number | null;
    treatmentCounts: Record<string, number> | null;
    confidenceDistribution: Record<string, number> | null;
    safetyDistribution: Record<string, number> | null;
}

export interface SimulationResponse {
    id: string;
    status: SimulationBackendStatus;
    currentStep: number;
    errorMessage?: string;
    config: SimulationConfigResponse;
    aggregates: SimulationAggregatesResponse;
    createdAt: string;
    updatedAt: string;
}

// ---------------------------------------------------------------------------
// Per-step drill-down DTO (GET /simulations/{id}/steps)
// Spec §6 "Simulation Endpoints Reference" — full per-step payload from DB.
// The SSE `step` event carries a lean payload; this is the complete record.
// ---------------------------------------------------------------------------

/** 16 raw clinical features from the CSV row — binaries are 0/1 integers. */
export interface StepPatient {
    age: number;
    bmi: number;
    hba1c_baseline: number;
    egfr: number;
    diabetes_duration: number;
    fasting_glucose: number;
    c_peptide: number;
    cvd: 0 | 1;
    ckd: 0 | 1;
    nafld: 0 | 1;
    hypertension: 0 | 1;
    bp_systolic: number;
    ldl: number;
    hdl: number;
    triglycerides: number;
    alt: number;
}

export interface StepOracle {
    rewards: Record<string, number>;
    optimalTreatment: string;
    optimalReward: number;
}

/** Note: spec uses `runnerUpWinrate` (lowercase `r`), not `runnerUpWinRate`. */
export interface StepDecision {
    selectedTreatment: string;
    selectedIdx: number;
    posteriorMeans: Record<string, number>;
    winRates: Record<string, number>;
    confidencePct: number;
    confidenceLabel: 'HIGH' | 'MODERATE' | 'LOW';
    sampledValues: Record<string, number>;
    runnerUp: string;
    runnerUpWinrate: number;
    meanGap: number;
}

export interface StepExploration {
    thompsonExplored: boolean;
    epsilonExplored: boolean;
    posteriorMeanBest: string;
}

export interface StepOutcome {
    observedReward: number;
    instantaneousRegret: number;
    matchedOracle: boolean;
}

export interface StepSafety {
    status: 'CLEAR' | 'WARNING' | 'CONTRAINDICATION_FOUND';
    contraindications: string[];
    warnings: string[];
}

export interface StepAggregates {
    cumulativeReward: number;
    cumulativeRegret: number;
    runningAccuracy: number;
    treatmentCounts: Record<string, number>;
    runningEstimates: Record<string, number>;
}

export interface SimulationStepResponse {
    step: number;
    epsilon: number;
    patient: StepPatient;
    oracle: StepOracle;
    decision: StepDecision;
    exploration: StepExploration;
    outcome: StepOutcome;
    safety: StepSafety;
    aggregates: StepAggregates;
}

// ---------------------------------------------------------------------------
// Paginated result envelopes — normalized to camelCase at the api layer
// ---------------------------------------------------------------------------

export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface PaginatedSimulationsResult {
    simulations: SimulationResponse[];
    pagination: PaginationMeta;
}

export interface PaginatedStepsResult {
    steps: SimulationStepResponse[];
    pagination: PaginationMeta;
}

/** Query params for the paginated endpoints. Spec §3.2: camelCase. */
export interface PaginatedQuery {
    page?: number;
    pageSize?: number;
}

// ---------------------------------------------------------------------------
// Derived UI helpers
// ---------------------------------------------------------------------------

export type SimulationPhase =
    | 'Exploring'
    | 'Heavy Exploration'
    | 'Balancing'
    | 'Exploiting Best Treatment';

export function getPhaseLabel(epsilon: number): SimulationPhase {
    if (epsilon > 0.15) return 'Heavy Exploration';
    if (epsilon > 0.05) return 'Balancing';
    return 'Exploiting Best Treatment';
}
