/**
 * DoctorDecisionPanel — spec §5 "Module: Predictions" PATCH /{id}/decision.
 *
 * Owns the full doctor decision flow on a stored prediction:
 *   • PENDING  → "Accept recommendation" and "Override" actions.
 *                Accept submits `{ decision: 'ACCEPTED' }`; the server sets
 *                `finalTreatment` to the recommended label automatically.
 *                Override reveals a 5-option treatment selector and requires
 *                a choice (spec rule: `final_treatment` is required when
 *                `decision = 'OVERRIDDEN'`; server returns TREATMENT_REQUIRED
 *                otherwise).
 *   • ACCEPTED/OVERRIDDEN → show the recorded outcome and an
 *                "Update decision" affordance that re-opens the editor.
 *
 * Errors: TREATMENT_REQUIRED (400) from the server is surfaced as an inline
 * error on the treatment selector — other errors land in a toast.
 */

'use client';

import { useState } from 'react';
import { CheckCircle2, Edit3, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/src/components/shadcn/button';
import { Label } from '@/src/components/shadcn/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/src/components/shadcn/select';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { ERROR_CODES } from '@/src/lib/constants';

import { useRecordDecision } from '../../hooks/useRecommendations';
import {
    DoctorDecisionRequest,
    PredictionResponse,
    TreatmentLabel,
} from '../../api/recommendations.types';
import { DoctorDecisionBadge } from '../shared/DoctorDecisionBadge';

// Spec §5 Predictions — only these five treatment labels are valid overrides.
const TREATMENT_OPTIONS: TreatmentLabel[] = [
    'Metformin',
    'GLP-1',
    'SGLT-2',
    'DPP-4',
    'Insulin',
];

// Spec §5 Predictions DoctorDecisionRequest — `doctor_notes` is capped server-side at 1000.
const NOTES_MAX = 1000;

type Mode = 'VIEW' | 'ACCEPT' | 'OVERRIDE';

interface DoctorDecisionPanelProps {
    prediction: PredictionResponse;
}

export function DoctorDecisionPanel({ prediction }: DoctorDecisionPanelProps) {
    const { showToast } = useToast();
    const recordDecision = useRecordDecision();

    const [mode, setMode] = useState<Mode>('VIEW');
    const [overrideTreatment, setOverrideTreatment] = useState<TreatmentLabel | ''>('');
    const [notes, setNotes] = useState('');
    const [treatmentError, setTreatmentError] = useState<string | null>(null);

    const isPending = prediction.doctorDecision === 'PENDING';

    const resetEditor = () => {
        setOverrideTreatment('');
        setNotes('');
        setTreatmentError(null);
    };

    const closeEditor = () => {
        setMode('VIEW');
        resetEditor();
    };

    const openAccept = () => {
        resetEditor();
        setMode('ACCEPT');
    };

    const openOverride = () => {
        resetEditor();
        // Seed with the existing decision's treatment if we're updating, so
        // the doctor sees their prior pick rather than an empty selector.
        if (prediction.doctorDecision === 'OVERRIDDEN' && prediction.finalTreatment) {
            setOverrideTreatment(prediction.finalTreatment);
        }
        if (prediction.doctorNotes) setNotes(prediction.doctorNotes);
        setMode('OVERRIDE');
    };

    const submit = (data: DoctorDecisionRequest) => {
        recordDecision.mutate(
            { predictionId: prediction.id, data },
            {
                onSuccess: () => {
                    showToast(
                        'Decision recorded',
                        data.decision === 'ACCEPTED'
                            ? `Recommendation accepted (${prediction.recommendedTreatment}).`
                            : `Override recorded (${data.final_treatment}).`,
                        'success',
                    );
                    closeEditor();
                },
                onError: (err: ApiError) => {
                    if (err.code === ERROR_CODES.TREATMENT_REQUIRED) {
                        setTreatmentError(
                            err.getMessage() ||
                                'A final treatment is required when overriding the recommendation.',
                        );
                        return;
                    }
                    showToast('Decision failed', err.getMessage(), 'error');
                },
            },
        );
    };

    const handleAcceptSubmit = () => {
        submit({
            decision: 'ACCEPTED',
            ...(notes.trim() ? { doctor_notes: notes.trim() } : {}),
        });
    };

    const handleOverrideSubmit = () => {
        if (!overrideTreatment) {
            setTreatmentError('Pick a final treatment to override the recommendation.');
            return;
        }
        setTreatmentError(null);
        submit({
            decision: 'OVERRIDDEN',
            final_treatment: overrideTreatment,
            ...(notes.trim() ? { doctor_notes: notes.trim() } : {}),
        });
    };

    return (
        <section className="rounded-lg border border-primary/20 bg-background/60 p-5 space-y-4">
            <header className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Doctor Decision
                    </h2>
                    <p className="text-sm text-muted-foreground/80">
                        {isPending
                            ? 'Record the final clinical decision on this prediction.'
                            : 'This prediction has a recorded decision.'}
                    </p>
                </div>
                <DoctorDecisionBadge decision={prediction.doctorDecision} />
            </header>

            {!isPending && mode === 'VIEW' && (
                <RecordedDecisionView
                    prediction={prediction}
                    onUpdate={openOverride}
                    onAccept={openAccept}
                />
            )}

            {isPending && mode === 'VIEW' && (
                <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                        type="button"
                        onClick={openAccept}
                        className="rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/25"
                        disabled={recordDecision.isPending}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Accept recommendation
                    </Button>
                    <Button
                        type="button"
                        onClick={openOverride}
                        variant="outline"
                        className="rounded-lg border-sky-400/40 text-sky-200 hover:bg-sky-500/15"
                        disabled={recordDecision.isPending}
                    >
                        <Edit3 className="h-4 w-4" />
                        Override
                    </Button>
                </div>
            )}

            {mode === 'ACCEPT' && (
                <AcceptEditor
                    recommendedTreatment={prediction.recommendedTreatment}
                    notes={notes}
                    onNotesChange={setNotes}
                    onCancel={closeEditor}
                    onSubmit={handleAcceptSubmit}
                    isSubmitting={recordDecision.isPending}
                />
            )}

            {mode === 'OVERRIDE' && (
                <OverrideEditor
                    recommendedTreatment={prediction.recommendedTreatment}
                    overrideTreatment={overrideTreatment}
                    onTreatmentChange={(t) => {
                        setOverrideTreatment(t);
                        if (t) setTreatmentError(null);
                    }}
                    treatmentError={treatmentError}
                    notes={notes}
                    onNotesChange={setNotes}
                    onCancel={closeEditor}
                    onSubmit={handleOverrideSubmit}
                    isSubmitting={recordDecision.isPending}
                />
            )}
        </section>
    );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RecordedDecisionView({
    prediction,
    onUpdate,
    onAccept,
}: {
    prediction: PredictionResponse;
    onUpdate: () => void;
    onAccept: () => void;
}) {
    return (
        <div className="space-y-3">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base">
                <div>
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Final treatment
                    </dt>
                    <dd className="mt-1 font-semibold">
                        {prediction.finalTreatment ?? '—'}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Recommended
                    </dt>
                    <dd className="mt-1 text-muted-foreground">
                        {prediction.recommendedTreatment}
                    </dd>
                </div>
            </dl>

            {prediction.doctorNotes && (
                <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Doctor notes
                    </div>
                    <p className="whitespace-pre-wrap text-base rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                        {prediction.doctorNotes}
                    </p>
                </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg border-sky-400/40 text-sky-200 hover:bg-sky-500/15"
                    onClick={onUpdate}
                >
                    <Edit3 className="h-4 w-4" />
                    Update decision
                </Button>
                {prediction.doctorDecision === 'OVERRIDDEN' && (
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-lg border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/15"
                        onClick={onAccept}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Accept instead
                    </Button>
                )}
            </div>
        </div>
    );
}

function AcceptEditor({
    recommendedTreatment,
    notes,
    onNotesChange,
    onCancel,
    onSubmit,
    isSubmitting,
}: {
    recommendedTreatment: TreatmentLabel;
    notes: string;
    onNotesChange: (v: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}) {
    return (
        <div className="space-y-4 rounded-lg border border-emerald-400/20 bg-emerald-500/[0.04] p-4">
            <p className="text-sm text-emerald-200/90">
                Accepting will record{' '}
                <span className="font-semibold">{recommendedTreatment}</span> as the final
                treatment.
            </p>

            <NotesField value={notes} onChange={onNotesChange} disabled={isSubmitting} />

            <EditorFooter
                onCancel={onCancel}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                submitLabel="Confirm accept"
                submitClass="rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 hover:bg-emerald-500/30"
            />
        </div>
    );
}

function OverrideEditor({
    recommendedTreatment,
    overrideTreatment,
    onTreatmentChange,
    treatmentError,
    notes,
    onNotesChange,
    onCancel,
    onSubmit,
    isSubmitting,
}: {
    recommendedTreatment: TreatmentLabel;
    overrideTreatment: TreatmentLabel | '';
    onTreatmentChange: (t: TreatmentLabel | '') => void;
    treatmentError: string | null;
    notes: string;
    onNotesChange: (v: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}) {
    return (
        <div className="space-y-4 rounded-lg border border-sky-400/20 bg-sky-500/[0.04] p-4">
            <p className="text-sm text-sky-200/90">
                Override the model recommendation (
                <span className="font-semibold">{recommendedTreatment}</span>) with an
                alternative treatment.
            </p>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Final treatment <span className="text-destructive">*</span>
                </Label>
                <Select
                    value={overrideTreatment || undefined}
                    onValueChange={(v) => onTreatmentChange(v as TreatmentLabel)}
                    disabled={isSubmitting}
                >
                    <SelectTrigger
                        className={`w-full rounded-lg border-white/10 bg-white/[0.04] h-9 text-base ${
                            treatmentError ? 'border-destructive/60' : ''
                        }`}
                        aria-invalid={!!treatmentError}
                    >
                        <SelectValue placeholder="Choose a treatment…" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg border-white/10 bg-card">
                        {TREATMENT_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>
                                {t}
                                {t === recommendedTreatment && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        (recommended)
                                    </span>
                                )}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {treatmentError && (
                    <p
                        role="alert"
                        className="flex items-center gap-1.5 text-xs text-destructive"
                    >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {treatmentError}
                    </p>
                )}
            </div>

            <NotesField value={notes} onChange={onNotesChange} disabled={isSubmitting} />

            <EditorFooter
                onCancel={onCancel}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                submitLabel="Confirm override"
                submitClass="rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-100 hover:bg-sky-500/30"
            />
        </div>
    );
}

function NotesField({
    value,
    onChange,
    disabled,
}: {
    value: string;
    onChange: (v: string) => void;
    disabled: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Doctor notes{' '}
                <span className="text-muted-foreground/50 normal-case italic font-normal">
                    (optional, max {NOTES_MAX})
                </span>
            </Label>
            <textarea
                rows={3}
                maxLength={NOTES_MAX}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Clinical rationale, patient preferences, follow-up plan…"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] text-base px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 resize-none"
            />
            <div className="flex justify-end">
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                    {value.length}/{NOTES_MAX}
                </span>
            </div>
        </div>
    );
}

function EditorFooter({
    onCancel,
    onSubmit,
    isSubmitting,
    submitLabel,
    submitClass,
}: {
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    submitLabel: string;
    submitClass: string;
}) {
    return (
        <div className="flex justify-end gap-2 pt-1">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-lg border-white/10"
            >
                Cancel
            </Button>
            <Button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className={submitClass}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                    </>
                ) : (
                    submitLabel
                )}
            </Button>
        </div>
    );
}
