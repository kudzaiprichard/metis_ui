// src/features/recommendations/components/detail/PredictionDetail.tsx

/**
 * PredictionDetail Component
 * Main container for prediction detail page
 */

'use client';

import { useRecommendation } from '../../hooks/useRecommendations';
import { PredictionHeader } from './PredictionHeader';
import { PredictionOverview } from './PredictionOverview';
import { QValuesSection } from './QValuesSection';
import { ExplanationSection } from './ExplanationSection';
import { SafetyWarningsSection } from './SafetyWarningsSection';
import { AlternativesSection } from './AlternativesSection';
import { PredictionSkeleton } from '../shared/PredictionSkeleton';

interface PredictionDetailProps {
    predictionId: string;
}

export function PredictionDetail({ predictionId }: PredictionDetailProps) {
    const { data: prediction, isLoading, error } = useRecommendation(predictionId);

    if (isLoading) {
        return (
            <div className="prediction-detail-container">
                <PredictionSkeleton variant="detail" />
            </div>
        );
    }

    if (error || !prediction) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="error-message">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>Error loading prediction details</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="prediction-detail-container">
                {/* Header with patient info */}
                <PredictionHeader prediction={prediction} />

                {/* Main prediction overview */}
                <PredictionOverview prediction={prediction} />

                {/* Q-Values for all treatments */}
                {prediction.q_values && prediction.q_values.length > 0 && (
                    <QValuesSection qValues={prediction.q_values} />
                )}

                {/* Explanation with SHAP features */}
                {prediction.explanation && (
                    <ExplanationSection explanation={prediction.explanation} />
                )}

                {/* Alternative treatments */}
                {prediction.explanation?.alternatives && prediction.explanation.alternatives.length > 0 && (
                    <AlternativesSection alternatives={prediction.explanation.alternatives} />
                )}

                {/* Safety warnings */}
                {prediction.safety_warnings && prediction.safety_warnings.length > 0 && (
                    <SafetyWarningsSection warnings={prediction.safety_warnings} />
                )}
            </div>

            <style jsx>{`
                .prediction-detail-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-bottom: 100px;
                }

                .error-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    color: #ffffff;
                    font-size: 16px;
                }

                .error-message i {
                    font-size: 32px;
                    color: #ef4444;
                }

                @media (max-width: 768px) {
                    .prediction-detail-container {
                        padding: 0;
                    }
                }
            `}</style>
        </>
    );
}