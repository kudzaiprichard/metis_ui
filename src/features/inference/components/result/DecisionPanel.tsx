/**
 * DecisionPanel — renders the `decision` section of a PredictionResponse.
 *
 * Surfaces (per spec §5 "PredictionResponse.decision"):
 *   • recommendedTreatment + recommendedIdx
 *   • confidencePct + confidenceLabel (HIGH ≥85 / MODERATE 60–84 / LOW <60)
 *   • winRates (all five treatments, sorted descending)
 *   • runnerUp + runnerUpWinRate + meanGap
 */

'use client';

import { DecisionContext, ConfidenceLabel, TreatmentLabel } from '../../api/inference.types';
import { CheckCircle2 } from 'lucide-react';

interface DecisionPanelProps {
    decision: DecisionContext;
}

const CONFIDENCE_STYLES: Record<ConfidenceLabel, { text: string; bar: string; label: string }> = {
    HIGH: { text: 'text-emerald-300', bar: 'bg-emerald-400', label: 'High confidence' },
    MODERATE: { text: 'text-warning', bar: 'bg-warning', label: 'Moderate confidence' },
    LOW: { text: 'text-rose-300', bar: 'bg-rose-400', label: 'Low confidence' },
};

export function DecisionPanel({ decision }: DecisionPanelProps) {
    const conf = CONFIDENCE_STYLES[decision.confidenceLabel];

    // Sort win rates descending so the recommended treatment is always first.
    const ranked = (Object.entries(decision.winRates) as [TreatmentLabel, number][])
        .sort((a, b) => b[1] - a[1]);

    return (
        <div className="border border-primary/20 bg-background/60 p-5">
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Recommended treatment
                    </p>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold text-foreground tracking-tight">
                            {decision.recommendedTreatment}
                        </h2>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${conf.text}`}>
                        {conf.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground leading-none mt-1">
                        {decision.confidencePct}
                        <span className="text-md font-normal text-muted-foreground ml-1">%</span>
                    </p>
                </div>
            </div>

            {/* Win-rate distribution */}
            <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Win rate across treatments
                </p>
                <div className="space-y-1.5">
                    {ranked.map(([treatment, rate]) => {
                        const isRecommended = treatment === decision.recommendedTreatment;
                        const isRunnerUp = treatment === decision.runnerUp;
                        const pct = Math.max(0, Math.min(100, rate * 100));
                        return (
                            <div key={treatment} className="flex items-center gap-3">
                                <span className={`w-20 text-sm ${isRecommended ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                                    {treatment}
                                </span>
                                <div className="flex-1 h-2 bg-white/[0.04] border border-white/5 relative overflow-hidden">
                                    <div
                                        className={`h-full ${isRecommended ? 'bg-primary' : isRunnerUp ? 'bg-warning/70' : 'bg-white/15'}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className={`w-14 text-right text-sm tabular-nums ${isRecommended ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                                    {(rate * 100).toFixed(1)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Runner-up delta */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                <Metric label="Runner-up" value={decision.runnerUp} />
                <Metric
                    label="Runner-up win rate"
                    value={`${(decision.runnerUpWinRate * 100).toFixed(1)}%`}
                />
                <Metric
                    label="Posterior-mean gap"
                    value={decision.meanGap.toFixed(3)}
                    hint={`${decision.nDraws} Thompson samples`}
                />
            </div>
        </div>
    );
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {label}
            </p>
            <p className="text-md font-semibold text-foreground mt-0.5">{value}</p>
            {hint && <p className="text-xs text-muted-foreground/60 mt-0.5">{hint}</p>}
        </div>
    );
}
