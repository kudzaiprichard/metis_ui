/**
 * InferencePredict — page-level orchestrator for the stateless single-patient
 * prediction surface described in spec §5 "Module: Inference".
 *
 * Layout: a three-column grid on lg+ (recent rail · form · helper rail) so
 * the form sits inside a balanced page rather than alone on a near-empty
 * page. Sub-lg collapses to a single column.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Brain, FlaskConical, Sparkles } from 'lucide-react';

import { usePredictWithExplanation } from '../hooks/useInference';
import { PredictionForm } from './PredictionForm';
import { PredictionResult } from './result/PredictionResult';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { ERROR_CODES } from '@/src/lib/constants';
import { saveRecent, type RecentEntry } from '../lib/recent-predictions';
import type { ClinicalFeaturesValues } from '@/src/lib/schemas/clinical';
import type { PredictRequest } from '../api/inference.types';

import { RecentPredictionsRail } from './rails/RecentPredictionsRail';
import { PresetsRail } from './rails/PresetsRail';
import { ReferenceCard } from './rails/ReferenceCard';

export function InferencePredict() {
    const mutation = usePredictWithExplanation();
    const { showToast } = useToast();
    const resultAnchorRef = useRef<HTMLDivElement | null>(null);

    // Lifted form-seed state — bumping `seed` (with a fresh reference) re-runs
    // the form's reset effect with the supplied values.
    const [seed, setSeed] = useState<ClinicalFeaturesValues | undefined>(undefined);
    const [activeRecentId, setActiveRecentId] = useState<string | null>(null);
    // Capture the request body at submit time so we can persist it (with the
    // matching response decision) to the recent rail on success.
    const lastPayloadRef = useRef<PredictRequest | null>(null);

    // Scroll the result panel into view whenever a new prediction returns.
    useEffect(() => {
        if (mutation.data && resultAnchorRef.current) {
            resultAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [mutation.data]);

    // Persist successful predictions to the local recent rail.
    useEffect(() => {
        if (!mutation.data || !lastPayloadRef.current) return;
        saveRecent({
            payload: lastPayloadRef.current,
            treatment: mutation.data.decision.recommendedTreatment,
            confidencePct: mutation.data.decision.confidencePct,
            confidenceLabel: mutation.data.decision.confidenceLabel,
        });
        lastPayloadRef.current = null;
    }, [mutation.data]);

    // Surface server errors as toasts.
    useEffect(() => {
        const err = mutation.error as ApiError | null;
        if (!err) return;
        if (err.code === ERROR_CODES.MODEL_NOT_FOUND) {
            showToast(
                'Model unavailable',
                'The inference model is not loaded on the server. Please contact an administrator.',
                'error',
            );
        } else {
            showToast('Inference failed', err.getMessage(), 'error');
        }
    }, [mutation.error, showToast]);

    const handleSubmit = (payload: PredictRequest) => {
        lastPayloadRef.current = payload;
        setActiveRecentId(null);
        mutation.mutate(payload);
    };

    const handleApplyPreset = (values: ClinicalFeaturesValues) => {
        setActiveRecentId(null);
        // Spread to give the seed a fresh reference so the form's effect fires
        // even if the same preset is selected twice.
        setSeed({ ...values });
    };

    const handleRestoreRecent = (values: ClinicalFeaturesValues, entry: RecentEntry) => {
        setActiveRecentId(entry.id);
        setSeed({ ...values });
    };

    return (
        <div className="pb-24">
            <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <Brain className="h-7 w-7 text-primary" />
                        Stateless Inference
                    </h1>
                    <p className="text-sm text-muted-foreground/70 mt-1 max-w-3xl">
                        Run a one-off prediction against the NeuralThompson bandit model. Nothing
                        is persisted server-side — use the Predictions module to store a result
                        against a patient medical record.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/70 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Session-only history · device-local
                </div>
            </header>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left rail — slim */}
                <div className="lg:col-span-2 flex flex-col gap-4 lg:order-1 order-2">
                    <RecentPredictionsRail
                        onRestore={handleRestoreRecent}
                        activeId={activeRecentId}
                    />
                </div>

                {/* Form column — gets the lion's share of the page */}
                <section className="lg:col-span-8 lg:order-2 order-1 rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm p-5 sm:p-7 shadow-[0_2px_24px_rgba(16,185,129,0.04)]">
                    <header className="flex items-center gap-2.5 mb-1">
                        <FlaskConical className="h-4 w-4 text-primary" />
                        <h2 className="text-md font-semibold text-foreground">Clinical features</h2>
                    </header>
                    <p className="text-sm text-muted-foreground/70 mb-6">
                        Enter all 16 features. Ranges are enforced locally and server-side —
                        out-of-range values are rejected before dispatch.
                    </p>
                    <PredictionForm
                        onSubmit={handleSubmit}
                        onReset={() => {
                            mutation.reset();
                            setActiveRecentId(null);
                        }}
                        isPending={mutation.isPending}
                        seed={seed}
                    />
                </section>

                {/* Right rail — slim */}
                <div className="lg:col-span-2 flex flex-col gap-4 lg:order-3 order-3">
                    <PresetsRail onApply={handleApplyPreset} />
                    <ReferenceCard />
                </div>
            </div>

            <div ref={resultAnchorRef} className="mt-8" />

            {mutation.isError && !mutation.data && (
                <div className="border border-rose-500/30 bg-rose-500/5 p-4 flex items-start gap-3 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-base font-semibold text-rose-200">
                            Inference request failed
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {(mutation.error as ApiError).getFullMessage()}
                        </p>
                    </div>
                </div>
            )}

            {mutation.data && <PredictionResult result={mutation.data} />}
        </div>
    );
}
