/**
 * PredictionSkeleton Component
 * Loading placeholder for predictions
 */

'use client';

interface PredictionSkeletonProps {
    variant?: 'card' | 'table' | 'detail';
    count?: number;
}

export function PredictionSkeleton({ variant = 'card', count = 1 }: PredictionSkeletonProps) {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    if (variant === 'card') {
        return (
            <>
                {skeletons.map((index) => (
                    <div key={index} className="skeleton-card">
                        <div className="skeleton-header">
                            <div className="skeleton-patient">
                                <div className="skeleton-text skeleton-name"></div>
                                <div className="skeleton-text skeleton-id"></div>
                            </div>
                            <div className="skeleton-badge"></div>
                        </div>

                        <div className="skeleton-body">
                            <div className="skeleton-treatment">
                                <div className="skeleton-text skeleton-label"></div>
                                <div className="skeleton-text skeleton-value"></div>
                            </div>

                            <div className="skeleton-stats">
                                <div className="skeleton-stat">
                                    <div className="skeleton-text skeleton-stat-label"></div>
                                    <div className="skeleton-text skeleton-stat-value"></div>
                                </div>
                                <div className="skeleton-stat">
                                    <div className="skeleton-text skeleton-stat-label"></div>
                                    <div className="skeleton-text skeleton-stat-value"></div>
                                </div>
                            </div>
                        </div>

                        <div className="skeleton-footer">
                            <div className="skeleton-text skeleton-date"></div>
                            <div className="skeleton-button"></div>
                        </div>
                    </div>
                ))}

                <style jsx>{`
                    .skeleton-card {
                        background: rgba(255, 255, 255, 0.04);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 10px;
                        padding: 16px;
                        animation: pulse 1.5s ease-in-out infinite;
                    }

                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.6;
                        }
                    }

                    .skeleton-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 14px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    }

                    .skeleton-patient {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                        flex: 1;
                    }

                    .skeleton-text {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 4px;
                        animation: shimmer 1.5s ease-in-out infinite;
                    }

                    @keyframes shimmer {
                        0%, 100% {
                            opacity: 0.3;
                        }
                        50% {
                            opacity: 0.6;
                        }
                    }

                    .skeleton-name {
                        height: 16px;
                        width: 120px;
                    }

                    .skeleton-id {
                        height: 12px;
                        width: 80px;
                    }

                    .skeleton-badge {
                        height: 24px;
                        width: 60px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 6px;
                    }

                    .skeleton-body {
                        margin-bottom: 12px;
                    }

                    .skeleton-treatment {
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid rgba(255, 255, 255, 0.06);
                        border-radius: 8px;
                        padding: 12px;
                        margin-bottom: 12px;
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .skeleton-label {
                        height: 10px;
                        width: 100px;
                    }

                    .skeleton-value {
                        height: 18px;
                        width: 180px;
                    }

                    .skeleton-stats {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 10px;
                    }

                    .skeleton-stat {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                        padding: 10px;
                        background: rgba(255, 255, 255, 0.02);
                        border-radius: 6px;
                    }

                    .skeleton-stat-label {
                        height: 10px;
                        width: 60px;
                    }

                    .skeleton-stat-value {
                        height: 14px;
                        width: 50px;
                    }

                    .skeleton-footer {
                        padding-top: 12px;
                        border-top: 1px solid rgba(255, 255, 255, 0.08);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .skeleton-date {
                        height: 12px;
                        width: 100px;
                    }

                    .skeleton-button {
                        height: 32px;
                        width: 100px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 7px;
                    }
                `}</style>
            </>
        );
    }

    if (variant === 'table') {
        return (
            <>
                {skeletons.map((index) => (
                    <div key={index} className="skeleton-row">
                        <div className="skeleton-cell">
                            <div className="skeleton-text skeleton-patient-name"></div>
                        </div>
                        <div className="skeleton-cell">
                            <div className="skeleton-text skeleton-treatment"></div>
                        </div>
                        <div className="skeleton-cell">
                            <div className="skeleton-text skeleton-stat"></div>
                        </div>
                        <div className="skeleton-cell">
                            <div className="skeleton-text skeleton-stat"></div>
                        </div>
                        <div className="skeleton-cell">
                            <div className="skeleton-text skeleton-date"></div>
                        </div>
                    </div>
                ))}

                <style jsx>{`
                    .skeleton-row {
                        display: grid;
                        grid-template-columns: 2fr 2fr 1fr 1fr 1.5fr;
                        gap: 16px;
                        padding: 18px 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                        animation: pulse 1.5s ease-in-out infinite;
                    }

                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.6;
                        }
                    }

                    .skeleton-cell {
                        display: flex;
                        align-items: center;
                    }

                    .skeleton-text {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 4px;
                        animation: shimmer 1.5s ease-in-out infinite;
                    }

                    @keyframes shimmer {
                        0%, 100% {
                            opacity: 0.3;
                        }
                        50% {
                            opacity: 0.6;
                        }
                    }

                    .skeleton-patient-name {
                        height: 16px;
                        width: 140px;
                    }

                    .skeleton-treatment {
                        height: 16px;
                        width: 160px;
                    }

                    .skeleton-stat {
                        height: 16px;
                        width: 60px;
                    }

                    .skeleton-date {
                        height: 16px;
                        width: 100px;
                    }
                `}</style>
            </>
        );
    }

    // Detail variant
    return (
        <>
            <div className="skeleton-detail">
                <div className="skeleton-detail-header">
                    <div className="skeleton-text skeleton-title"></div>
                    <div className="skeleton-text skeleton-subtitle"></div>
                </div>

                <div className="skeleton-detail-body">
                    <div className="skeleton-section">
                        <div className="skeleton-text skeleton-section-title"></div>
                        <div className="skeleton-content-block"></div>
                    </div>

                    <div className="skeleton-section">
                        <div className="skeleton-text skeleton-section-title"></div>
                        <div className="skeleton-content-block"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .skeleton-detail {
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }

                .skeleton-detail-header {
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .skeleton-text {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    animation: shimmer 1.5s ease-in-out infinite;
                }

                @keyframes shimmer {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }

                .skeleton-title {
                    height: 24px;
                    width: 200px;
                }

                .skeleton-subtitle {
                    height: 16px;
                    width: 300px;
                }

                .skeleton-detail-body {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .skeleton-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .skeleton-section-title {
                    height: 20px;
                    width: 150px;
                }

                .skeleton-content-block {
                    height: 120px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
            `}</style>
        </>
    );
}