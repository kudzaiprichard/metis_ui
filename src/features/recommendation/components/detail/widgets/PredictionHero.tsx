'use client';

import { AlertTriangle, Ban, Pill, ShieldCheck } from 'lucide-react';

import type {
    PredictionResponse,
    SafetyStatus,
} from '../../../api/recommendations.types';
import { DoctorDecisionBadge } from '../../shared/DoctorDecisionBadge';
import { ConfidenceRing } from './ConfidenceRing';

const SAFETY_STYLES: Record<
    SafetyStatus,
    { icon: typeof ShieldCheck; tone: string; label: string }
> = {
    CLEAR: {
        icon: ShieldCheck,
        tone: 'bg-primary/15 border-primary/30 text-primary',
        label: 'Safety: clear',
    },
    WARNING: {
        icon: AlertTriangle,
        tone: 'bg-warning/15 border-warning/30 text-warning',
        label: 'Safety: warning',
    },
    CONTRAINDICATION_FOUND: {
        icon: Ban,
        tone: 'bg-destructive/15 border-destructive/30 text-destructive',
        label: 'Safety: contraindication',
    },
};

interface PredictionHeroProps {
    prediction: PredictionResponse;
}

export function PredictionHero({ prediction }: PredictionHeroProps) {
    const safety = SAFETY_STYLES[prediction.safetyStatus] ?? SAFETY_STYLES.CLEAR;
    const SafetyIcon = safety.icon;

    return (
        <section
            aria-labelledby="prediction-hero-heading"
            className="relative overflow-hidden rounded-lg border border-primary/20 bg-card/30 backdrop-blur-sm"
        >
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent"
            />
            <div
                aria-hidden="true"
                className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-[80px]"
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 p-6 sm:p-7 items-center">
                {/* Left — treatment + meta */}
                <div className="space-y-3 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-primary/15 border border-primary/25 text-xs font-semibold text-primary uppercase tracking-wider">
                            <Pill className="h-3 w-3" />
                            Recommended treatment
                        </span>
                        <DoctorDecisionBadge decision={prediction.doctorDecision} />
                    </div>
                    <h2
                        id="prediction-hero-heading"
                        className="text-2xl sm:text-2xl font-bold tracking-tight text-foreground"
                    >
                        {prediction.recommendedTreatment}
                    </h2>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-2xl">
                        Top of the {Object.keys(prediction.winRates ?? {}).length || 5} candidate
                        treatments by Thompson posterior, ahead of {prediction.runnerUp} by{' '}
                        <span className="text-foreground font-semibold">
                            {(Number(prediction.runnerUpWinRate) * 100).toFixed(1)}%
                        </span>{' '}
                        win rate and a mean reward gap of{' '}
                        <span className="text-foreground font-semibold tabular-nums">
                            {Number(prediction.meanGap).toFixed(3)}
                        </span>
                        .
                    </p>

                    <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${safety.tone}`}
                    >
                        <SafetyIcon className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            {safety.label}
                        </span>
                    </div>
                </div>

                {/* Right — confidence ring */}
                <div className="flex items-center justify-center lg:justify-end">
                    <ConfidenceRing
                        pct={prediction.confidencePct}
                        label={prediction.confidenceLabel}
                        size={148}
                    />
                </div>
            </div>
        </section>
    );
}
