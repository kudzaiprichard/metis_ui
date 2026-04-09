/**
 * PredictionSafetyPanel — stored-prediction safety view.
 *
 * safetyDetails is a passthrough JSONB column and its shape depends on when
 * the prediction was created:
 *
 *   New rows  → { safety_findings: FindingObj[], excluded_treatments: Record<t, FindingObj[]|string[]>, override? }
 *   Old rows  → { recommendedContraindications: string[], recommendedWarnings: string[],
 *                 excludedTreatments: Record<t, string[]>, allWarnings: Record<t, string[]> }
 *
 * We normalise both into a single internal shape before rendering so nothing
 * crashes regardless of which format arrives.
 */

'use client';

import { ShieldCheck, AlertTriangle, Ban } from 'lucide-react';

import { NoiseOverlay } from '@/src/components/shared/NoiseOverlay';
import type {
    PredictionResponse,
    SafetyStatus,
    TreatmentLabel,
} from '../../../api/recommendations.types';

// ── Internal normalised shape ─────────────────────────────────────────────

interface NormalisedSafety {
    recommendedContraindications: string[];
    recommendedWarnings: string[];
    /** treatment → list of reason strings */
    excludedTreatments: Record<string, string[]>;
    /** treatment → list of warning strings */
    allWarnings: Record<string, string[]>;
    /** Optional override note (new shape only) */
    override?: { original_treatment?: string; reason?: string } | null;
}

/** Extract a readable string from a finding that may be a string or an object. */
function findingToString(f: unknown): string {
    if (typeof f === 'string') return f;
    if (f && typeof f === 'object') {
        const o = f as Record<string, unknown>;
        return String(o.message ?? o.msg ?? o.rule_id ?? JSON.stringify(f));
    }
    return String(f ?? '');
}

function normaliseSafetyDetails(
    raw: Record<string, unknown>,
): NormalisedSafety {
    // ── New shape: has a `safety_findings` list ───────────────────────────
    if ('safety_findings' in raw && Array.isArray(raw.safety_findings)) {
        const findings = raw.safety_findings as unknown[];
        const contras: string[] = [];
        const warns: string[] = [];
        for (const f of findings) {
            const severity = String(
                (f as Record<string, unknown>)?.severity ?? '',
            ).toLowerCase();
            const msg = findingToString(f);
            if (severity.includes('contraindication')) {
                contras.push(msg);
            } else {
                warns.push(msg);
            }
        }

        const excluded: Record<string, string[]> = {};
        const rawExcluded =
            (raw.excluded_treatments as Record<string, unknown>) ?? {};
        for (const [t, reasons] of Object.entries(rawExcluded)) {
            excluded[t] = Array.isArray(reasons)
                ? reasons.map(findingToString)
                : [findingToString(reasons)];
        }

        return {
            recommendedContraindications: contras,
            recommendedWarnings: warns,
            excludedTreatments: excluded,
            allWarnings: {},
            override: (raw.override as NormalisedSafety['override']) ?? null,
        };
    }

    // ── Old shape: camelCase or snake_case arrays ─────────────────────────
    const pick = <T,>(...keys: string[]): T => {
        for (const k of keys) {
            if (raw[k] !== undefined && raw[k] !== null) return raw[k] as T;
        }
        return [] as unknown as T;
    };

    const pickObj = (...keys: string[]): Record<string, string[]> => {
        for (const k of keys) {
            if (
                raw[k] !== undefined &&
                raw[k] !== null &&
                typeof raw[k] === 'object'
            ) {
                const obj = raw[k] as Record<string, unknown>;
                const result: Record<string, string[]> = {};
                for (const [t, reasons] of Object.entries(obj)) {
                    result[t] = Array.isArray(reasons)
                        ? reasons.map(findingToString)
                        : [findingToString(reasons)];
                }
                return result;
            }
        }
        return {};
    };

    return {
        recommendedContraindications: pick<string[]>(
            'recommendedContraindications',
            'recommended_contraindications',
        ),
        recommendedWarnings: pick<string[]>(
            'recommendedWarnings',
            'recommended_warnings',
        ),
        excludedTreatments: pickObj(
            'excludedTreatments',
            'excluded_treatments',
        ),
        allWarnings: pickObj('allWarnings', 'all_warnings'),
        override: null,
    };
}

// ── Status display config ─────────────────────────────────────────────────

const STATUS_STYLES: Record<
    SafetyStatus,
    { icon: React.ElementType; accent: string; label: string; body: string }
> = {
    CLEAR: {
        icon: ShieldCheck,
        accent: 'border-emerald-400/30 bg-emerald-400/5 text-emerald-300',
        label: 'Safety: clear',
        body: 'No contraindications or warnings apply to the recommended treatment.',
    },
    WARNING: {
        icon: AlertTriangle,
        accent: 'border-warning/30 bg-warning/5 text-warning',
        label: 'Safety: warning',
        body: 'At least one clinical warning applies — review before prescribing.',
    },
    CONTRAINDICATION_FOUND: {
        icon: Ban,
        accent: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
        label: 'Safety: contraindication found',
        body: 'A hard contraindication was detected on the recommended treatment.',
    },
};

