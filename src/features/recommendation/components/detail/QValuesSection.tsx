// src/features/recommendations/components/detail/QValuesSection.tsx

/**
 * QValuesSection Component
 * Displays all treatment options ranked by Q-values
 */

'use client';

import { PredictionQValue } from '../../api/recommendations.types';

interface QValuesSectionProps {
    qValues: PredictionQValue[];
}

export function QValuesSection({ qValues }: QValuesSectionProps) {
    // Sort by rank
    const sortedQValues = [...qValues].sort((a, b) => a.rank - b.rank);

    const getBarWidth = (qValue: string) => {
        const values = qValues.map(q => parseFloat(q.q_value));
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue;

        if (range === 0) return 100;

        const value = parseFloat(qValue);
        return ((value - minValue) / range) * 100;
    };

    const getRankBadgeColor = (rank: number) => {
        if (rank === 1) return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.2)', color: '#34d399' };
        if (rank === 2) return { bg: 'rgba(96, 165, 250, 0.15)', border: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' };
        if (rank === 3) return { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' };
        return { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.6)' };
    };

    return (
        <>
            <div className="qvalues-card">
                <div className="section-header">
                    <h2 className="section-title">
                        <i className="fa-solid fa-ranking-star"></i>
                        Treatment Rankings (Q-Values)
                    </h2>
                    <p className="section-subtitle">
                        All treatment options ranked by predicted effectiveness
                    </p>
                </div>

                <div className="qvalues-list">
                    {sortedQValues.map((qValue) => {
                        const colors = getRankBadgeColor(qValue.rank);
                        const barWidth = getBarWidth(qValue.q_value);

                        return (
                            <div key={qValue.id} className={`qvalue-item ${qValue.rank === 1 ? 'top-ranked' : ''}`}>
                                <div className="qvalue-header">
                                    <div className="rank-badge" style={{
                                        background: colors.bg,
                                        borderColor: colors.border,
                                        color: colors.color
                                    }}>
                                        #{qValue.rank}
                                    </div>

                                    <div className="treatment-info">
                                        <div className="treatment-name">
                                            <i className="fa-solid fa-prescription-bottle-medical"></i>
                                            {qValue.treatment}
                                        </div>
                                    </div>

                                    <div className="qvalue-score">
                                        {parseFloat(qValue.q_value).toFixed(4)}
                                    </div>
                                </div>

                                <div className="qvalue-bar-container">
                                    <div
                                        className="qvalue-bar"
                                        style={{ width: `${barWidth}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .qvalues-card {
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    margin-bottom: 20px;
                }

                .section-header {
                    margin-bottom: 20px;
                }

                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 0 0 6px 0;
                }

                .section-title i {
                    color: #34d399;
                    font-size: 18px;
                }

                .section-subtitle {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                }

                .qvalues-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .qvalue-item {
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .qvalue-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                }

                .qvalue-item.top-ranked {
                    background: rgba(16, 185, 129, 0.06);
                    border-color: rgba(16, 185, 129, 0.15);
                }

                .qvalue-item.top-ranked:hover {
                    background: rgba(16, 185, 129, 0.08);
                    border-color: rgba(16, 185, 129, 0.2);
                }

                .qvalue-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 10px;
                }

                .rank-badge {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    border: 1px solid;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .treatment-info {
                    flex: 1;
                    min-width: 0;
                }

                .treatment-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .treatment-name i {
                    color: #34d399;
                    font-size: 14px;
                }

                .qvalue-score {
                    font-size: 16px;
                    font-weight: 700;
                    color: #34d399;
                    flex-shrink: 0;
                }

                .qvalue-bar-container {
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .qvalue-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #047857, #10b981, #34d399);
                    border-radius: 3px;
                    transition: width 0.5s ease;
                }

                @media (max-width: 768px) {
                    .qvalues-card {
                        padding: 16px;
                    }

                    .qvalue-header {
                        flex-wrap: wrap;
                    }

                    .treatment-name {
                        font-size: 14px;
                    }

                    .qvalue-score {
                        font-size: 14px;
                    }
                }
            `}</style>
        </>
    );
}