/**
 * Similar Patients API
 * Handles similar patient search API calls
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    FindSimilarPatientsRequest,
    FindSimilarPatientsGraphRequest,
    SimilarPatientCase,
    SimilarPatientsSearchResult,
    SimilarPatientsGraphResponse,
    SimilarPatientDetail,
    GraphNode,
    GraphEdge,
    GraphMetadata,
    QueryPatient,
    SimilarityRange,
} from './similar-patients.types';

export interface SimilarPatientsSearchPagination {
    page?: number;
    pageSize?: number;
}

// ── Graph response normalization ─────────────────────────────────────────
//
// The /search/graph backend returns shapes the UI cannot render directly:
//
// 1. Patient/treatment/outcome `data` payloads are snake_case
//    (`hba1c_baseline`, `similarity_score`, `outcome_category`, ...).
// 2. Outcome lives on a *separate* node (`type: "outcome"`, id
//    `outcome_${patientId}`) connected via a `treatment → outcome` edge.
//    The UI expects outcome fields on the patient node itself.
// 3. `metadata.queryPatient` is raw clinical data
//    (`hba1c_baseline, c_peptide, bmi, comorbidities, ...`) — the UI
//    expects display-friendly vitals (`{ id, hba1c, bmi, age, diagnosis }`).
// 4. `metadata.filtersApplied` is an object
//    (`{ age_group, hba1c_severity, treatment, comorbidities }`) — the UI
//    expects `string[]`. Calling `.map` on the object is the crash root.
//
// `normalizeGraphResponse` reshapes the payload at the API boundary so
// every component downstream reads a single, predictable shape.

interface RawGraphNode {
    id: string;
    type: string;
    label: string;
    data?: Record<string, unknown>;
    style?: { color?: string; size?: string; shape?: string };
}

interface RawGraphEdge {
    id: string;
    source: string;
    target: string;
    type: string;
    label?: string;
    data?: Record<string, unknown>;
    style?: { width?: number; color?: string };
}

interface RawGraphMetadata {
    queryPatient?: Record<string, unknown> | null;
    filtersApplied?: unknown;
    similarityRange?: SimilarityRange | null;
    resultsFound?: number;
}

interface RawGraphResponse {
    patientId: string;
    nodes: RawGraphNode[];
    edges: RawGraphEdge[];
    metadata?: RawGraphMetadata;
}

const SNAKE_TO_CAMEL: Record<string, string> = {
    patient_id: 'patientId',
    hba1c_baseline: 'hba1cBaseline',
    c_peptide: 'cPeptide',
    similarity_score: 'similarityScore',
    drug_class: 'drugClass',
    outcome_category: 'outcomeCategory',
    hba1c_reduction: 'hba1cReduction',
    hba1c_followup: 'hba1cFollowup',
    bmi_reduction: 'bmiReduction',
    bmi_followup: 'bmiFollowup',
    short_label: 'shortLabel',
    time_to_target: 'timeToTarget',
    adverse_events: 'adverseEvents',
    diabetes_duration: 'diabetesDuration',
    fasting_glucose: 'fastingGlucose',
    bp_systolic: 'bpSystolic',
};

function camelizeKeys(input: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
        out[SNAKE_TO_CAMEL[k] ?? k] = v;
    }
    return out;
}

function buildQueryPatient(
    raw: Record<string, unknown> | null | undefined,
    patientId: string,
): QueryPatient | null {
    // The graph endpoint guarantees `metadata.queryPatient` is present and
    // every field is populated. We still defend against a totally missing
    // payload (e.g. tabular endpoint reuse) by returning null, but inside
    // the payload the fields are read directly — a missing key surfaces as
    // a runtime error so we can spot a backend regression.
    if (!raw) return null;
    const num = (v: unknown, field: string): number => {
        if (typeof v === 'number' && Number.isFinite(v)) return v;
        throw new Error(`metadata.queryPatient.${field} missing or non-numeric`);
    };
    const gender = raw.gender;
    if (typeof gender !== 'string' || gender.length === 0) {
        throw new Error('metadata.queryPatient.gender missing');
    }
    return {
        id: patientId,
        age: num(raw.age, 'age'),
        gender,
        hba1cBaseline: num(raw.hba1c_baseline ?? raw.hba1cBaseline, 'hba1cBaseline'),
        bmi: num(raw.bmi, 'bmi'),
        diabetesDuration: num(raw.diabetes_duration ?? raw.diabetesDuration, 'diabetesDuration'),
    };
}

function buildFiltersApplied(raw: unknown): string[] {
    if (Array.isArray(raw)) return raw.map((v) => String(v));
    if (raw && typeof raw === 'object') {
        const out: string[] = [];
        for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
            if (v == null) continue;
            if (Array.isArray(v)) {
                if (v.length === 0) continue;
                out.push(`${k.replace(/_/g, ' ')}: ${v.join(', ')}`);
            } else {
                out.push(`${k.replace(/_/g, ' ')}: ${v}`);
            }
        }
        return out;
    }
    return [];
}

function normalizeGraphResponse(raw: RawGraphResponse): SimilarPatientsGraphResponse {
    const nodes = raw.nodes ?? [];
    const edges = raw.edges ?? [];

    // Index outcome nodes by their target patient id. Convention is
    // `outcome_${patientId}` — fall back to the `RESULTED_IN` edge chain
    // (treatment → outcome) when the id pattern doesn't match.
    const outcomeByPatientId = new Map<string, Record<string, unknown>>();
    const outcomeIds = new Set<string>();
    for (const n of nodes) {
        if (n.type !== 'outcome') continue;
        outcomeIds.add(n.id);
        const data = n.data ?? {};
        const explicitPatientId =
            (data.patient_id as string | undefined) ?? (data.patientId as string | undefined);
        const idMatch = n.id.startsWith('outcome_') ? n.id.slice('outcome_'.length) : null;
        const patientId = explicitPatientId ?? idMatch;
        if (patientId) outcomeByPatientId.set(patientId, data);
    }

    // Map each patient to the treatment they received via RECEIVED_TREATMENT.
    const treatmentByPatientId = new Map<string, string>();
    for (const e of edges) {
        if (e.type === 'RECEIVED_TREATMENT') treatmentByPatientId.set(e.source, e.target);
    }

    // Build a lookup of treatment node labels so we can stamp `treatmentName`
    // on each patient.
    const treatmentLabelById = new Map<string, string>();
    for (const n of nodes) {
        if (n.type === 'treatment') treatmentLabelById.set(n.id, n.label);
    }

    const normalizedNodes: GraphNode[] = [];
    for (const n of nodes) {
        if (n.type === 'outcome') continue; // merged into patients
        if (n.type === 'patient') {
            const baseData = camelizeKeys(n.data ?? {});
            const outcomeRaw = outcomeByPatientId.get(n.id);
            const outcomeData = outcomeRaw ? camelizeKeys(outcomeRaw) : {};
            const treatmentId = treatmentByPatientId.get(n.id);
            const treatmentName = treatmentId ? treatmentLabelById.get(treatmentId) : undefined;

            // hba1cDelta / bmiDelta are conventionally negative-is-good
            // (improvement). Backend reports `*_reduction` as a positive
            // number when the value dropped, so flip the sign for the UI's
            // lower-is-better delta semantics. Both reductions are
            // guaranteed by the API contract — read directly so a missing
            // value throws instead of silently producing NaN.
            const hba1cReduction = outcomeData.hba1cReduction;
            const bmiReduction = outcomeData.bmiReduction;
            if (typeof hba1cReduction !== 'number') {
                throw new Error(`patient ${n.id}: outcome.hba1cReduction missing`);
            }
            if (typeof bmiReduction !== 'number') {
                throw new Error(`patient ${n.id}: outcome.bmiReduction missing`);
            }

            const data: Record<string, unknown> = {
                ...baseData,
                ...outcomeData,
                caseId: (baseData.patientId as string | undefined) ?? n.id,
                sex: baseData.gender ?? baseData.sex,
                hba1c: baseData.hba1cBaseline ?? baseData.hba1c,
                hba1cDelta: -hba1cReduction,
                bmiDelta: -bmiReduction,
            };
            if (treatmentId) data.treatmentId = treatmentId;
            if (treatmentName) data.treatmentName = treatmentName;

            normalizedNodes.push({
                id: n.id,
                type: 'patient',
                label: n.label,
                data,
                style: {
                    color: n.style?.color ?? '',
                    size: n.style?.size ?? 'medium',
                    shape: n.style?.shape ?? 'circle',
                },
            });
            continue;
        }
        if (n.type === 'treatment') {
            const baseData = camelizeKeys(n.data ?? {});
            // shortLabel is required by the API contract (set by the Neo4j
            // loader from treatments.csv). Throw if missing so a loader
            // regression surfaces here rather than rendering a fallback chip.
            if (typeof baseData.shortLabel !== 'string' || baseData.shortLabel.length === 0) {
                throw new Error(`treatment ${n.id}: missing shortLabel`);
            }
            normalizedNodes.push({
                id: n.id,
                type: 'treatment',
                label: n.label,
                data: { ...baseData, treatmentName: baseData.treatment ?? n.label },
                style: {
                    color: n.style?.color ?? '',
                    size: n.style?.size ?? 'medium',
                    shape: n.style?.shape ?? 'square',
                },
            });
            continue;
        }
        // Pass through other types (e.g. `query_patient`) unchanged so the
        // orchestrator's existing filter (`type !== 'query_patient'`) keeps
        // working as before.
        normalizedNodes.push({
            id: n.id,
            type: n.type,
            label: n.label,
            data: camelizeKeys(n.data ?? {}),
            style: {
                color: n.style?.color ?? '',
                size: n.style?.size ?? 'medium',
                shape: n.style?.shape ?? 'circle',
            },
        });
    }

    const normalizedEdges: GraphEdge[] = [];
    for (const e of edges) {
        // RESULTED_IN edges point at outcome nodes that we merged away —
        // keeping them would leave dangling endpoints in the canvas.
        if (e.type === 'RESULTED_IN') continue;
        if (outcomeIds.has(e.source) || outcomeIds.has(e.target)) continue;
        normalizedEdges.push({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type,
            label: e.label ?? '',
            data: camelizeKeys(e.data ?? {}),
            style: {
                width: e.style?.width ?? 1,
                color: e.style?.color ?? 'var(--border)',
            },
        });
    }

    const rawMeta = raw.metadata ?? {};
    // Backend ships similarity as 0–1; ContextStrip's bar renders the
    // values as raw percentages, so scale here to keep callers simple.
    const rawRange = rawMeta.similarityRange;
    const similarityRange: SimilarityRange | null = rawRange
        ? {
              min: rawRange.min <= 1 ? rawRange.min * 100 : rawRange.min,
              max: rawRange.max <= 1 ? rawRange.max * 100 : rawRange.max,
          }
        : null;

    const metadata: GraphMetadata = {
        queryPatient: buildQueryPatient(rawMeta.queryPatient, raw.patientId),
        filtersApplied: buildFiltersApplied(rawMeta.filtersApplied),
        similarityRange,
        resultsFound: typeof rawMeta.resultsFound === 'number' ? rawMeta.resultsFound : 0,
    };

    return {
        patientId: raw.patientId,
        nodes: normalizedNodes,
        edges: normalizedEdges,
        metadata,
    };
}

/**
 * Similar Patients API object with all methods
 */
