// src/features/recommendations/components/list/RecommendationTableRow.tsx

/**
 * RecommendationTableRow Component
 * Table row for displaying prediction information
 */

'use client';

import { useRouter } from 'next/navigation';
import { Prediction } from '../../api/recommendations.types';
import { ConfidenceBadge } from '../shared/ConfidenceBadge';

interface RecommendationTableRowProps {
    prediction: Prediction;
    onDelete?: (prediction: Prediction) => void;
}

export function RecommendationTableRow({ prediction, onDelete }: RecommendationTableRowProps) {
    const router = useRouter();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleView = () => {
        router.push(`/doctor/predictions/${prediction.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(prediction);
        }
    };

    // Get initials from patient name
    const getInitials = (firstName: string, lastName: string) => {
        const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
        const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
        return `${firstInitial}${lastInitial}`;
    };

    const confidenceScore = parseFloat(prediction.confidence_score);
    const predictedReduction = parseFloat(prediction.predicted_reduction);

    return (
        <>
            <div className="table-row" onClick={handleView}>
                {/* Patient Column */}
                <div className="table-cell patient-cell">
                    <div className="patient-avatar">
                        {getInitials(prediction.patient.first_name, prediction.patient.last_name)}
                    </div>
                    <div className="patient-info">
                        <p className="patient-name">
                            {prediction.patient.first_name} {prediction.patient.last_name}
                        </p>
                        <p className="patient-meta">
                            {prediction.patient.age} yrs • {prediction.patient.gender}
                        </p>
                    </div>
                </div>

                {/* Treatment Column */}
                <div className="table-cell treatment-cell">
                    <div className="treatment-badge">
                        <i className="fa-solid fa-prescription-bottle-medical"></i>
                        <span>{prediction.recommended_treatment}</span>
                    </div>
                </div>

                {/* Reduction Column */}
                <div className="table-cell">
                    <div className="stat-value reduction">
                        <i className="fa-solid fa-arrow-trend-down"></i>
                        {predictedReduction.toFixed(2)}%
                    </div>
                </div>

                {/* Confidence Column */}
                <div className="table-cell">
                    <ConfidenceBadge score={confidenceScore} showLabel={false} />
                </div>

                {/* Date Column */}
                <div className="table-cell">
                    <p className="date-text">{formatDate(prediction.created_at)}</p>
                </div>

                {/* Actions Column */}
                <div className="table-cell actions-cell">
                    <button
                        className="action-btn view"
                        title="View prediction details"
                        onClick={handleView}
                    >
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    {onDelete && (
                        <button
                            className="action-btn delete"
                            title="Delete prediction"
                            onClick={handleDelete}
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .table-row {
                    display: grid;
                    grid-template-columns: 2fr 2fr 1fr 1fr 1.5fr 1fr;
                    gap: 16px;
                    padding: 16px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    cursor: pointer;
                    align-items: center;
                }

                .table-row:hover {
                    background: rgba(255, 255, 255, 0.03);
                    transform: translateY(-1px);
                    border-bottom-color: rgba(255, 255, 255, 0.08);
                }

                .table-row:hover::before {
                    content: '';
                    position: absolute;
                    left: -32px;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: linear-gradient(to bottom, #34d399, #10b981);
                    border-radius: 0 2px 2px 0;
                    opacity: 0.8;
                }

                .table-cell {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    color: #ffffff;
                    min-width: 0;
                }

                .patient-cell {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .patient-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.2));
                    border: 1px solid rgba(52, 211, 153, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 600;
                    color: #34d399;
                    flex-shrink: 0;
                    letter-spacing: 0.5px;
                }

                .patient-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                    flex: 1;
                }

                .patient-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #ffffff;
                    letter-spacing: -0.1px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 0;
                }

                .patient-meta {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                }

                .treatment-cell {
                    min-width: 0;
                }

                .treatment-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #34d399;
                    max-width: 100%;
                    overflow: hidden;
                }

                .treatment-badge i {
                    font-size: 11px;
                    flex-shrink: 0;
                }

                .treatment-badge span {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .stat-value {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                }

                .stat-value.reduction {
                    color: #34d399;
                }

                .stat-value i {
                    font-size: 12px;
                }

                .date-text {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 400;
                    margin: 0;
                }

                .actions-cell {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                }

                .action-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.03);
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 13px;
                }

                .action-btn:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .action-btn.view:hover {
                    background: rgba(96, 165, 250, 0.12);
                    border-color: rgba(96, 165, 250, 0.3);
                    color: #60a5fa;
                }

                .action-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.12);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }

                .action-btn:active {
                    transform: translateY(0);
                }

                @media (max-width: 768px) {
                    .table-row {
                        grid-template-columns: 1fr;
                        gap: 14px;
                        padding: 20px;
                        background: rgba(255, 255, 255, 0.02);
                        border-radius: 12px;
                        margin-bottom: 12px;
                        border: 1px solid rgba(255, 255, 255, 0.06);
                    }

                    .table-row:hover::before {
                        display: none;
                    }

                    .table-cell {
                        justify-content: space-between;
                    }

                    .patient-cell,
                    .treatment-cell {
                        flex-direction: row;
                    }

                    .treatment-badge {
                        max-width: 60%;
                    }

                    .actions-cell {
                        justify-content: flex-start;
                    }
                }
            `}</style>
        </>
    );
}