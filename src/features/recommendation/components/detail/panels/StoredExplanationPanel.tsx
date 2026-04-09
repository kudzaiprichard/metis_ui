/**
 * StoredExplanationPanel — renders the explanation object attached to a
 * stored prediction.
 *
 * Spec §5 Predictions "explanation fields" table uses DIFFERENT keys than
 * the inference module's ExplanationResponse. Do not substitute one for the
 * other:
 *   1. summary     — why this treatment
 *   2. runnerUp    — why not the runner-up
 *   3. confidence  — what the confidence tier means
 *   4. safety      — safety assessment
 *   5. monitoring  — post-prescription monitoring
 *   6. disclaimer  — standard clinical disclaimer
 *
 * Order preserved so the clinical narrative reads in the intended sequence.
 */

'use client';

import {
    Sparkles,
    Target,
    TrendingUp,
    Gauge,
    ShieldCheck,
    Activity,
    FileText,
} from 'lucide-react';

import { NoiseOverlay } from '@/src/components/shared/NoiseOverlay';
import type { StoredExplanation } from '../../../api/recommendations.types';

interface StoredExplanationPanelProps {
    explanation: StoredExplanation;
}

const SECTIONS: Array<{
    key: keyof StoredExplanation;
    label: string;
    icon: React.ElementType;
}> = [
    { key: 'summary', label: 'Why this treatment', icon: Target },
    { key: 'runnerUp', label: 'Why not the runner-up', icon: TrendingUp },
    { key: 'confidence', label: 'Confidence', icon: Gauge },
    { key: 'safety', label: 'Safety assessment', icon: ShieldCheck },
    { key: 'monitoring', label: 'Post-prescription monitoring', icon: Activity },
    { key: 'disclaimer', label: 'Disclaimer', icon: FileText },
];

export function StoredExplanationPanel({ explanation }: StoredExplanationPanelProps) {
    if (!explanation) return null;

    return (
        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-card/20 backdrop-blur-sm p-5">
            <NoiseOverlay opacity={0.55} />
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-md font-semibold text-foreground">
                        Clinical explanation
                    </h3>
                </div>

                <div className="space-y-4">
                    {SECTIONS.map(({ key, label, icon: Icon }) => {
                        const body = explanation[key];
                        if (!body) return null;
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
                                        isDisclaimer
                                            ? 'text-muted-foreground/70 italic'
                                            : 'text-foreground'
                                    }`}
                                >
                                    {body}
                                </p>
                            </section>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