export const similarPatientsApi = {
    /**
     * Find similar patients in tabular format
     * POST /similar-patients/search — spec §5 returns a paginated envelope.
     * Page and pageSize travel on the query string; body carries the search criteria.
     */
    search: async (
        data: FindSimilarPatientsRequest,
        pagination?: SimilarPatientsSearchPagination
    ): Promise<SimilarPatientsSearchResult> => {
        const { items, pagination: rawPagination } =
            await apiClient.postPaginated<SimilarPatientCase, FindSimilarPatientsRequest>(
                API_ROUTES.SIMILAR_PATIENTS.SEARCH,
                data,
                { params: pagination }
            );

        const p = rawPagination as unknown as Partial<{
            page: number;
            pageSize: number;
            page_size: number;
            total: number;
            totalPages: number;
            total_pages: number;
        }>;

        return {
            cases: items,
            pagination: {
                page: p.page ?? 1,
                pageSize: p.pageSize ?? p.page_size ?? 20,
                total: p.total ?? 0,
                totalPages: p.totalPages ?? p.total_pages ?? 0,
            },
        };
    },

    /**
     * Find similar patients in graph format for visualization
     * POST /similar-patients/search/graph
     */
    searchGraph: async (
        data: FindSimilarPatientsGraphRequest,
    ): Promise<SimilarPatientsGraphResponse> => {
        const raw = await apiClient.post<RawGraphResponse, FindSimilarPatientsGraphRequest>(
            API_ROUTES.SIMILAR_PATIENTS.SEARCH_GRAPH,
            data,
        );
        return normalizeGraphResponse(raw);
    },

    /**
     * Get complete details of a similar patient case
     * GET /similar-patients/:caseId
     */
    getDetail: (caseId: string): Promise<SimilarPatientDetail> => {
        return apiClient.get<SimilarPatientDetail>(
            API_ROUTES.SIMILAR_PATIENTS.BY_CASE_ID(caseId)
        );
    },
};
