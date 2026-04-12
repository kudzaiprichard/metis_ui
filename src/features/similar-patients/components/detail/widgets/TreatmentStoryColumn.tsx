'use client';

import { Award, Beaker, DollarSign, Pill } from 'lucide-react';

import type { TreatmentInfo } from '../../../api/similar-patients.types';

interface TreatmentStoryColumnProps {
    treatment: TreatmentInfo | null;
}

const COST_TONE: Record<string, string> = {
    Low: 'bg-primary/12 border-primary/25 text-primary',
    Medium: 'bg-warning/12 border-warning/25 text-warning',
    High: 'bg-destructive/12 border-destructive/25 text-destructive',
};

const EVIDENCE_TONE: Record<string, string> = {
    A: 'bg-primary/12 border-primary/25 text-primary',
    B: 'bg-info/12 border-info/25 text-info',
    C: 'bg-warning/12 border-warning/25 text-warning',
};

const COST_BLURB: Record<string, string> = {
    Low: 'Affordable, broadly available',
    Medium: 'Moderately priced',
    High: 'Premium-priced regimen',
};

const EVIDENCE_BLURB: Record<string, string> = {
    A: 'Strong clinical evidence',
    B: 'Moderate clinical evidence',
    C: 'Limited clinical evidence',
};

/** "Treatment" act of the three-act case grid. */
export function TreatmentStoryColumn({ treatment }: TreatmentStoryColumnProps) {
    return (
        <section
            aria-label="Treatment given"
            className="flex flex-col rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm overflow-hidden h-full"
        >
            <header className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
                        <Pill className="h-3 w-3 text-primary" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Treatment
                    </h3>
                </div>
            </header>

            {treatment ? (
                <div className="px-5 py-4 flex flex-col gap-4 flex-1">
                    {/* Drug name spotlight */}
                    <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
                            Drug
                        </div>
                        <div className="text-xl font-bold text-foreground tracking-tight">
                            {treatment.drugName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <Beaker className="h-3 w-3 text-muted-foreground/60" />
                            <span className="text-xs text-muted-foreground/75">
                                {treatment.drugClass}
                            </span>
                        </div>
                    </div>

                    <div className="h-px bg-white/[0.06]" />

                    {/* Stacked attribute tiles */}
                    <AttrTile
                        icon={DollarSign}
                        label="Cost"
                        value={treatment.costCategory}
                        tone={COST_TONE[treatment.costCategory]}
                        blurb={COST_BLURB[treatment.costCategory]}
                    />
                    <AttrTile
                        icon={Award}
                        label="Evidence"
                        value={treatment.evidenceLevel}
                        tone={EVIDENCE_TONE[treatment.evidenceLevel]}
                        blurb={EVIDENCE_BLURB[treatment.evidenceLevel]}
                    />
                </div>
            ) : (
                <div className="px-5 py-6 text-sm text-muted-foreground/70 flex-1 flex items-center justify-center">
                    No treatment recorded.
                </div>
            )}
        </section>
    );
}

function AttrTile({
    icon: Icon,
    label,
    value,
    tone,
    blurb,
}: {
    icon: typeof Pill;
    label: string;
    value: string;
    tone?: string;
    blurb?: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`w-9 h-9 rounded-md border flex items-center justify-center flex-shrink-0 ${
                    tone ?? 'bg-white/[0.06] border-white/10 text-muted-foreground'
                }`}
            >
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {label}
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-foreground">{value}</span>
                    {blurb && (
                        <span className="text-xs text-muted-foreground/60 truncate">{blurb}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
