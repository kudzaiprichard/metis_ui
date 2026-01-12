// src/features/recommendations/components/detail/PredictionOverview.tsx

/**
 * PredictionOverview Component
 * Displays recommended treatment and main prediction statistics
 */

'use client';

import { PredictionDetail } from '../../api/recommendations.types';
import { TreatmentBadge } from '../shared/TreatmentBadge';
import { ConfidenceBadge } from '../shared/ConfidenceBadge';

interface PredictionOverviewProps {
    prediction: PredictionDetail;
}

export function PredictionOverview({ prediction }: PredictionOverviewProps) {
    const confidenceScore = parseFloat(prediction.confidence_score);
    const predictedReduction = parseFloat(prediction.predicted_reduction);
    const confidenceMargin = parseFloat(prediction.confidence_margin);

    return (
        <>
            <div className="overview-card">
                <div className="overview-header">
                    <h2 className="section-title">
                        <i className="fa-solid fa-chart-line"></i>
                        Prediction Overview
                    </h2>
                </div>

                {/* Recommended Treatment */}
                <div className="treatment-section">
                    <div className="treatment-header">
                        <span className="treatment-label">Recommended Treatment</span>
                        <div className="treatment-badge-wrapper">
                            <TreatmentBadge treatment={prediction.recommended_treatment} variant="large" />
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="stats-grid">
                    {/* Predicted Reduction */}
                    <div className="stat-card primary">
                        <div className="stat-icon-wrapper">
                            <i className="fa-solid fa-arrow-trend-down"></i>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Predicted HbA1c Reduction</span>
                            <span className="stat-value">{predictedReduction.toFixed(2)}%</span>
                            <span className="stat-description">Expected improvement from baseline</span>
                        </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="stat-card">
                        <div className="stat-icon-wrapper">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Confidence Score</span>
                            <div className="stat-value-with-badge">
                                <span className="stat-value">{confidenceScore.toFixed(1)}%</span>
                                <ConfidenceBadge score={confidenceScore} showLabel={false} />
                            </div>
                            <span className="stat-description">Model confidence in prediction</span>
                        </div>
                    </div>

                    {/* Confidence Margin */}
                    <div className="stat-card">
                        <div className="stat-icon-wrapper">
                            <i className="fa-solid fa-chart-simple"></i>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Confidence Margin</span>
                            <span className="stat-value">{confidenceMargin.toFixed(1)}%</span>
                            <span className="stat-description">Advantage over second-best option</span>
                        </div>
                    </div>

                    {/* Treatment Rank */}
                    <div className="stat-card">
                        <div className="stat-icon-wrapper">
                            <i className="fa-solid fa-ranking-star"></i>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Treatment Rank</span>
                            <span className="stat-value">#{prediction.treatment_index}</span>
                            <span className="stat-description">Position in treatment options</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .overview-card {
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    margin-bottom: 20px;
                }

                .overview-header {
                    margin-bottom: 20px;
                }

                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 0;
                }

                .section-title i {
                    color: #34d399;
                    font-size: 18px;
                }

                .treatment-section {
                    padding: 20px;
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px solid rgba(16, 185, 129, 0.15);
                    border-radius: 10px;
                    margin-bottom: 24px;
                }

                .treatment-header {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .treatment-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    font-weight: 600;
                }

                .treatment-badge-wrapper {
                    display: flex;
                    align-items: center;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .stat-card {
                    display: flex;
                    gap: 16px;
                    padding: 18px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }

                .stat-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                }

                .stat-card.primary {
                    background: rgba(16, 185, 129, 0.08);
                    border-color: rgba(16, 185, 129, 0.15);
                }

                .stat-card.primary:hover {
                    background: rgba(16, 185, 129, 0.12);
                    border-color: rgba(16, 185, 129, 0.2);
                }

                .stat-icon-wrapper {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: rgba(52, 211, 153, 0.12);
                    border: 1px solid rgba(52, 211, 153, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .stat-icon-wrapper i {
                    font-size: 18px;
                    color: #34d399;
                }

                .stat-content {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex: 1;
                    min-width: 0;
                }

                .stat-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    font-weight: 600;
                }

                .stat-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #ffffff;
                    letter-spacing: -0.5px;
                    line-height: 1;
                }

                .stat-card.primary .stat-value {
                    color: #34d399;
                }

                .stat-value-with-badge {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .stat-description {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    line-height: 1.4;
                }

                @media (max-width: 768px) {
                    .overview-card {
                        padding: 16px;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .stat-value {
                        font-size: 20px;
                    }

                    .stat-value-with-badge {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                }
            `}</style>
        </>
    );
}