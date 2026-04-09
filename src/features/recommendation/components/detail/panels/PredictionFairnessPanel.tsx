/**
 * PredictionFairnessPanel — stored-prediction fairness / attribution view.
 *
 * The `fairness` column is a passthrough JSONB field whose shape differs
 * between old and new predictions:
 *
 *   Old rows → FairnessContext: { statement, decisionFeatures,
 *                                  dualUseFeatures, excludedProtectedFeatures }
 *   New rows → Engine extras:  { model_top_treatment, attribution?,
 *                                  contrast?, uncertainty_drivers? }
 *
 * We detect the shape at runtime and render whichever fields are present,
 * falling back to a neutral placeholder when neither shape has useful data.
 */

'use client';

import { Scale, Brain, BarChart3 } from 'lucide-react';

import { NoiseOverlay } from '@/src/components/shared/NoiseOverlay';
import type { PredictionResponse } from '../../../api/recommendations.types';

interface PredictionFairnessPanelProps {
    prediction: PredictionResponse;
}

export function PredictionFairnessPanel({ prediction }: PredictionFairnessPanelProps) {
    const raw = (prediction.fairness ?? {}) as unknown as Record<string, unknown>;

    // ── Detect which shape we have ────────────────────────────────────────
    const isLegacyShape =
        typeof raw.statement === 'string' ||
        Array.isArray(raw.decisionFeatures);

    const isNewShape =
        'model_top_treatment' in raw ||
        'attribution' in raw ||
        'uncertainty_drivers' in raw;

    if (isLegacyShape) {
        return <LegacyFairnessView raw={raw} />;
    }

    if (isNewShape) {
        return <EngineExtrasView raw={raw} />;
    }

    // No recognised fairness data
    return (
        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-card/20 backdrop-blur-sm p-5">
            <NoiseOverlay opacity={0.55} />
            <div className="relative z-10 flex items-center gap-2 text-muted-foreground/60 text-base">
                <Scale className="h-4 w-4" />
                <span>No fairness audit data for this prediction.</span>
            </div>
        </section>
    );
}

// ── Legacy FairnessContext shape ──────────────────────────────────────────

function LegacyFairnessView({ raw }: { raw: Record<string, unknown> }) {
    const statement = String(raw.statement ?? '');
    const decisionFeatures = (raw.decisionFeatures as string[]) ?? [];
    const excludedFeatures = (raw.excludedProtectedFeatures as string[]) ?? [];
    const dualUseFeatures = (raw.dualUseFeatures ?? {}) as Record<string, string>;
    const dualUseEntries = Object.entries(dualUseFeatures);

    return (
        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-card/20 backdrop-blur-sm p-5">
            <NoiseOverlay opacity={0.55} />
            <div className="relative z-10">
            {statement && (
                <div className="flex items-start gap-3 mb-4">
                    <Scale className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                            Fairness statement
                        </p>
                        <p className="text-base text-foreground leading-relaxed mt-1">
                            {statement}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {decisionFeatures.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Decision features ({decisionFeatures.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {decisionFeatures.map((f) => (
                                <span
                                    key={f}
                                    className="text-xs px-2 py-0.5 border border-primary/20 bg-primary/[0.08] text-foreground"
                                >
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Excluded protected features
                    </p>
                    {excludedFeatures.length === 0 ? (
                        <p className="text-sm text-muted-foreground/60 italic">None</p>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {excludedFeatures.map((f) => (
                                <span
                                    key={f}
                                    className="text-xs px-2 py-0.5 border border-white/10 bg-white/[0.03] text-muted-foreground line-through"
                                >
                                    {f}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {dualUseEntries.length > 0 && (
                <section className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Dual-use features
                    </p>
                    <dl className="space-y-2">
                        {dualUseEntries.map(([feature, rationale]) => (
                            <div
                                key={feature}
                                className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5"
                            >
                                <dt className="text-sm font-semibold text-foreground">
                                    {feature}
                                </dt>
                                <dd className="text-sm text-muted-foreground leading-relaxed">
                                    {rationale}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}
            </div>
        </section>
    );
}

// ── New engine-extras shape ───────────────────────────────────────────────

function EngineExtrasView({ raw }: { raw: Record<string, unknown> }) {
    const modelTop = String(raw.model_top_treatment ?? '—');

    const attribution = (raw.attribution ?? null) as Record<string, number> | null;
    const contrast = (raw.contrast ?? null) as Record<string, number> | null;
    const uncertaintyDrivers = (raw.uncertainty_drivers ?? null) as Array<{
        feature: string;
        contribution: number;
    }> | null;

    const attrEntries = attribution
        ? (Object.entries(attribution) as [string, number][])
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
              .slice(0, 5)
        : null;

    const contrastEntries = contrast
        ? (Object.entries(contrast) as [string, number][])
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
              .slice(0, 5)
        : null;

    return (
        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-card/20 backdrop-blur-sm p-5">
            <NoiseOverlay opacity={0.55} />
            <div className="relative z-10 space-y-5">
            {/* Model top pick confirmation */}
            <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                        Model decision
                    </p>
                    <p className="text-base text-foreground mt-1">
                        The model's unconstrained top pick was{' '}
                        <span className="font-semibold">{modelTop}</span>. Safety
                        rules may have adjusted the final recommendation.
                    </p>
                </div>
            </div>

            {/* Feature attribution */}
            {attrEntries && attrEntries.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-primary/80" />
                        Top attribution features (recommendation)
                    </p>
                    <AttributionTable entries={attrEntries} />
                </div>
            )}

            {/* Contrast attribution */}
            {contrastEntries && contrastEntries.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-primary/80" />
                        Recommendation vs runner-up contrast (Δ attribution)
                    </p>
                    <AttributionTable entries={contrastEntries} />
                </div>
            )}

            {/* Uncertainty drivers */}
            {uncertaintyDrivers && uncertaintyDrivers.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Top uncertainty drivers
                    </p>
                    <dl className="space-y-1.5">
                        {uncertaintyDrivers.slice(0, 3).map((d) => (
                            <div
                                key={d.feature}
                                className="grid grid-cols-[1fr_80px] gap-3 text-sm"
                            >
                                <dt className="text-muted-foreground truncate">{d.feature}</dt>
                                <dd className="text-right font-mono tabular-nums text-foreground">
                                    {Number(d.contribution ?? 0).toFixed(3)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}

            {!attrEntries && !contrastEntries && !uncertaintyDrivers && (
                <p className="text-sm text-muted-foreground/60 italic">
                    Attribution data was not computed for this prediction.
                </p>
            )}
            </div>
        </section>
    );
}

function AttributionTable({ entries }: { entries: [string, number][] }) {
    const max = Math.max(...entries.map(([, v]) => Math.abs(v)), 1e-9);
    return (
        <div className="space-y-1.5">
            {entries.map(([feature, value]) => {
                const pct = (Math.abs(value) / max) * 100;
                const isPositive = value >= 0;
                return (
                    <div
                        key={feature}
                        className="grid grid-cols-[140px_1fr_64px] items-center gap-3 text-sm"
                    >
                        <span className="text-muted-foreground truncate">{feature}</span>
                        <div className="relative h-1.5 bg-white/[0.04] overflow-hidden">
                            <div
                                className={`absolute inset-y-0 left-0 ${isPositive ? 'bg-primary/70' : 'bg-rose-400/60'}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span
                            className={`text-right font-mono tabular-nums ${isPositive ? 'text-primary' : 'text-rose-400'}`}
                        >
                            {value >= 0 ? '+' : ''}{value.toFixed(3)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
