/**
 * TimelineTab Component
 * Display patient timeline (read-only view)
 */

'use client';

import { useRouter } from 'next/navigation';
import {usePatientRecommendations} from "@/src/features/recommendation/hooks/useRecommendations";
interface TimelineTabProps {
    patientId: string;
}

export function TimelineTab({ patientId }: TimelineTabProps) {
    const router = useRouter();
    const { data: predictions, isLoading: isPredictionsLoading } = usePatientRecommendations(patientId);

    const handleViewPredictions = () => {
        router.push(`/doctor/recommendations/patient/${patientId}`);
    };

    const predictionsCount = Array.isArray(predictions) ? predictions.length : 0;

    return (
        <>
            <div className="tab-content">
                <div className="content-header">
                    <h2 className="content-title">Patient Timeline</h2>

                    <button
                        className="predictions-btn"
                        onClick={handleViewPredictions}
                        disabled={isPredictionsLoading}
                    >
                        {isPredictionsLoading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                <span>Loading...</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-brain"></i>
                                <span>View Predictions</span>
                                {predictionsCount > 0 && (
                                    <span className="predictions-count">{predictionsCount}</span>
                                )}
                            </>
                        )}
                    </button>
                </div>

                <div className="empty-state">
                    <div className="empty-icon">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <h3 className="empty-title">Timeline Coming Soon</h3>
                    <p className="empty-subtitle">
                        Patient activity timeline will be available here, including visits, treatments, and medical updates.
                    </p>
                </div>
            </div>

            <style jsx>{`
                .tab-content {
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }

                .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .content-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    letter-spacing: -0.3px;
                }

                .predictions-btn {
                    padding: 10px 18px;
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 8px;
                    color: #34d399;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                }

                .predictions-btn:hover:not(:disabled) {
                    background: rgba(16, 185, 129, 0.18);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: #6ee7b7;
                }

                .predictions-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .predictions-btn i {
                    font-size: 13px;
                }

                .predictions-count {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    background: rgba(16, 185, 129, 0.2);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #34d399;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                }

                .empty-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.04);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    font-size: 28px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .empty-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 8px;
                    letter-spacing: -0.3px;
                }

                .empty-subtitle {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                    max-width: 400px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .tab-content {
                        padding: 16px;
                    }

                    .content-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }

                    .predictions-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .empty-state {
                        padding: 40px 16px;
                    }

                    .empty-icon {
                        width: 56px;
                        height: 56px;
                        font-size: 24px;
                    }

                    .empty-title {
                        font-size: 16px;
                    }

                    .empty-subtitle {
                        font-size: 13px;
                    }
                }
            `}</style>
        </>
    );
}