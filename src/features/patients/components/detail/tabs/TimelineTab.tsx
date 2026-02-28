/**
 * TimelineTab Component
 * Display patient timeline (read-only view)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientRecommendations } from "@/src/features/recommendation/hooks/useRecommendations";
import { usePatientTimeline } from "@/src/features/timeline/hooks/useTimeline";
import { TimelineEvent } from "@/src/features/timeline/api/timeline.types";

interface TimelineTabProps {
    patientId: string;
}

export function TimelineTab({ patientId }: TimelineTabProps) {
    const router = useRouter();
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: predictionsData, isLoading: isPredictionsLoading } = usePatientRecommendations(patientId);
    const { data: timelineData, isLoading: isTimelineLoading, error: timelineError } = usePatientTimeline(patientId);

    const handleViewPredictions = () => {
        router.push(`/doctor/recommendations/patient/${patientId}`);
    };

    const predictionsCount = predictionsData?.predictions?.length ?? 0;

    // Pagination
    const paginatedTimeline = timelineData?.timeline.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    ) || [];

    const totalPages = timelineData ? Math.ceil(timelineData.timeline.length / perPage) : 0;

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getEventIcon = (type: string) => {
        const icons: Record<string, string> = {
            patient_created: 'fa-user-plus',
            prediction_generated: 'fa-brain',
            treatment_decision: 'fa-stethoscope',
            follow_up_scheduled: 'fa-calendar-plus',
            follow_up_completed: 'fa-calendar-check',
        };
        return icons[type] || 'fa-circle-info';
    };

    const getEventColor = (type: string) => {
        const colors: Record<string, string> = {
            patient_created: '#60a5fa',
            prediction_generated: '#34d399',
            treatment_decision: '#a78bfa',
            follow_up_scheduled: '#fb923c',
            follow_up_completed: '#2dd4bf',
        };
        return colors[type] || '#9ca3af';
    };

    const getEventTitle = (event: TimelineEvent) => {
        return event.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const renderEventData = (event: TimelineEvent) => {
        const data = event.data;

        if (event.type === 'prediction_generated') {
            return (
                <>
                    {data.recommended_treatment && <span className="data-pill">Treatment: {data.recommended_treatment}</span>}
                    {data.predicted_reduction && <span className="data-pill">Reduction: {data.predicted_reduction}%</span>}
                    {data.confidence_score && <span className="data-pill">Confidence: {data.confidence_score}%</span>}
                </>
            );
        }

        if (event.type === 'treatment_decision') {
            return (
                <>
                    {data.treatment_given && <span className="data-pill">Treatment: {data.treatment_given}</span>}
                    {data.decision_type && <span className="data-pill">Type: {data.decision_type}</span>}
                    {data.dosage && <span className="data-pill">Dosage: {data.dosage}</span>}
                </>
            );
        }

        if (event.type === 'follow_up_scheduled' && data.scheduled_date) {
            return <span className="data-pill">Date: {data.scheduled_date}</span>;
        }

        const entries = Object.entries(data).slice(0, 3);
        return entries.map(([key, value]) => (
            <span key={key} className="data-pill">
                {key.replace(/_/g, ' ')}: {String(value)}
            </span>
        ));
    };

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

                {isTimelineLoading ? (
                    <div className="state-container">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <p>Loading timeline...</p>
                    </div>
                ) : timelineError ? (
                    <div className="state-container">
                        <i className="fa-solid fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
                        <p>Failed to load timeline</p>
                    </div>
                ) : !timelineData || timelineData.timeline.length === 0 ? (
                    <div className="state-container">
                        <i className="fa-solid fa-clock-rotate-left"></i>
                        <p>No timeline events</p>
                    </div>
                ) : (
                    <>
                        <div className="timeline-controls">
                            <div className="total-count">
                                Total Events: <span>{timelineData.total_events}</span>
                            </div>
                            <div className="per-page-selector">
                                <span>Show:</span>
                                {[5, 10, 20].map(size => (
                                    <button
                                        key={size}
                                        className={`size-btn ${perPage === size ? 'active' : ''}`}
                                        onClick={() => {
                                            setPerPage(size);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="timeline-list">
                            {paginatedTimeline.map((event, index) => (
                                <div key={index} className="timeline-item">
                                    <div className="item-icon" style={{ background: `${getEventColor(event.type)}20`, color: getEventColor(event.type) }}>
                                        <i className={`fa-solid ${getEventIcon(event.type)}`}></i>
                                    </div>
                                    <div className="item-content">
                                        <div className="item-header">
                                            <h4>{getEventTitle(event)}</h4>
                                            <span className="item-time">{formatTimestamp(event.timestamp)}</span>
                                        </div>
                                        <div className="item-data">
                                            {renderEventData(event)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                <span className="pagination-text">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </>
                )}
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
                }

                .predictions-btn:hover:not(:disabled) {
                    background: rgba(16, 185, 129, 0.18);
                    border-color: rgba(16, 185, 129, 0.3);
                }

                .predictions-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .predictions-count {
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    background: rgba(16, 185, 129, 0.2);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .state-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    gap: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .state-container i {
                    font-size: 32px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .state-container p {
                    font-size: 14px;
                }

                .timeline-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    margin-bottom: 16px;
                }

                .total-count {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                }

                .total-count span {
                    color: #34d399;
                    font-weight: 700;
                    margin-left: 4px;
                }

                .per-page-selector {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                }

                .size-btn {
                    padding: 4px 10px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .size-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                }

                .size-btn.active {
                    background: rgba(16, 185, 129, 0.12);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: #34d399;
                }

                .timeline-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .timeline-item {
                    display: flex;
                    gap: 16px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .timeline-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                }

                .item-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .item-content {
                    flex: 1;
                    min-width: 0;
                }

                .item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    gap: 12px;
                }

                .item-header h4 {
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0;
                }

                .item-time {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    white-space: nowrap;
                }

                .item-data {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .data-pill {
                    padding: 4px 10px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 6px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: capitalize;
                }

                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .pagination-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pagination-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.9);
                }

                .pagination-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .pagination-text {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
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

                    .timeline-controls {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }

                    .per-page-selector {
                        justify-content: center;
                    }

                    .item-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 4px;
                    }

                    .item-icon {
                        width: 36px;
                        height: 36px;
                        font-size: 14px;
                    }
                }
            `}</style>
        </>
    );
}