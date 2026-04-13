'use client';

import { useRouter } from 'next/navigation';
import {
    ArrowRight,
    CheckCircle2,
    CircleAlert,
    Clock,
    Pill,
    Scale,
    TrendingDown,
    TrendingUp,
    TriangleAlert,
    XCircle,
} from 'lucide-react';

import { Card } from '@/src/components/shadcn/card';
import { SimilarPatientCase } from '../../api/similar-patients.types';

interface SimilarPatientCardProps {
    case: SimilarPatientCase;
}

const OUTCOME_STYLE: Record<
    string,
    { chip: string; icon: typeof CheckCircle2; label: string }
> = {
    Success: {
        chip: 'bg-primary/12 border-primary/25 text-primary',
        icon: CheckCircle2,
        label: 'Success',
    },
    Partial: {
        chip: 'bg-warning/12 border-warning/25 text-warning',
        icon: CircleAlert,
        label: 'Partial',
    },
    Failure: {
        chip: 'bg-destructive/12 border-destructive/25 text-destructive',
        icon: XCircle,
        label: 'Failure',
    },
};

function similarityTone(score: number) {
    if (score >= 0.85) return 'text-primary';
    if (score >= 0.7) return 'text-info';
    return 'text-warning';
}

/**
 * Compact case card — ~200px tall vs the previous ~500px.
 *
 * Information hierarchy:
 *   • Big similarity % top-left + outcome chip top-right (the "should I look?")
 *   • Patient one-liner (who this is)
 *   • Treatment pill (what was given)
 *   • Inline outcome metrics row (HbA1c Δ · BMI Δ · time-to-target)
 *   • Optional adverse-events warning band
 *
 * Whole card is the click target; arrow on hover signals navigation.
 */
export function SimilarPatientCard({ case: patientCase }: SimilarPatientCardProps) {
    const router = useRouter();
    const handleView = () => router.push(`/doctor/similar-patients/${patientCase.caseId}`);

    const similarityPct = Math.round(patientCase.similarityScore * 100);
    const simTone = similarityTone(patientCase.similarityScore);

    const outcome = patientCase.outcome;
    const cat = outcome?.outcomeCategory ?? 'Success';
    const outcomeStyle = OUTCOME_STYLE[cat] ?? OUTCOME_STYLE.Success;
    const OutcomeIcon = outcomeStyle.icon;

    const hba1cDelta = outcome ? -outcome.hba1cReduction : null;
    const bmiDelta = outcome ? -outcome.bmiReduction : null;

    const hasAE =
        !!outcome?.adverseEvents &&
        outcome.adverseEvents.trim() !== '' &&
        outcome.adverseEvents.toLowerCase() !== 'none';

    return (
        <Card
            onClick={handleView}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleView();
                }
            }}
            className="group relative overflow-hidden rounded-lg border-white/10 bg-white/[0.03] backdrop-blur-sm cursor-pointer hover:bg-white/[0.05] hover:border-white/20 transition-colors p-0"
        >
            <div className="px-4 py-3.5">
                {/* Top row — similarity + outcome */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <div className={`text-2xl font-bold tabular-nums leading-none ${simTone}`}>
                            {similarityPct}%
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mt-1">
                            similar
                        </div>
                    </div>
                    {outcome && (
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${outcomeStyle.chip}`}
                        >
                            <OutcomeIcon className="h-3 w-3" />
                            {outcomeStyle.label}
                        </span>
                    )}
                </div>

                {/* Patient identity — single line */}
                <div className="mb-3">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono text-foreground/85 truncate">
                            {patientCase.caseId.slice(0, 12)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <div className="text-xs text-muted-foreground/75 truncate">
                        {patientCase.profile.age}y · {patientCase.profile.gender} · T2DM{' '}
                        {patientCase.profile.diabetesDuration.toFixed(0)}y
                        {patientCase.comorbidities.length > 0 &&
                            ` · ${patientCase.comorbidities.length} comorb`}
                    </div>
                </div>

                {/* Treatment line */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/[0.06] border border-primary/15 mb-2.5">
                    <Pill className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="text-sm font-semibold text-primary truncate">
                        {patientCase.treatmentGiven}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-primary/55 ml-auto whitespace-nowrap">
                        {patientCase.drugClass}
                    </span>
                </div>

                {/* Outcome metrics row */}
                {outcome ? (
                    <div className="flex items-center gap-3 text-xs tabular-nums text-muted-foreground/85">
                        <DeltaMetric
                            icon={(hba1cDelta ?? 0) < 0 ? TrendingDown : TrendingUp}
                            label="HbA1c"
                            value={
                                hba1cDelta == null
                                    ? '—'
                                    : `${hba1cDelta > 0 ? '+' : ''}${hba1cDelta.toFixed(1)}%`
                            }
                            tone={
                                hba1cDelta == null
                                    ? 'text-muted-foreground/60'
                                    : hba1cDelta < 0
                                      ? 'text-primary'
                                      : 'text-warning'
                            }
                        />
                        <Sep />
                        <DeltaMetric
                            icon={Scale}
                            label="BMI"
                            value={
                                bmiDelta == null
                                    ? '—'
                                    : `${bmiDelta > 0 ? '+' : ''}${bmiDelta.toFixed(1)}`
                            }
                            tone={
                                bmiDelta == null
                                    ? 'text-muted-foreground/60'
                                    : bmiDelta < 0
                                      ? 'text-primary'
                                      : 'text-warning'
                            }
                        />
                        {outcome.timeToTarget &&
                            outcome.timeToTarget.toLowerCase() !== 'unknown' && (
                                <>
                                    <Sep />
                                    <span className="flex items-center gap-1 text-muted-foreground/65 truncate">
                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                        {outcome.timeToTarget}
                                    </span>
                                </>
                            )}
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground/50 italic">
                        Outcome not recorded
                    </div>
                )}

                {/* Adverse events — only when present */}
                {hasAE && (
                    <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-warning/[0.08] border border-warning/15">
                        <TriangleAlert className="h-3 w-3 text-warning flex-shrink-0" />
                        <span
                            className="text-xs text-warning/90 truncate"
                            title={outcome?.adverseEvents}
                        >
                            {outcome?.adverseEvents}
                        </span>
                    </div>
                )}
            </div>
        </Card>
    );
}

function DeltaMetric({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: typeof TrendingDown;
    label: string;
    value: string;
    tone: string;
}) {
    return (
        <span className={`flex items-center gap-1 ${tone}`}>
            <Icon className="h-3 w-3" />
            <span className="font-semibold">{label}</span>
            <span className="font-bold">{value}</span>
        </span>
    );
}

function Sep() {
    return <span className="text-white/[0.08]">·</span>;
}