// ── Panel ─────────────────────────────────────────────────────────────────

interface PredictionSafetyPanelProps {
    prediction: PredictionResponse;
}

export function PredictionSafetyPanel({ prediction }: PredictionSafetyPanelProps) {
    const { safetyStatus, safetyDetails, recommendedTreatment } = prediction;

    const style = STATUS_STYLES[safetyStatus] ?? STATUS_STYLES.CLEAR;
    const Icon = style.icon;

    // safetyDetails is typed as SafetyDetails but is actually a passthrough
    // JSONB object — cast to the raw dict for normalisation.
    const details = normaliseSafetyDetails(
        (safetyDetails ?? {}) as unknown as Record<string, unknown>,
    );

    return (
        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-card/20 backdrop-blur-sm p-5">
            <NoiseOverlay opacity={0.55} />
            <div className="relative z-10">
                {/* Status banner */}
                <div className={`flex items-start gap-3 p-3.5 border rounded-lg ${style.accent} mb-4`}>
                    <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider">
                            {style.label}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {style.body}
                        </p>
                    </div>
                </div>

                {/* Override note (new-shape only) */}
                {details.override && (
                    <div className="mb-4 p-3 border border-warning/20 bg-warning/5 rounded-lg text-sm text-warning">
                        <span className="font-semibold">Safety override applied.</span>{' '}
                        {details.override.original_treatment && (
                            <>
                                Original model pick was{' '}
                                <span className="font-semibold">
                                    {details.override.original_treatment}
                                </span>
                                {details.override.reason && ` — ${details.override.reason}`}.
                            </>
                        )}
                    </div>
                )}

                {/* Issues on the recommended treatment */}
                <div className="space-y-3">
                    <IssueList
                        title={`Contraindications on ${recommendedTreatment}`}
                        items={details.recommendedContraindications}
                        tone="bad"
                    />
                    <IssueList
                        title={`Warnings on ${recommendedTreatment}`}
                        items={details.recommendedWarnings}
                        tone="warn"
                    />
                </div>

                <ExcludedTreatmentsList excluded={details.excludedTreatments} />

                <OtherWarningsList
                    allWarnings={details.allWarnings}
                    recommended={recommendedTreatment}
                />
            </div>
        </section>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────

function IssueList({
    title,
    items,
    tone,
}: {
    title: string;
    items: string[];
    tone: 'bad' | 'warn';
}) {
    const safeItems = Array.isArray(items) ? items : [];
    const accent =
        tone === 'bad'
            ? 'border-rose-500/20 bg-rose-500/5'
            : 'border-warning/20 bg-warning/5';
    return (
        <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {title}
            </p>
            {safeItems.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 italic">None</p>
            ) : (
                <ul className={`border ${accent} p-2.5 space-y-1`}>
                    {safeItems.map((item, i) => (
                        <li
                            key={i}
                            className="text-sm text-foreground leading-relaxed"
                        >
                            • {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function ExcludedTreatmentsList({
    excluded,
}: {
    excluded: Record<string, string[]>;
}) {
    const entries = Object.entries(excluded ?? {});
    if (entries.length === 0) return null;
    return (
        <section className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Excluded treatments
            </p>
            <div className="space-y-2">
                {entries.map(([treatment, reasons]) => (
                    <div
                        key={treatment}
                        className="border border-rose-500/20 bg-rose-500/5 p-2.5"
                    >
                        <p className="text-sm font-semibold text-rose-300">
                            {treatment}
                        </p>
                        <ul className="mt-1 space-y-0.5">
                            {(reasons ?? []).map((reason, i) => (
                                <li
                                    key={i}
                                    className="text-sm text-muted-foreground leading-relaxed"
                                >
                                    • {reason}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}

function OtherWarningsList({
    allWarnings,
    recommended,
}: {
    allWarnings: Record<string, string[]>;
    recommended: TreatmentLabel;
}) {
    const entries = Object.entries(allWarnings ?? {}).filter(
        ([t]) => t !== recommended,
    );
    if (entries.length === 0) return null;
    return (
        <section className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Warnings on other treatments
            </p>
            <div className="space-y-2">
                {entries.map(([treatment, warnings]) => (
                    <div key={treatment} className="border border-white/10 p-2.5">
                        <p className="text-sm font-semibold text-foreground">
                            {treatment}
                        </p>
                        <ul className="mt-1 space-y-0.5">
                            {(warnings ?? []).map((w, i) => (
                                <li
                                    key={i}
                                    className="text-sm text-muted-foreground leading-relaxed"
                                >
                                    • {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
