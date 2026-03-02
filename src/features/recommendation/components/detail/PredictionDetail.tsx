'use client';

import { useRecommendation } from '../../hooks/useRecommendations';
import { PredictionHeader } from './PredictionHeader';
import { PredictionOverview } from './PredictionOverview';
import { QValuesSection } from './QValuesSection';
import { ExplanationSection } from './ExplanationSection';
import { SafetyWarningsSection } from './SafetyWarningsSection';
import { AlternativesSection } from './AlternativesSection';
import { PredictionSkeleton } from '../shared/PredictionSkeleton';
import { Loader2, CircleAlert } from 'lucide-react';

interface PredictionDetailProps {
    predictionId: string;
}

export function PredictionDetail({ predictionId }: PredictionDetailProps) {
    const { data: prediction, isLoading, error } = useRecommendation(predictionId);

    if (isLoading) {
        return (
            <div className="max-w-[1200px] mx-auto pb-24">
                <PredictionSkeleton variant="detail" />
            </div>
        );
    }

    if (error || !prediction) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-[14px]">
                <CircleAlert className="h-7 w-7 text-red-500" />
                <span>Error loading prediction details</span>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto pb-24">
            <PredictionHeader prediction={prediction} />
            <PredictionOverview prediction={prediction} />

            {prediction.q_values && prediction.q_values.length > 0 && (
                <QValuesSection qValues={prediction.q_values} />
            )}

            {prediction.explanation && (
                <ExplanationSection explanation={prediction.explanation} />
            )}

            {prediction.explanation?.alternatives && prediction.explanation.alternatives.length > 0 && (
                <AlternativesSection alternatives={prediction.explanation.alternatives} />
            )}

            {prediction.safety_warnings && prediction.safety_warnings.length > 0 && (
                <SafetyWarningsSection warnings={prediction.safety_warnings} />
            )}
        </div>
    );
}