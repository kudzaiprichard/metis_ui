/**
 * PredictionForm — collects the 16 clinical features required by
 * spec §5 "Module: Inference / PredictRequest" and dispatches the
 * prediction-with-explanation request.
 *
 * Validation is delegated to the shared `clinicalFeaturesSchema` via
 * `react-hook-form` + `zodResolver`, so range/required rules track the
 * design tokens defined in `src/lib/schemas/`.
 */

'use client';

import { useEffect, type ComponentType } from 'react';
import { useForm, Controller, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Activity,
    Brain,
    Droplet,
    FlaskConical,
    HeartPulse,
    Loader2,
    RotateCcw,
    ShieldAlert,
    User,
} from 'lucide-react';

import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import { useToast } from '@/src/components/shared/ui/toast';
import { PredictRequest } from '../api/inference.types';
import {
    clinicalFeaturesSchema,
    type ClinicalFeaturesValues,
} from '@/src/lib/schemas/clinical';
import {
    NUMERIC_FEATURES,
    BINARY_FEATURES,
    GROUP_TITLES,
    NumericFeatureKey,
    BinaryFeatureKey,
    NumericFeatureDef,
} from './feature-schema';

export interface PredictionFormProps {
    onSubmit: (payload: PredictRequest) => void;
    onReset?: () => void;
    isPending: boolean;
    /**
     * When this object reference changes, the form's values are replaced
     * with the provided values. Used by the "recent predictions" rail and
     * the preset profiles to seed the form without remounting it.
     */
    seed?: ClinicalFeaturesValues;
}

const INITIAL_VALUES: ClinicalFeaturesValues = {
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
};

