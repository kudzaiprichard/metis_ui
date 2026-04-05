/**
 * ExplanationPanel — renders the LLM `ExplanationResponse` attached to a
 * `/inference/predict-with-explanation` payload.
 *
 * Spec §5 "ExplanationResponse" field order preserved so the clinical
 * narrative reads in the intended sequence:
 *   1. recommendationSummary — why this treatment
 *   2. runnerUpAnalysis      — why not the runner-up
 *   3. confidenceStatement   — what the confidence tier means
 *   4. safetyAssessment      — safety considerations
 *   5. monitoringNote        — what to monitor after prescribing
 *   6. disclaimer            — standard clinical disclaimer
 */

'use client';

import { ExplanationResponse } from '../../api/inference.types';
import { Sparkles, Target, TrendingUp, Gauge, ShieldCheck, Activity, FileText } from 'lucide-react';

interface ExplanationPanelProps {
    explanation: ExplanationResponse;
}

const SECTIONS: Array<{
    key: keyof ExplanationResponse;
    label: string;
    icon: React.ElementType;
}> = [
    { key: 'recommendationSummary', label: 'Why this treatment', icon: Target },
    { key: 'runnerUpAnalysis', label: 'Why not the runner-up', icon: TrendingUp },
    { key: 'confidenceStatement', label: 'Confidence', icon: Gauge },
    { key: 'safetyAssessment', label: 'Safety assessment', icon: ShieldCheck },
    { key: 'monitoringNote', label: 'Post-prescription monitoring', icon: Activity },
    { key: 'disclaimer', label: 'Disclaimer', icon: FileText },
];

export function ExplanationPanel({ explanation }: ExplanationPanelProps) {
    return (
        <div className="border border-primary/20 bg-background/60 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-md font-semibold text-foreground">Clinical explanation</h3>
            </div>

            <div className="space-y-4">
                {SECTIONS.map(({ key, label, icon: Icon }) => {
                    const body = explanation[key];
                    const isDisclaimer = key === 'disclaimer';
                    return (
                        <section
                            key={key}
                            className={isDisclaimer ? 'pt-4 border-t border-white/5' : ''}
                        >
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                <Icon className="h-3.5 w-3.5 text-primary/80" />
                                {label}
                            </p>
                            <p
                                className={`text-base leading-relaxed ${
                                    isDisclaimer ? 'text-muted-foreground/70 italic' : 'text-foreground'
                                }`}
                            >
                                {body}
                            </p>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
