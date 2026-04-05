/**
 * SafetyPanel — renders the `safety` section of a PredictionResponse.
 *
 * Spec §5 "PredictionResponse.safety":
 *   • status: CLEAR / WARNING / CONTRAINDICATION_FOUND
 *   • recommendedContraindications / recommendedWarnings
 *   • excludedTreatments (treatments blocked out)
 *   • allWarnings (per-treatment warning maps, including the recommended one)
 */

'use client';

import { SafetyContext, SafetyStatus, TreatmentLabel } from '../../api/inference.types';
import { ShieldCheck, AlertTriangle, Ban } from 'lucide-react';

interface SafetyPanelProps {
    safety: SafetyContext;
    recommendedTreatment: TreatmentLabel;
}

const STATUS_STYLES: Record<SafetyStatus, { icon: React.ElementType; accent: string; label: string; body: string }> = {
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

export function SafetyPanel({ safety, recommendedTreatment }: SafetyPanelProps) {
    const style = STATUS_STYLES[safety.status];
    const Icon = style.icon;

    const excludedEntries = Object.entries(safety.excludedTreatments) as [TreatmentLabel, string[]][];
    const otherWarnings = (Object.entries(safety.allWarnings) as [TreatmentLabel, string[]][])
        .filter(([t]) => t !== recommendedTreatment);

    return (
        <div className="border border-primary/20 bg-background/60 p-5">
            <div className={`flex items-start gap-3 p-3.5 border ${style.accent} mb-4`}>
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider">{style.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{style.body}</p>
                </div>
            </div>

            <Section title="Contraindications on recommended treatment" items={safety.recommendedContraindications} tone="bad" emptyLabel="None" />
            <Section title="Warnings on recommended treatment" items={safety.recommendedWarnings} tone="warn" emptyLabel="None" />

            {excludedEntries.length > 0 && (
                <section className="mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Excluded treatments
                    </p>
                    <div className="space-y-2">
                        {excludedEntries.map(([treatment, reasons]) => (
                            <div key={treatment} className="border border-rose-500/20 bg-rose-500/5 p-2.5">
                                <p className="text-sm font-semibold text-rose-300">{treatment}</p>
                                <ul className="mt-1 space-y-0.5">
                                    {reasons.map((reason, i) => (
                                        <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                                            • {reason}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {otherWarnings.length > 0 && (
                <section className="mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Warnings on other treatments
                    </p>
                    <div className="space-y-2">
                        {otherWarnings.map(([treatment, warnings]) => (
                            <div key={treatment} className="border border-white/10 p-2.5">
                                <p className="text-sm font-semibold text-foreground">{treatment}</p>
                                <ul className="mt-1 space-y-0.5">
                                    {warnings.map((w, i) => (
                                        <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                                            • {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function Section({
    title,
    items,
    tone,
    emptyLabel,
}: {
    title: string;
    items: string[];
    tone: 'bad' | 'warn';
    emptyLabel: string;
}) {
    const accent =
        tone === 'bad'
            ? 'border-rose-500/20 bg-rose-500/5'
            : 'border-warning/20 bg-warning/5';

    return (
        <section className="mb-3 last:mb-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {title}
            </p>
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 italic">{emptyLabel}</p>
            ) : (
                <ul className={`border ${accent} p-2.5 space-y-1`}>
                    {items.map((item, i) => (
                        <li key={i} className="text-sm text-foreground leading-relaxed">
                            • {item}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
