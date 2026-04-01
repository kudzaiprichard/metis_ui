'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Card } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Switch } from '@/src/components/shadcn/switch';
import {
    SimulationLifecycle,
    SimulationUploadConfig,
    DEFAULT_UPLOAD_CONFIG,
} from '../types';
import {
    validatePatientCsv,
    type CsvValidationResult,
} from '../lib/csv-validation';
import {
    CONFIG_RANGES,
    hasConfigErrors,
    validateSimulationConfig,
} from '../lib/config-validation';
import {
    Upload,
    FileSpreadsheet,
    CheckCircle,
    CircleAlert,
    Settings,
    Trash2,
    ChevronDown,
    ChevronUp,
    Loader2,
    Info,
} from 'lucide-react';

interface DatasetUploaderProps {
    status: SimulationLifecycle;
    error: string | null;
    csvErrors: string[] | null;
    onUpload: (file: File, config: SimulationUploadConfig) => Promise<void>;
    onReset: () => void;
    totalSteps: number;
}

export function DatasetUploader({
    status,
    error,
    csvErrors,
    onUpload,
    onReset,
    totalSteps,
}: DatasetUploaderProps) {
    const [dragOver, setDragOver] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [config, setConfig] = useState<SimulationUploadConfig>(DEFAULT_UPLOAD_CONFIG);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [fileError, setFileError] = useState<string | null>(null);
    const [validation, setValidation] = useState<CsvValidationResult | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

    const handleFile = useCallback(async (file: File) => {
        setFileError(null);
        setValidation(null);
        if (!file.name.endsWith('.csv')) {
            setFileError('File must be a .csv file');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setFileError(
                `File exceeds the 20 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Reduce the dataset size and try again.`,
            );
            return;
        }
        setSelectedFile(file);

        // Run spec §6.2 validation client-side so users see specific errors
        // immediately instead of waiting for the server round-trip.
        setIsValidating(true);
        try {
            const result = await validatePatientCsv(file);
            setValidation(result);
        } catch (err) {
            setValidation({
                valid: false,
                rowCount: 0,
                errors: [
                    err instanceof Error
                        ? `Could not read file: ${err.message}`
                        : 'Could not read file.',
                ],
                truncatedCount: 0,
            });
        } finally {
            setIsValidating(false);
        }
    }, [MAX_FILE_SIZE]);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile],
    );

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            if (inputRef.current) inputRef.current.value = '';
        },
        [handleFile],
    );

    const configErrors = useMemo(() => validateSimulationConfig(config), [config]);
    const configInvalid = hasConfigErrors(configErrors);

    const handleStart = useCallback(() => {
        if (!selectedFile) return;
        if (isValidating || (validation && !validation.valid)) return;
        if (configInvalid) {
            setShowConfig(true);
            return;
        }
        onUpload(selectedFile, config);
    }, [selectedFile, config, onUpload, isValidating, validation, configInvalid]);

    const clearSelection = useCallback(() => {
        setSelectedFile(null);
        setValidation(null);
        setIsValidating(false);
    }, []);

    const isUploading = status === 'uploading';
    const validationFailed = Boolean(validation && !validation.valid);
    const startDisabled = isUploading || isValidating || validationFailed || configInvalid;
    const hasStarted =
        status !== 'idle' && status !== 'uploading' && status !== 'failed';

    // Simulation is active — show compact status bar
    if (hasStarted) {
        return (
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span className="text-base text-foreground font-semibold">
                        Simulation Active
                    </span>
                    <span className="text-sm text-muted-foreground">
                        —{' '}
                        <span className="text-foreground font-semibold">
                            {totalSteps}
                        </span>{' '}
                        patients in dataset
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="rounded-lg h-8 px-3 text-sm font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500"
                >
                    <Trash2 className="h-3 w-3 mr-1.5" />
                    New Simulation
                </Button>
            </div>
        );
    }

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5 mb-5">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2.5 mb-1.5">
                    <Settings className="h-4.5 w-4.5 text-primary" />
                    Upload Patient Dataset
                </h2>
                <p className="text-base text-muted-foreground">
                    Upload a CSV file with patient clinical features to run the
                    NeuralThompson bandit simulation
                </p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
            />

            {/* Drop zone / file selection */}
            {!selectedFile ? (
                <label
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        dragOver
                            ? 'border-primary/50 bg-primary/[0.08]'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                >
                    <div className="w-14 h-14 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                        {dragOver ? (
                            <FileSpreadsheet className="h-6 w-6 text-primary" />
                        ) : (
                            <Upload className="h-6 w-6 text-primary" />
                        )}
                    </div>
                    <p className="text-md font-semibold text-foreground mb-1">
                        {dragOver
                            ? 'Drop CSV file here'
                            : 'Click or drag to upload patient CSV'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                        CSV with 16 clinical features (age, bmi, hba1c_baseline,
                        egfr, ...) — minimum 100 patient rows
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            inputRef.current?.click();
                        }}
                        className="rounded-lg h-8 px-4 text-sm font-semibold border-white/15 bg-white/[0.04] text-foreground hover:bg-white/[0.08]"
                    >
                        <Upload className="h-3 w-3 mr-1.5" />
                        Choose CSV file
                    </Button>
                </label>
            ) : (
                <div className="space-y-4">
                    {/* Selected file preview */}
                    <div className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.03]">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-4 w-4 text-primary" />
                            <span className="text-base text-foreground font-semibold">
                                {selectedFile.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </span>
                            {isValidating && (
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Validating…
                                </span>
                            )}
                            {validation && validation.valid && (
                                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                    <CheckCircle className="h-3 w-3" />
                                    {validation.rowCount.toLocaleString()} rows OK
                                </span>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                            className="rounded-lg h-7 px-2 text-xs text-muted-foreground hover:text-red-400"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Config toggle */}
                    <button
                        onClick={() => setShowConfig((prev) => !prev)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showConfig ? (
                            <ChevronUp className="h-3 w-3" />
                        ) : (
                            <ChevronDown className="h-3 w-3" />
                        )}
                        Simulation Parameters
                    </button>

                    {/* Config form */}
                    {showConfig && (
                        <div className="p-4 border border-white/[0.08] bg-white/[0.02] space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <NumericField
                                    label="Initial Epsilon"
                                    range={CONFIG_RANGES.initialEpsilon}
                                    step="0.05"
                                    value={config.initialEpsilon}
                                    error={configErrors.initialEpsilon}
                                    onChange={(n) =>
                                        setConfig((c) => ({ ...c, initialEpsilon: n }))
                                    }
                                />
                                <NumericField
                                    label="Epsilon Decay"
                                    range={CONFIG_RANGES.epsilonDecay}
                                    step="0.001"
                                    value={config.epsilonDecay}
                                    error={configErrors.epsilonDecay}
                                    onChange={(n) =>
                                        setConfig((c) => ({ ...c, epsilonDecay: n }))
                                    }
                                />
                                <NumericField
                                    label="Min Epsilon"
                                    range={CONFIG_RANGES.minEpsilon}
                                    step="0.005"
                                    value={config.minEpsilon}
                                    error={configErrors.minEpsilon}
                                    onChange={(n) =>
                                        setConfig((c) => ({ ...c, minEpsilon: n }))
                                    }
                                />
                                <NumericField
                                    label="Random Seed"
                                    range={CONFIG_RANGES.randomSeed}
                                    step="1"
                                    value={config.randomSeed}
                                    error={configErrors.randomSeed}
                                    onChange={(n) =>
                                        setConfig((c) => ({ ...c, randomSeed: n }))
                                    }
                                />
                            </div>

                            {/* reset_posterior — spec §6.4 trade-off */}
                            <div className="border-t border-white/[0.06] pt-4">
                                <label
                                    htmlFor="reset-posterior-switch"
                                    className="flex items-center justify-between gap-4 mb-2 cursor-pointer"
                                >
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                            Reset Posterior
                                        </span>
                                        <p className="text-sm text-foreground font-semibold mt-0.5">
                                            {config.resetPosterior
                                                ? 'Learn from scratch'
                                                : 'Use pre-trained beliefs'}
                                        </p>
                                    </div>
                                    <Switch
                                        id="reset-posterior-switch"
                                        checked={config.resetPosterior}
                                        onCheckedChange={(checked) =>
                                            setConfig((c) => ({
                                                ...c,
                                                resetPosterior: checked,
                                            }))
                                        }
                                        aria-label="Toggle reset posterior"
                                    />
                                </label>
                                <div className="flex items-start gap-2 p-3 bg-primary/[0.04] border border-primary/15">
                                    <Info className="h-3.5 w-3.5 text-primary/80 mt-[2px] flex-shrink-0" />
                                    <div className="text-xs text-muted-foreground leading-relaxed space-y-1.5">
                                        <p>
                                            This switch changes the bandit&apos;s
                                            starting knowledge, which materially
                                            changes the shape of the curves you&apos;ll
                                            see.
                                        </p>
                                        <p>
                                            <span className="font-semibold text-emerald-300">
                                                On (default):
                                            </span>{' '}
                                            the Bayesian posterior is reset to an
                                            uninformed prior. Early steps are highly
                                            exploratory and the model must learn
                                            which treatments work. Produces a clean
                                            learning curve — best for studying
                                            exploration vs. exploitation or
                                            comparing datasets from the same
                                            starting point.
                                        </p>
                                        <p>
                                            <span className="font-semibold text-warning">
                                                Off:
                                            </span>{' '}
                                            the posterior from the trained
                                            checkpoint is used as-is. The bandit
                                            exploits from step 1 with higher early
                                            accuracy but much less exploration — a
                                            flatter curve. Use this to simulate
                                            real-world deployment behaviour.
                                        </p>
                                        <p className="text-muted-foreground/70">
                                            Neural-network weights are the same in
                                            both modes; only the Bayesian posterior
                                            differs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Start button */}
                    <Button
                        onClick={handleStart}
                        disabled={startDisabled}
                        className="rounded-lg h-10 px-6 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground w-full"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                Uploading & Validating...
                            </>
                        ) : isValidating ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                Validating CSV...
                            </>
                        ) : validationFailed ? (
                            <>
                                <CircleAlert className="h-3.5 w-3.5 mr-2" />
                                Fix CSV errors to continue
                            </>
                        ) : configInvalid ? (
                            <>
                                <CircleAlert className="h-3.5 w-3.5 mr-2" />
                                Fix simulation parameters to continue
                            </>
                        ) : (
                            <>
                                <Upload className="h-3.5 w-3.5 mr-2" />
                                Start Simulation
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Client-side file validation error (extension / size) */}
            {fileError && (
                <div className="mt-3 p-3 bg-red-500/[0.08] border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <CircleAlert className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-red-400">
                            {fileError}
                        </span>
                    </div>
                </div>
            )}

            {/* Client-side CSV content validation (spec §6.2) */}
            {validationFailed && validation && (
                <div className="mt-3 p-3 bg-red-500/[0.08] border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <CircleAlert className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-red-400">
                            CSV validation failed with {validation.errors.length + validation.truncatedCount} error
                            {validation.errors.length + validation.truncatedCount === 1 ? '' : 's'}
                        </span>
                    </div>
                    <ul className="mt-2 space-y-0.5 ml-5">
                        {validation.errors.map((line, i) => (
                            <li key={i} className="text-xs text-red-400/80 list-disc">
                                {line}
                            </li>
                        ))}
                        {validation.truncatedCount > 0 && (
                            <li className="text-xs text-red-400/60 italic list-disc">
                                …and {validation.truncatedCount} more error
                                {validation.truncatedCount === 1 ? '' : 's'}. Fix these first and re-check.
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {/* Server error display */}
            {error && (
                <div className="mt-3 p-3 bg-red-500/[0.08] border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <CircleAlert className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-red-400">
                            {error}
                        </span>
                    </div>
                    {csvErrors && csvErrors.length > 0 && (
                        <ul className="mt-2 space-y-0.5 ml-5">
                            {csvErrors.map((line, i) => (
                                <li
                                    key={i}
                                    className="text-xs text-red-400/80 list-disc"
                                >
                                    {line}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </Card>
    );
}

interface NumericFieldProps {
    label: string;
    range: { min: number; max: number; integer?: boolean };
    step: string;
    value: number;
    error: string | null;
    onChange: (n: number) => void;
}

function NumericField({ label, range, step, value, error, onChange }: NumericFieldProps) {
    // Accept NaN in state (from an empty input) so the validator can flag it
    // without us silently papering over it with a default. React rejects
    // `value={NaN}`, so render empty string instead.
    const inputValue = Number.isNaN(value) ? '' : String(value);
    return (
        <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                {label}
            </span>
            <Input
                type="number"
                step={step}
                min={range.min}
                max={range.max}
                value={inputValue}
                onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                        onChange(NaN);
                        return;
                    }
                    const n = range.integer ? parseInt(raw, 10) : parseFloat(raw);
                    onChange(n);
                }}
                aria-invalid={error !== null}
                className={`h-8 text-sm bg-white/[0.05] rounded-lg ${
                    error ? 'border-red-500/50 focus-visible:border-red-500/70' : 'border-white/10'
                }`}
            />
            <span
                className={`text-xs ${
                    error ? 'text-red-400' : 'text-muted-foreground/60'
                }`}
            >
                {error ?? `Range: ${range.min} – ${range.max}`}
            </span>
        </label>
    );
}
