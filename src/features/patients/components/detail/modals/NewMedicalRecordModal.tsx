'use client';

import { useEffect } from 'react';
import { useForm, Controller, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/src/components/shadcn/dialog';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Textarea } from '@/src/components/shadcn/textarea';
import { Label } from '@/src/components/shadcn/label';
import { Checkbox } from '@/src/components/shadcn/checkbox';
import { ScrollArea } from '@/src/components/shadcn/scroll-area';
import { useCreateMedicalRecord } from '../../../hooks/usePatients';
import { CreateMedicalRecordRequest } from '../../../api/patients.types';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import {
    medicalRecordCreateSchema,
    type MedicalRecordCreateValues,
} from '@/src/lib/schemas/patients';
import { Plus, Loader2 } from 'lucide-react';

interface NewMedicalRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
}

/**
 * Spec §5 Patients "CreateMedicalRecordRequest" — the schema in
 * `src/lib/schemas/patients.ts` is the source of truth for ranges and
 * notes length; the layout array below only describes how each field
 * is presented in the form.
 */
const SPEC_FIELDS = [
    { key: 'age', label: 'Age (years)', step: 1, hint: '' },
    { key: 'bmi', label: 'BMI (kg/m²)', step: 0.1, hint: 'Normal: 18.5–24.9' },
    { key: 'hba1c_baseline', label: 'HbA1c Baseline (%)', step: 0.01, hint: 'Normal: 4.0–5.6%' },
    { key: 'egfr', label: 'eGFR (mL/min/1.73m²)', step: 0.1, hint: 'Normal: >90' },
    { key: 'diabetes_duration', label: 'Diabetes Duration (yrs)', step: 0.1, hint: '' },
    { key: 'fasting_glucose', label: 'Fasting Glucose (mg/dL)', step: 0.1, hint: 'Normal: 70–100' },
    { key: 'c_peptide', label: 'C-Peptide (ng/mL)', step: 0.01, hint: 'Normal: 1.1–4.4' },
    { key: 'bp_systolic', label: 'BP Systolic (mmHg)', step: 1, hint: 'Normal: <120' },
    { key: 'ldl', label: 'LDL (mg/dL)', step: 0.1, hint: 'Optimal: <100' },
    { key: 'hdl', label: 'HDL (mg/dL)', step: 0.1, hint: 'Normal: >40 (M), >50 (F)' },
    { key: 'triglycerides', label: 'Triglycerides (mg/dL)', step: 0.1, hint: 'Normal: <150' },
    { key: 'alt', label: 'ALT (U/L)', step: 0.1, hint: 'Normal: 7–56' },
] as const;

const COMORBIDITIES = [
    { key: 'hypertension', label: 'Hypertension' },
    { key: 'ckd', label: 'Chronic Kidney Disease (CKD)' },
    { key: 'cvd', label: 'Cardiovascular Disease (CVD)' },
    { key: 'nafld', label: 'NAFLD (Fatty Liver Disease)' },
] as const;

const NOTES_MAX = 1000;

type NumericKey = (typeof SPEC_FIELDS)[number]['key'];
type BinaryKey = (typeof COMORBIDITIES)[number]['key'];

const defaultValues: MedicalRecordCreateValues = {
    age: NaN,
    bmi: NaN,
    hba1c_baseline: NaN,
    egfr: NaN,
    diabetes_duration: NaN,
    fasting_glucose: NaN,
    c_peptide: NaN,
    bp_systolic: NaN,
    ldl: NaN,
    hdl: NaN,
    triglycerides: NaN,
    alt: NaN,
    cvd: 0,
    ckd: 0,
    nafld: 0,
    hypertension: 0,
    notes: '',
};

