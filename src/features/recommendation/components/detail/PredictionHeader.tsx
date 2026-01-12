// src/features/recommendations/components/detail/PredictionHeader.tsx

/**
 * PredictionHeader Component
 * Displays patient information and prediction metadata
 */

'use client';

import { useRouter } from 'next/navigation';
import { PredictionDetail } from '../../api/recommendations.types';

interface PredictionHeaderProps {
    prediction: PredictionDetail;
}

export function PredictionHeader({ prediction }: PredictionHeaderProps) {
    const router = useRouter();

    const getInitials = () => {
        const { first_name, last_name } = prediction.patient;
        return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleBack = () => {
        router.back();
    };

    const handleViewPatient = () => {
        router.push(`/doctor/patients/${prediction.patient_id}`);
    };

    return (
        <>
            {/* Back Button */}
            <button className="back-btn" onClick={handleBack}>
                <i className="fa-solid fa-arrow-left"></i>
                <span>Back</span>
            </button>

            <div className="prediction-header-card">
                {/* Top Row: Patient Info + Actions */}
                <div className="header-top-row">
                    <div className="patient-basic-info">
                        <div className="patient-avatar">{getInitials()}</div>
                        <div className="patient-details">
                            <h1 className="patient-name">
                                {prediction.patient.first_name} {prediction.patient.last_name}
                            </h1>
                            <p className="patient-meta">
                                {prediction.patient.age} years • {prediction.patient.gender}
                            </p>
                            <p className="patient-id">Patient ID: {prediction.patient_id.slice(0, 16)}...</p>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="action-btn" onClick={handleViewPatient}>
                            <i className="fa-solid fa-user"></i>
                            <span>View Patient</span>
                        </button>
                        <button className="action-btn">
                            <i className="fa-solid fa-download"></i>
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Prediction Metadata */}
                <div className="metadata-row">
                    <div className="metadata-item">
                        <i className="fa-solid fa-brain"></i>
                        <div className="metadata-content">
                            <span className="metadata-label">Prediction ID</span>
                            <span className="metadata-value">{prediction.id.slice(0, 8)}</span>
                        </div>
                    </div>

                    <div className="metadata-item">
                        <i className="fa-solid fa-clock"></i>
                        <div className="metadata-content">
                            <span className="metadata-label">Generated</span>
                            <span className="metadata-value">{formatDate(prediction.created_at)}</span>
                        </div>
                    </div>

                    <div className="metadata-item">
                        <i className="fa-solid fa-microchip"></i>
                        <div className="metadata-content">
                            <span className="metadata-label">Model Version</span>
                            <span className="metadata-value">{prediction.model_version}</span>
                        </div>
                    </div>

                    <div className="metadata-item">
                        <i className="fa-solid fa-flask"></i>
                        <div className="metadata-content">
                            <span className="metadata-label">Treatment Index</span>
                            <span className="metadata-value">#{prediction.treatment_index}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .back-btn {
                    padding: 10px 18px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    margin-bottom: 20px;
                    transition: all 0.2s ease;
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                    color: rgba(255, 255, 255, 0.9);
                }

                .prediction-header-card {
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    margin-bottom: 20px;
                    background: rgba(255, 255, 255, 0.02);
                }

                .header-top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .patient-basic-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .patient-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #047857, #10b981);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .patient-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .patient-name {
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffffff;
                    letter-spacing: -0.3px;
                    margin: 0;
                }

                .patient-meta {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 500;
                    margin: 0;
                }

                .patient-id {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 500;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    gap: 10px;
                    flex-shrink: 0;
                }

                .action-btn {
                    padding: 10px 18px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    white-space: nowrap;
                }

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.18);
                    color: #ffffff;
                }

                .metadata-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }

                .metadata-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .metadata-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .metadata-item i {
                    font-size: 16px;
                    color: #34d399;
                    width: 20px;
                    text-align: center;
                    flex-shrink: 0;
                }

                .metadata-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .metadata-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .metadata-value {
                    font-size: 13px;
                    font-weight: 600;
                    color: #ffffff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                @media (max-width: 1024px) {
                    .metadata-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .prediction-header-card {
                        padding: 16px;
                    }

                    .header-top-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .patient-avatar {
                        width: 48px;
                        height: 48px;
                        font-size: 18px;
                    }

                    .patient-name {
                        font-size: 18px;
                    }

                    .header-actions {
                        width: 100%;
                        flex-direction: column;
                    }

                    .action-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .metadata-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}