/**
 * DetailHeader Component
 * Header for similar patient case detail page
 */

'use client';

import { useRouter } from 'next/navigation';
import { SimilarPatientDetail } from '../../api/similar-patients.types';

interface DetailHeaderProps {
    patientCase: SimilarPatientDetail;
}

export function DetailHeader({ patientCase }: DetailHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <>
            <div className="header-container">
                {/* Back Button */}
                <button className="back-btn" onClick={handleBack}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Back</span>
                </button>

                {/* Header Content */}
                <div className="header-content">
                    {/* Title Section */}
                    <div className="title-section">
                        <div className="case-id-badge">
                            <i className="fa-solid fa-id-card"></i>
                            <span>{patientCase.patient_id}</span>
                        </div>
                        <h1 className="page-title">Similar Patient Case</h1>
                        <p className="page-subtitle">Historical case from training dataset</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="quick-stats">
                        <div className="stat-card">
                            <div className="stat-icon demographics">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Demographics</p>
                                <p className="stat-value">
                                    {patientCase.demographics.age} yrs • {patientCase.demographics.gender}
                                </p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon clinical">
                                <i className="fa-solid fa-chart-line"></i>
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">HbA1c Baseline</p>
                                <p className="stat-value">
                                    {patientCase.clinical_features.hba1c_baseline}%
                                </p>
                            </div>
                        </div>

                        {patientCase.treatment && (
                            <div className="stat-card">
                                <div className="stat-icon treatment">
                                    <i className="fa-solid fa-prescription-bottle-medical"></i>
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">Treatment</p>
                                    <p className="stat-value">
                                        {patientCase.treatment.drug_name}
                                    </p>
                                </div>
                            </div>
                        )}

                        {patientCase.outcome && (
                            <div className="stat-card">
                                <div className={`stat-icon outcome ${patientCase.outcome.success ? 'success' : 'failure'}`}>
                                    <i className={`fa-solid ${patientCase.outcome.success ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">Outcome</p>
                                    <p className="stat-value">
                                        {patientCase.outcome.outcome_category}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .header-container {
                    margin-bottom: 24px;
                }

                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: 20px;
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                    color: rgba(255, 255, 255, 0.9);
                }

                .back-btn i {
                    font-size: 12px;
                }

                .header-content {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 24px;
                }

                .title-section {
                    margin-bottom: 24px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .case-id-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #34d399;
                    margin-bottom: 12px;
                }

                .case-id-badge i {
                    font-size: 11px;
                }

                .page-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #ffffff;
                    letter-spacing: -0.8px;
                    margin: 0 0 6px 0;
                }

                .page-subtitle {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 400;
                    margin: 0;
                }

                .quick-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 16px;
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }

                .stat-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .stat-icon.demographics {
                    background: rgba(59, 130, 246, 0.12);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                }

                .stat-icon.clinical {
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    color: #34d399;
                }

                .stat-icon.treatment {
                    background: rgba(168, 85, 247, 0.12);
                    border: 1px solid rgba(168, 85, 247, 0.2);
                    color: #a78bfa;
                }

                .stat-icon.outcome.success {
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    color: #34d399;
                }

                .stat-icon.outcome.failure {
                    background: rgba(239, 68, 68, 0.12);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                }

                .stat-content {
                    flex: 1;
                    min-width: 0;
                }

                .stat-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                    margin: 0 0 4px 0;
                }

                .stat-value {
                    font-size: 15px;
                    color: #ffffff;
                    font-weight: 600;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                @media (max-width: 768px) {
                    .header-content {
                        padding: 16px;
                    }

                    .page-title {
                        font-size: 22px;
                    }

                    .quick-stats {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .stat-card {
                        padding: 12px;
                    }

                    .stat-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 16px;
                    }

                    .stat-value {
                        font-size: 13px;
                    }
                }
            `}</style>
        </>
    );
}