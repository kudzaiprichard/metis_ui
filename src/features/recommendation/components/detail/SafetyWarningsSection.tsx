// src/features/recommendations/components/detail/SafetyWarningsSection.tsx

/**
 * SafetyWarningsSection Component
 * Displays safety warnings and concerns for the recommended treatment
 */

'use client';

import { SafetyWarning } from '../../api/recommendations.types';

interface SafetyWarningsSectionProps {
    warnings: SafetyWarning[];
}

export function SafetyWarningsSection({ warnings }: SafetyWarningsSectionProps) {
    const getSeverityConfig = (severity: string) => {
        const level = severity.toLowerCase();

        if (level === 'high' || level === 'critical') {
            return {
                bg: 'rgba(239, 68, 68, 0.08)',
                border: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                icon: 'fa-circle-exclamation'
            };
        }

        if (level === 'medium' || level === 'moderate') {
            return {
                bg: 'rgba(251, 191, 36, 0.08)',
                border: 'rgba(251, 191, 36, 0.2)',
                color: '#fbbf24',
                icon: 'fa-triangle-exclamation'
            };
        }

        return {
            bg: 'rgba(96, 165, 250, 0.08)',
            border: 'rgba(96, 165, 250, 0.2)',
            color: '#60a5fa',
            icon: 'fa-info-circle'
        };
    };

    // Sort by severity (high > medium > low)
    const sortedWarnings = [...warnings].sort((a, b) => {
        const severityOrder = { high: 0, critical: 0, medium: 1, moderate: 1, low: 2, info: 2 };
        const severityA = severityOrder[a.severity.toLowerCase() as keyof typeof severityOrder] ?? 2;
        const severityB = severityOrder[b.severity.toLowerCase() as keyof typeof severityOrder] ?? 2;
        return severityA - severityB;
    });

    return (
        <>
            <div className="warnings-card">
                <div className="section-header">
                    <h2 className="section-title">
                        <i className="fa-solid fa-shield-halved"></i>
                        Safety Warnings & Considerations
                    </h2>
                    <div className="warnings-count">
                        <i className="fa-solid fa-exclamation-triangle"></i>
                        <span>{warnings.length} {warnings.length === 1 ? 'Warning' : 'Warnings'}</span>
                    </div>
                </div>

                <div className="warnings-list">
                    {sortedWarnings.map((warning) => {
                        const config = getSeverityConfig(warning.severity);

                        return (
                            <div
                                key={warning.id}
                                className="warning-item"
                                style={{
                                    background: config.bg,
                                    borderColor: config.border
                                }}
                            >
                                <div className="warning-header">
                                    <div
                                        className="severity-badge"
                                        style={{
                                            background: config.bg,
                                            borderColor: config.border,
                                            color: config.color
                                        }}
                                    >
                                        <i className={`fa-solid ${config.icon}`}></i>
                                        <span>{warning.severity}</span>
                                    </div>

                                    <div className="concern-title" style={{ color: config.color }}>
                                        {warning.concern}
                                    </div>
                                </div>

                                <div className="warning-body">
                                    <div className="warning-detail">
                                        <div className="detail-label">
                                            <i className="fa-solid fa-user-doctor"></i>
                                            Patient Factor
                                        </div>
                                        <p className="detail-text">{warning.patient_factor}</p>
                                    </div>

                                    <div className="warning-detail">
                                        <div className="detail-label">
                                            <i className="fa-solid fa-hand-holding-medical"></i>
                                            Mitigation Strategy
                                        </div>
                                        <p className="detail-text">{warning.mitigation}</p>
                                    </div>

                                    {warning.reason && (
                                        <div className="warning-detail">
                                            <div className="detail-label">
                                                <i className="fa-solid fa-lightbulb"></i>
                                                Clinical Reasoning
                                            </div>
                                            <p className="detail-text">{warning.reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .warnings-card {
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    margin-bottom: 20px;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 12px;
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
                    color: #fbbf24;
                    font-size: 18px;
                }

                .warnings-count {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: rgba(251, 191, 36, 0.12);
                    border: 1px solid rgba(251, 191, 36, 0.2);
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #fbbf24;
                }

                .warnings-count i {
                    font-size: 12px;
                }

                .warnings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .warning-item {
                    padding: 18px;
                    border: 1px solid;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }

                .warning-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .warning-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                    padding-bottom: 14px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .severity-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border: 1px solid;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    flex-shrink: 0;
                }

                .severity-badge i {
                    font-size: 12px;
                }

                .concern-title {
                    font-size: 15px;
                    font-weight: 600;
                    flex: 1;
                }

                .warning-body {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .warning-detail {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .detail-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .detail-label i {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .detail-text {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.85);
                    line-height: 1.6;
                    margin: 0;
                    padding-left: 17px;
                }

                @media (max-width: 768px) {
                    .warnings-card {
                        padding: 16px;
                    }

                    .warning-item {
                        padding: 14px;
                    }

                    .warning-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }

                    .concern-title {
                        font-size: 14px;
                    }
                }
            `}</style>
        </>
    );
}