export function PredictionForm({ onSubmit, onReset, isPending, seed }: PredictionFormProps) {
    const { showToast } = useToast();

    const form = useForm<ClinicalFeaturesValues>({
        resolver: zodResolver(clinicalFeaturesSchema),
        defaultValues: INITIAL_VALUES,
    });

    const { control, handleSubmit, reset, formState } = form;

    // Re-seed the form whenever the parent provides a new value snapshot
    // (clicking a recent prediction or a sample preset).
    useEffect(() => {
        if (seed) reset(seed);
    }, [seed, reset]);

    const submit = handleSubmit(
        (values) => {
            // The schema's output already matches the request body shape.
            onSubmit(values as PredictRequest);
        },
        () => {
            showToast(
                'Invalid input',
                'Fix the highlighted fields before running inference.',
                'error',
            );
        },
    );

    const handleReset = () => {
        reset(INITIAL_VALUES);
        onReset?.();
    };

    const groupsInOrder: NumericFeatureDef['group'][] = [
        'demographics',
        'vitals',
        'diabetes',
        'kidney-liver',
        'lipids',
    ];

    const groupIcons: Record<NumericFeatureDef['group'], ComponentType<{ className?: string }>> = {
        demographics: User,
        vitals: HeartPulse,
        diabetes: Droplet,
        'kidney-liver': FlaskConical,
        lipids: Activity,
    };

    // Pick a column count that matches the field count exactly so trailing
    // rows never sit half-empty. Each row is then perfectly aligned across
    // its siblings.
    const gridColsForCount = (count: number): string => {
        switch (count) {
            case 1:
                return 'grid-cols-1';
            case 2:
                return 'grid-cols-1 sm:grid-cols-2';
            case 3:
                return 'grid-cols-1 sm:grid-cols-3';
            case 4:
                return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';
            default:
                return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        }
    };

    return (
        <form onSubmit={submit} className="space-y-7" noValidate>
            {groupsInOrder.map((group) => {
                const defs = NUMERIC_FEATURES.filter((f) => f.group === group);
                if (defs.length === 0) return null;
                return (
                    <FormGroup
                        key={group}
                        title={GROUP_TITLES[group]}
                        icon={groupIcons[group]}
                    >
                        <div
                            className={`grid ${gridColsForCount(defs.length)} gap-x-4 gap-y-4 items-start`}
                        >
                            {defs.map((def) => (
                                <NumericField
                                    key={def.key}
                                    def={def}
                                    form={form}
                                    disabled={isPending}
                                />
                            ))}
                        </div>
                    </FormGroup>
                );
            })}

            <FormGroup title="Comorbidities" icon={ShieldAlert}>
                <div
                    className={`grid ${gridColsForCount(BINARY_FEATURES.length)} gap-x-4 gap-y-4 items-stretch`}
                >
                    {BINARY_FEATURES.map((def) => (
                        <Controller
                            key={def.key}
                            control={control}
                            name={def.key}
                            render={({ field, fieldState }) => (
                                <BinaryField
                                    label={def.label}
                                    description={def.description}
                                    value={field.value}
                                    error={fieldState.error?.message}
                                    disabled={isPending}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    ))}
                </div>
            </FormGroup>

            <div className="flex gap-2.5 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    disabled={isPending}
                    className="rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-10 text-base font-semibold px-5"
                >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Reset
                </Button>
                <Button
                    type="submit"
                    disabled={isPending || formState.isSubmitting}
                    className="flex-1 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground border-0 h-10 text-base font-semibold"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Running
                            inference…
                        </>
                    ) : (
                        <>
                            <Brain className="h-3.5 w-3.5 mr-1.5" /> Run prediction
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

function FormGroup({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon?: ComponentType<{ className?: string }>;
    children: React.ReactNode;
}) {
    return (
        <section>
            <h3 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                {Icon && <Icon className="h-3 w-3 text-primary/80" />}
                {title}
            </h3>
            {children}
        </section>
    );
}

function NumericField({
    def,
    form,
    disabled,
}: {
    def: NumericFeatureDef;
    form: UseFormReturn<ClinicalFeaturesValues>;
    disabled: boolean;
}) {
    const {
        register,
        formState: { errors },
    } = form;

    const error = errors[def.key as NumericFeatureKey]?.message as string | undefined;
    const labelId = `field-${def.key}-label`;

    // Each cell uses fixed-height label / input / hint blocks so every row in
    // the grid lines up regardless of label length or unit width.
    return (
        <div className="flex flex-col">
            <Label
                id={labelId}
                htmlFor={`field-${def.key}`}
                className="block h-9 leading-tight"
                title={def.label}
            >
                <span className="block truncate text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {def.label} <span className="text-destructive">*</span>
                </span>
                <span className="block truncate text-xs font-normal text-muted-foreground/60">
                    {def.unit}
                </span>
            </Label>
            <Input
                id={`field-${def.key}`}
                type="number"
                inputMode="decimal"
                step={def.step}
                disabled={disabled}
                aria-invalid={!!error}
                aria-labelledby={labelId}
                {...register(def.key as NumericFeatureKey, { valueAsNumber: true })}
                className={`rounded-lg border-white/10 bg-white/[0.04] h-10 text-base mt-1.5 ${
                    error ? 'border-destructive/50 focus-visible:border-destructive/70' : ''
                }`}
            />
            <p
                className={`text-xs mt-1.5 leading-4 h-4 truncate tabular-nums ${
                    error ? 'text-destructive' : 'text-muted-foreground/50'
                }`}
            >
                {error ?? `Range ${def.min}–${def.max}`}
            </p>
        </div>
    );
}

function BinaryField({
    label,
    description,
    value,
    error,
    disabled,
    onChange,
}: {
    label: string;
    description: string;
    value: 0 | 1 | undefined;
    error?: string;
    disabled: boolean;
    onChange: (v: 0 | 1) => void;
}) {
    return (
        <div
            className={`flex h-full flex-col justify-between gap-3 p-3.5 border rounded-lg ${
                error ? 'border-destructive/50' : 'border-white/10'
            } bg-white/[0.02]`}
        >
            <div className="min-h-[2.75rem]">
                <p className="text-base font-medium text-foreground leading-tight truncate">
                    {label}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5 leading-snug line-clamp-2">
                    {description}
                </p>
            </div>
            <div className="flex gap-2">
                <ToggleBtn active={value === 1} disabled={disabled} onClick={() => onChange(1)}>
                    Yes
                </ToggleBtn>
                <ToggleBtn active={value === 0} disabled={disabled} onClick={() => onChange(0)}>
                    No
                </ToggleBtn>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function ToggleBtn({
    active,
    disabled,
    onClick,
    children,
}: {
    active: boolean;
    disabled: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={active}
            disabled={disabled}
            onClick={onClick}
            className={`flex-1 h-8 text-sm font-semibold rounded-lg ${
                active
                    ? 'bg-primary/20 border-primary/50 text-foreground hover:bg-primary/25'
                    : 'bg-white/[0.03] border-white/10 text-muted-foreground hover:bg-white/[0.06]'
            }`}
        >
            {children}
        </Button>
    );
}

// Re-export feature key types for callers (keeps existing imports stable).
export type { BinaryFeatureKey, NumericFeatureKey };
