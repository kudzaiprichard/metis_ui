// src/features/recommendations/components/list/RecommendationCard.tsx

/**
 * RecommendationCard Component
 * Grid view card for displaying prediction information
 */

'use client';

import { useRouter } from 'next/navigation';
import { Prediction } from '../../api/recommendations.types';
import { ConfidenceBadge } from '../shared/ConfidenceBadge';
import { TreatmentBadge } from '../shared/TreatmentBadge';

interface RecommendationCardProps {
    prediction: Prediction;
    onDelete?: (prediction: Prediction) => void;
}

export function RecommendationCard({ prediction, onDelete }: RecommendationCardProps) {
    const router = useRouter();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleViewDetails = () => {
        router.push(`/doctor/predictions/${prediction.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(prediction);
        }
    };

    const confidenceScore = parseFloat(prediction.confidence_score);
    const predictedReduction = parseFloat(prediction.predicted_reduction);
    const confidenceMargin = parseFloat(prediction.confidence_margin);

    return (
        <>
            <div className="prediction-card" onClick={handleViewDetails}>
                <div className="card-header">
                    <div className="patient-info">
                        <div className="patient-name">
                            {prediction.patient.first_name} {prediction.patient.last_name}
                        </div>
                        <div className="patient-meta">
                            {prediction.patient.age} yrs • {prediction.patient.gender}
                        </div>
                    </div>
                    {onDelete && (
                        <button className="delete-btn" onClick={handleDelete}>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    )}
                </div>

                <div className="card-body">
                    <div className="treatment-section">
                        <div className="treatment-label">Recommended Treatment</div>
                        <div className="treatment-badge-wrapper">
                            <TreatmentBadge treatment={prediction.recommended_treatment} variant="compact" />
                        </div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-item">
                            <i className="fa-solid fa-chart-simple stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">Reduction</span>
                                <span className="stat-value">{predictedReduction.toFixed(2)}%</span>
                            </div>
                        </div>

                        <div className="stat-item">
                            <i className="fa-solid fa-shield-halved stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">Confidence</span>
                                <span className="stat-value confidence-value">{confidenceScore.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="stats-row">
                        <div className="stat-item">
                            <i className="fa-solid fa-arrow-trend-up stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">Margin</span>
                                <span className="stat-value">{confidenceMargin.toFixed(1)}%</span>
                            </div>
                        </div>

                        <div className="stat-item">
                            <i className="fa-solid fa-microchip stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">Model</span>
                                <span className="stat-value model-version">{prediction.model_version}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <div className="created-date">
                        <i className="fa-solid fa-clock"></i>
                        {formatDate(prediction.created_at)}
                    </div>
                    <button className="view-btn" onClick={handleViewDetails}>
                        <i className="fa-solid fa-eye"></i>
                        <span>View Details</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .prediction-card {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 16px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .prediction-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 14px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .patient-info {
                    flex: 1;
                    min-width: 0;
                }

                .patient-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .patient-meta {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 500;
                }

                .delete-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .delete-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }

                .card-body {
                    margin-bottom: 12px;
                }

                .treatment-section {
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px solid rgba(16, 185, 129, 0.15);
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 12px;
                }

                .treatment-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .treatment-badge-wrapper {
                    display: flex;
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .stats-row:last-child {
                    margin-bottom: 0;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 6px;
                }

                .stat-icon {
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #34d399;
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .stat-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .stat-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .stat-value {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 600;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .stat-value.confidence-value {
                    color: #34d399;
                }

                .stat-value.model-version {
                    font-size: 11px;
                    font-weight: 500;
                }

                .card-footer {
                    padding-top: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .created-date {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .created-date i {
                    font-size: 10px;
                }

                .view-btn {
                    padding: 8px 14px;
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 7px;
                    color: #34d399;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .view-btn:hover {
                    background: rgba(16, 185, 129, 0.18);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: #6ee7b7;
                }

                @media (max-width: 768px) {
                    .prediction-card {
                        padding: 14px;
                    }

                    .patient-name {
                        font-size: 14px;
                    }

                    .stat-value {
                        font-size: 12px;
                    }
                }
            `}</style>
        </>
    );
}