export function NewMedicalRecordModal({
    isOpen,
    onClose,
    patientId,
}: NewMedicalRecordModalProps) {
    const createRecord = useCreateMedicalRecord();
    const { showToast } = useToast();

    const form = useForm<MedicalRecordCreateValues>({
        resolver: zodResolver(medicalRecordCreateSchema),
        defaultValues,
    });

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = form;

    useEffect(() => {
        if (!isOpen) reset(defaultValues);
    }, [isOpen, reset]);

    const notesValue = watch('notes') ?? '';

    const onSubmit = (values: MedicalRecordCreateValues) => {
        const payload: CreateMedicalRecordRequest = {
            age: values.age,
            bmi: values.bmi,
            hba1c_baseline: values.hba1c_baseline,
            egfr: values.egfr,
            diabetes_duration: values.diabetes_duration,
            fasting_glucose: values.fasting_glucose,
            c_peptide: values.c_peptide,
            bp_systolic: values.bp_systolic,
            ldl: values.ldl,
            hdl: values.hdl,
            triglycerides: values.triglycerides,
            alt: values.alt,
            cvd: values.cvd,
            ckd: values.ckd,
            nafld: values.nafld,
            hypertension: values.hypertension,
        };
        if (values.notes.trim()) payload.notes = values.notes.trim();

        createRecord.mutate(
            { patientId, data: payload },
            {
                onSuccess: () => {
                    showToast(
                        'Record Created',
                        'New medical record has been created successfully',
                        'success',
                    );
                    onClose();
                },
                onError: (error: ApiError) => {
                    showToast('Creation Failed', error.getMessage(), 'error');
                },
            },
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[820px] !max-h-[90vh] !h-[90vh] !grid-rows-[auto_minmax(0,1fr)_auto] !grid-cols-1 p-0 !gap-0 rounded-lg border-white/10 bg-background/95 backdrop-blur-xl">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/5">
                    <DialogTitle>New Medical Record</DialogTitle>
                    <DialogDescription className="text-xs">
                        Enter the 16 clinical features used for ML inference
                    </DialogDescription>
                </DialogHeader>

                {/*
                  The dialog uses an explicit grid (`grid-rows-[auto_minmax(0,1fr)_auto]`)
                  so the middle row has a hard height. ScrollArea fills it via
                  `h-full` and uses the themed scrollbar (track/thumb match the
                  border tokens) instead of the OS-default chrome.
                */}
                <ScrollArea className="h-full">
                    <form
                        id="new-medical-record-form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="px-6 py-5 space-y-5"
                        noValidate
                    >
                        <ClinicalFeaturesGrid form={form} disabled={createRecord.isPending} />
                        <ComorbiditiesGrid control={control} disabled={createRecord.isPending} />

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5">
                                Notes
                            </h3>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Clinical Notes{' '}
                                    <span className="text-muted-foreground/50 normal-case italic font-normal">
                                        (optional, max {NOTES_MAX})
                                    </span>
                                </Label>
                                <Textarea
                                    maxLength={NOTES_MAX}
                                    rows={4}
                                    disabled={createRecord.isPending}
                                    aria-invalid={!!errors.notes}
                                    {...register('notes')}
                                    className={`rounded-lg border-white/10 bg-white/[0.03] text-base resize-none ${
                                        errors.notes ? 'border-destructive/40' : ''
                                    }`}
                                    placeholder="Any additional clinical context, symptoms, or observations…"
                                />
                                <div className="flex justify-between items-center">
                                    {errors.notes ? (
                                        <p className="text-xs text-destructive">
                                            {errors.notes.message}
                                        </p>
                                    ) : (
                                        <span />
                                    )}
                                    <span className="text-xs text-muted-foreground/60 tabular-nums">
                                        {notesValue.length}/{NOTES_MAX}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </form>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t border-white/5 bg-background/95 backdrop-blur-xl">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={createRecord.isPending}
                        className="rounded-lg border-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="new-medical-record-form"
                        disabled={createRecord.isPending}
                        className="rounded-lg"
                    >
                        {createRecord.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" /> Create Record
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ClinicalFeaturesGrid({
    form,
    disabled,
}: {
    form: UseFormReturn<MedicalRecordCreateValues>;
    disabled: boolean;
}) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5">
                Clinical Features
            </h3>
            <div className="grid grid-cols-3 gap-4">
                {SPEC_FIELDS.map((f) => {
                    const fieldError = errors[f.key as NumericKey]?.message as string | undefined;
                    return (
                        <div key={f.key} className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {f.label} *
                            </Label>
                            <Input
                                type="number"
                                step={f.step}
                                disabled={disabled}
                                aria-invalid={!!fieldError}
                                {...register(f.key as NumericKey, { valueAsNumber: true })}
                                className={`rounded-lg border-white/10 bg-white/[0.03] text-base ${
                                    fieldError ? 'border-destructive/40' : ''
                                }`}
                            />
                            {f.hint && !fieldError && (
                                <span className="text-xs text-muted-foreground/60 italic">
                                    {f.hint}
                                </span>
                            )}
                            {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ComorbiditiesGrid({
    control,
    disabled,
}: {
    control: UseFormReturn<MedicalRecordCreateValues>['control'];
    disabled: boolean;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5">
                Comorbidities
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {COMORBIDITIES.map((c) => (
                    <Controller
                        key={c.key}
                        control={control}
                        name={c.key as BinaryKey}
                        render={({ field }) => (
                            <label className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer text-base text-muted-foreground hover:bg-white/[0.04] transition-colors">
                                <Checkbox
                                    checked={field.value === 1}
                                    onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                                    disabled={disabled}
                                    className="rounded-lg border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground"
                                />
                                <span>{c.label}</span>
                            </label>
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
