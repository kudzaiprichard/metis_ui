'use client';

import { CheckCircle2, CircleAlert, Pill, User, XCircle } from 'lucide-react';

import type { SimilarPatientDetail } from '../../../api/similar-patients.types';

interface CaseFileHeaderProps {
    patientCase: SimilarPatientDetail;
}

const STAMP: Record<
    string,
    { icon: typeof CheckCircle2; ribbon: string; tone: string; label: string; subtle: string }
> = {
    Success: {
        icon: CheckCircle2,
        ribbon: 'bg-primary',
        tone: 'text-primary',
        subtle: 'bg-primary/[0.08] border-primary/20',
        label: 'Success',
    },
    Partial: {
        icon: CircleAlert,
        ribbon: 'bg-warning',
        tone: 'text-warning',
        subtle: 'bg-warning/[0.08] border-warning/20',
        label: 'Partial',
    },
    Failure: {
        icon: XCircle,
        ribbon: 'bg-destructive',
        tone: 'text-destructive',
        subtle: 'bg-destructive/[0.08] border-destructive/20',
        label: 'Failure',
    },
};

/**
 * Flat case-file banner — three vertical cells separated by hairline
 * dividers, with a coloured outcome ribbon on the left edge. Reads like
 * the cover sheet of a clinical case folder rather than a marketing hero.
 */
export function CaseFileHeader({ patientCase }: CaseFileHeaderProps) {
    const cat = patientCase.outcome?.outcomeCategory ?? 'Success';
    const stamp = STAMP[cat] ?? STAMP.Success;
    const StampIcon = stamp.icon;

    const dur = patientCase.clinicalFeatures.diabetesDuration;
    const archetype = `${patientCase.demographics.age}y · ${patientCase.demographics.gender} · T2DM ${dur.toFixed(0)}y`;
    const comorbCount = patientCase.comorbidities.length;
    const comorbLabel =
        comorbCount === 0
            ? 'No comorbidities'
            : comorbCount === 1
              ? '1 comorbidity'
              : `${comorbCount} comorbidities`;

    return (
        <section
            aria-label="Case file header"
            className="relative grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm overflow-hidden"
        >
            {/* Coloured ribbon on the left edge */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${stamp.ribbon}`} aria-hidden="true" />

            {/* Cell 1 — outcome stamp */}
            <div className="flex items-center gap-3 px-6 py-4 md:border-r border-white/10 md:min-w-[180px]">
                <div
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center flex-shrink-0 ${stamp.subtle}`}
                >
                    <StampIcon className={`h-6 w-6 ${stamp.tone}`} />
                </div>
                <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Outcome
                    </div>
                    <div className={`text-lg font-bold tracking-tight ${stamp.tone}`}>
                        {stamp.label}
                    </div>
                </div>
            </div>

            {/* Cell 2 — treatment given */}
            <div className="flex flex-col justify-center gap-1 px-6 py-4 md:border-r border-white/10">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    <Pill className="h-3 w-3" />
                    Treatment given
                </div>
                <div className="text-lg font-bold text-foreground tracking-tight truncate">
                    {patientCase.treatment?.drugName ?? 'Not recorded'}
                </div>
                {patientCase.treatment?.drugClass && (
                    <div className="text-xs text-muted-foreground/70">
                        {patientCase.treatment.drugClass}
                    </div>
                )}
            </div>

            {/* Cell 3 — patient archetype */}
            <div className="flex flex-col justify-center gap-1 px-6 py-4">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    <User className="h-3 w-3" />
                    Patient archetype
                </div>
                <div className="text-lg font-bold text-foreground tracking-tight">{archetype}</div>
                <div className="text-xs text-muted-foreground/70">{comorbLabel}</div>
            </div>
        </section>
    );
}
