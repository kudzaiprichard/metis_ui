/**
 * PredictionDetail — container for a stored prediction
 * (spec §5 "Module: Predictions" — GET /predictions/{id}).
 *
 * Layout: a widget-driven dashboard rather than a linear list. The most
 * decision-critical signals (treatment, confidence, safety, decision state)
 * surface in the hero + key-stats strip at the top. The body splits into
 * an analytics column (visualisations) and a doctor-action column (the
 * decision panel + record metadata). Narrative panels (safety, fairness,
 * explanation) live below in a 2-column grid.
 */

'use client';

import Link from 'next/link';
import { ArrowLeft, CircleAlert } from 'lucide-react';

import { usePrediction } from '../../hooks/useRecommendations';
import { PredictionSkeleton } from '../shared/PredictionSkeleton';
import { DoctorDecisionPanel } from './DoctorDecisionPanel';
import { PredictionSafetyPanel } from './panels/PredictionSafetyPanel';
import { PredictionFairnessPanel } from './panels/PredictionFairnessPanel';
import { StoredExplanationPanel } from './panels/StoredExplanationPanel';
import { PredictionHero } from './widgets/PredictionHero';
import { KeyStatsStrip } from './widgets/KeyStatsStrip';
import { TreatmentPodium } from './widgets/TreatmentPodium';
import { PosteriorMeansWidget } from './widgets/PosteriorMeansWidget';
import { PredictionMetaCard } from './widgets/PredictionMetaCard';

interface PredictionDetailProps {
    predictionId: string;
}

export function PredictionDetail({ predictionId }: PredictionDetailProps) {
    const { data: prediction, isLoading, error } = usePrediction(predictionId);

    if (isLoading) {
        return (
            <div className="pb-24">
                <PredictionSkeleton variant="detail" />
            </div>
        );
    }

    if (error || !prediction) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <CircleAlert className="h-7 w-7 text-destructive" />
                <span>{error?.getMessage() ?? 'Error loading prediction details'}</span>
            </div>
        );
    }

    const subtitle = `${prediction.recommendedTreatment} · ${prediction.confidenceLabel} confidence · Created ${new Date(
        prediction.createdAt,
    ).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`;

    return (
        <div className="pb-24 space-y-5">
            <Link
                href={`/doctor/patients/${prediction.patientId}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to patient
            </Link>

            <header>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Prediction Details
                </h1>
                <p className="text-base text-muted-foreground mt-1">{subtitle}</p>
            </header>

            {/* High-impact summary at the top */}
            <PredictionHero prediction={prediction} />
            <KeyStatsStrip prediction={prediction} />

            {/* Analytics on the left, doctor action on the right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-8 flex flex-col gap-5">
                    <TreatmentPodium prediction={prediction} />
                    <PosteriorMeansWidget prediction={prediction} />
                </div>
                <aside className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-6">
                    <DoctorDecisionPanel prediction={prediction} />
                    <PredictionMetaCard prediction={prediction} />
                </aside>
            </div>

            {/* Narrative — explanation gets the wider column, safety/fairness stack on the right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7">
                    <StoredExplanationPanel explanation={prediction.explanation} />
                </div>
                <div className="lg:col-span-5 flex flex-col gap-5">
                    <PredictionSafetyPanel prediction={prediction} />
                    <PredictionFairnessPanel prediction={prediction} />
                </div>
            </div>
        </div>
    );
}
