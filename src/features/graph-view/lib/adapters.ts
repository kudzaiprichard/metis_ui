import type {
    GraphNode,
    SimilarPatientsGraphResponse,
} from '@/src/features/similar-patients/api/similar-patients.types';
import type { Outcome } from './tokens';
import type {
    Patient,
    QueryPatient,
    QueryVitals,
    Treatment,
} from './types';

export interface GraphViewData {
    patients: Patient[];
    treatments: Treatment[];
    queryPatient: QueryPatient;
    queryVitals: QueryVitals;
    similarityRange: { min: number; max: number };
    filtersApplied: string[];
    resultCount: number;
}

/**
 * Convert the normalized similar-patients graph response into the shapes the
 * graph-view components consume. Also derives the display-formatted query
 * patient pill and numeric vitals used by the inspector.
 *
 * Strict by design: every field below is guaranteed by the backend contract
 * (see `SimilarPatientOutcomeResponse`, the graph builder, and the service's
 * `_build_profile`). Missing values throw rather than fall back to a
 * sentinel — silent degradation hides loader / serializer regressions.
 */
export function adaptGraphResponse(graph: SimilarPatientsGraphResponse): GraphViewData {
    const treatments = graph.nodes
        .filter(n => n.type === 'treatment')
        .map(toTreatment);

    const patients = graph.nodes
        .filter(n => n.type === 'patient')
        .map(toPatient)
        // Drop patients whose treatment id isn't in the response — they'd
        // render disconnected and confuse layout/edge logic.
        .filter(p => treatments.some(t => t.id === p.tx));

    const meta = graph.metadata;
    const qp = meta.queryPatient;
    if (!qp) {
        throw new Error('graph response missing metadata.queryPatient');
    }

    const queryVitals: QueryVitals = {
        hba1c: qp.hba1cBaseline,
        bmi: qp.bmi,
        age: qp.age,
    };

    const queryPatient: QueryPatient = {
        // 8-char slice mirrors the design's "a5046a5d" pill copy. Falls back
        // to the full id if it's already short.
        id: graph.patientId.length >= 8 ? graph.patientId.slice(0, 8) : graph.patientId,
        hba1c: `${qp.hba1cBaseline}%`,
        bmi: String(qp.bmi),
        age: `${qp.age}${parseSex(qp.gender)}`,
        dx: `T2DM ${qp.diabetesDuration}yr`,
    };

    const sims = patients.map(p => p.sim);
    const similarityRange =
        meta.similarityRange ??
        (sims.length > 0
            ? { min: Math.min(...sims), max: Math.max(...sims) }
            : { min: 0, max: 0 });

    return {
        patients,
        treatments,
        queryPatient,
        queryVitals,
        similarityRange,
        filtersApplied: meta.filtersApplied,
        resultCount: meta.resultsFound ?? patients.length,
    };
}

// ── helpers ─────────────────────────────────────────────────────────────

function toTreatment(node: GraphNode): Treatment {
    const data = node.data;
    const short = data['shortLabel'];
    if (typeof short !== 'string' || short.length === 0) {
        throw new Error(`treatment ${node.id}: missing shortLabel`);
    }
    return {
        id: node.id,
        name: node.label,
        // Color isn't read by the canvas (treatments are always teal), but
        // keep the field non-empty for downstream consumers.
        color: node.style?.color || '#2ec4b0',
        short,
    };
}

function toPatient(node: GraphNode): Patient {
    const data = node.data;
    const tx = requireString(data['treatmentId'], `patient ${node.id}: treatmentId`);
    const out = parseOutcome(data['outcomeCategory'], node.id);

    const simRaw = requireNumber(data['similarityScore'], `patient ${node.id}: similarityScore`);
    // Backend ships similarity in [0, 1] for the live finder. Anything > 1 is
    // already a percentage (e.g. test fixtures); accept both shapes.
    const sim = simRaw <= 1 ? Math.round(simRaw * 100) : Math.round(simRaw);

    const hba1cVal = data['hba1cBaseline'] ?? data['hba1c'];
    const hba1c = requireNumber(hba1cVal, `patient ${node.id}: hba1cBaseline`);
    const bmi = requireNumber(data['bmi'], `patient ${node.id}: bmi`);
    const age = requireNumber(data['age'], `patient ${node.id}: age`);
    const dHba1c = requireNumber(data['hba1cDelta'], `patient ${node.id}: hba1cDelta`);
    const dBmi = requireNumber(data['bmiDelta'], `patient ${node.id}: bmiDelta`);

    // comorbidities is optional on the API contract — patients with none
    // ship an empty array. Filter to strings to defend against junk values.
    const rawComorb = data['comorbidities'];
    const comorbidities = Array.isArray(rawComorb)
        ? rawComorb.filter((c): c is string => typeof c === 'string')
        : [];

    return {
        id: node.id,
        tx,
        out,
        sim,
        age,
        sex: parseSex(data['gender'] ?? data['sex']),
        hba1c,
        bmi,
        dHba1c,
        dBmi,
        comorbidities,
    };
}

function parseOutcome(v: unknown, nodeId: string): Outcome {
    if (typeof v !== 'string') {
        throw new Error(`patient ${nodeId}: outcomeCategory missing`);
    }
    const lower = v.toLowerCase();
    if (lower !== 'success' && lower !== 'partial' && lower !== 'failure') {
        throw new Error(`patient ${nodeId}: outcomeCategory unknown ("${v}")`);
    }
    return lower;
}

function parseSex(v: unknown): Patient['sex'] {
    if (typeof v !== 'string' || v.length === 0) {
        throw new Error('gender missing on query patient or patient node');
    }
    const first = v.charAt(0).toUpperCase();
    if (first !== 'M' && first !== 'F') {
        throw new Error(`unrecognized gender "${v}"`);
    }
    return first;
}

function requireString(v: unknown, label: string): string {
    if (typeof v !== 'string' || v.length === 0) {
        throw new Error(`${label} missing`);
    }
    return v;
}

function requireNumber(v: unknown, label: string): number {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    // Tolerate stringified numbers from older response shapes — but only when
    // they actually parse. A non-numeric value is still a contract violation.
    if (typeof v === 'string') {
        const parsed = parseFloat(v);
        if (Number.isFinite(parsed)) return parsed;
    }
    throw new Error(`${label} missing or non-numeric`);
}
