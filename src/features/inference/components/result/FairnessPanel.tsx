/**
 * FairnessPanel — renders the `fairness` section of a PredictionResponse.
 *
 * Spec §5 "PredictionResponse.fairness":
 *   • statement              — plain-language summary of what drove the decision
 *   • decisionFeatures       — features used as decision inputs
 *   • dualUseFeatures        — feature → rationale for use despite overlap w/ protected attrs
 *   • excludedProtectedFeatures — features that were excluded to avoid bias
 */

'use client';

import { FairnessContext } from '../../api/inference.types';
import { Scale } from 'lucide-react';

interface FairnessPanelProps {
    fairness: FairnessContext;
}

export function FairnessPanel({ fairness }: FairnessPanelProps) {
    const dualUseEntries = Object.entries(fairness.dualUseFeatures);

    return (
        <div className="border border-primary/20 bg-background/60 p-5">
            <div className="flex items-start gap-3 mb-4">
                <Scale className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                        Fairness statement
                    </p>
                    <p className="text-base text-foreground leading-relaxed mt-1">
                        {fairness.statement}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Decision features ({fairness.decisionFeatures.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {fairness.decisionFeatures.map((f) => (
                            <span key={f} className="text-xs px-2 py-0.5 border border-primary/20 bg-primary/[0.08] text-foreground">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Excluded protected features
                    </p>
                    {fairness.excludedProtectedFeatures.length === 0 ? (
                        <p className="text-sm text-muted-foreground/60 italic">None</p>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {fairness.excludedProtectedFeatures.map((f) => (
                                <span key={f} className="text-xs px-2 py-0.5 border border-white/10 bg-white/[0.03] text-muted-foreground line-through">
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
                            <div key={feature} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                                <dt className="text-sm font-semibold text-foreground">{feature}</dt>
                                <dd className="text-sm text-muted-foreground leading-relaxed">
                                    {rationale}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}
        </div>
    );
}
