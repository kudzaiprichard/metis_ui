// src/features/recommendations/components/detail/AlternativesSection.tsx

/**
 * AlternativesSection Component
 * Displays alternative treatment options with pros, cons, and considerations
 */

'use client';

import { ExplanationAlternative } from '../../api/recommendations.types';

interface AlternativesSectionProps {
    alternatives: ExplanationAlternative[];
}

export function AlternativesSection({ alternatives }: AlternativesSectionProps) {
    // Sort by rank
    const sortedAlternatives = [...alternatives].sort((a, b) => a.rank - b.rank);

    const getRankConfig = (rank: number) => {
        if (rank === 1) {
            return {
                bg: 'rgba(96, 165, 250, 0.12)',
                border: 'rgba(96, 165, 250, 0.2)',
                color: '#60a5fa',
                label: '2nd Best'
            };
        }
        if (rank === 2) {
            return {
                bg: 'rgba(139, 92, 246, 0.12)',
                border: 'rgba(139, 92, 246, 0.2)',
                color: '#a78bfa',
                label: '3rd Best'
            };
        }
        return {
            bg: 'rgba(255, 255, 255, 0.06)',
            border: 'rgba(255, 255, 255, 0.12)',
            color: 'rgba(255, 255, 255, 0.7)',
            label: `#${rank + 1}`
        };
    };

    return (
        <>
            <div className="alternatives-card">
                <div className="section-header">
                    <h2 className="section-title">
                        <i className="fa-solid fa-list-check"></i>
                        Alternative Treatment Options
                    </h2>
                    <p className="section-subtitle">
                        Other viable treatments to consider if primary recommendation is not suitable
                    </p>
                </div>

                <div className="alternatives-list">
                    {sortedAlternatives.map((alternative) => {
                        const config = getRankConfig(alternative.rank);
                        const reduction = parseFloat(alternative.predicted_reduction);

                        return (
                            <div
                                key={alternative.id}
                                className="alternative-item"
                                style={{
                                    borderColor: config.border
                                }}
                            >
                                <div className="alternative-header">
                                    <div className="header-left">
                                        <div
                                            className="rank-badge"
                                            style={{
                                                background: config.bg,
                                                borderColor: config.border,
                                                color: config.color
                                            }}
                                        >
                                            {config.label}
                                        </div>

                                        <div className="treatment-info">
                                            <div className="treatment-name">
                                                <i className="fa-solid fa-prescription-bottle-medical"></i>
                                                {alternative.treatment}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="reduction-badge"
                                        style={{
                                            background: config.bg,
                                            borderColor: config.border,
                                            color: config.color
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-trend-down"></i>
                                        <span>{reduction.toFixed(2)}%</span>
                                    </div>
                                </div>

                                <div className="alternative-body">
                                    {/* Pros */}
                                    <div className="section-box pros">
                                        <div className="box-header">
                                            <i className="fa-solid fa-circle-check"></i>
                                            <span>Advantages</span>
                                        </div>
                                        <p className="box-content">{alternative.pros}</p>
                                    </div>

                                    {/* Cons */}
                                    <div className="section-box cons">
                                        <div className="box-header">
                                            <i className="fa-solid fa-circle-xmark"></i>
                                            <span>Disadvantages</span>
                                        </div>
                                        <p className="box-content">{alternative.cons}</p>
                                    </div>

                                    {/* When to Consider */}
                                    <div className="section-box consider">
                                        <div className="box-header">
                                            <i className="fa-solid fa-lightbulb"></i>
                                            <span>When to Consider</span>
                                        </div>
                                        <p className="box-content">{alternative.when_to_consider}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .alternatives-card {
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

                .alternatives-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .alternative-item {
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }

                .alternative-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    transform: translateY(-2px);
                }

                .alternative-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                }

                .rank-badge {
                    padding: 8px 14px;
                    border: 1px solid;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    flex-shrink: 0;
                }

                .treatment-info {
                    flex: 1;
                    min-width: 0;
                }

                .treatment-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .treatment-name i {
                    color: #34d399;
                    font-size: 15px;
                }

                .reduction-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border: 1px solid;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .reduction-badge i {
                    font-size: 13px;
                }

                .alternative-body {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .section-box {
                    padding: 12px 14px;
                    border-radius: 8px;
                    border-left: 3px solid;
                }

                .section-box.pros {
                    background: rgba(34, 197, 94, 0.06);
                    border-color: #22c55e;
                }

                .section-box.cons {
                    background: rgba(239, 68, 68, 0.06);
                    border-color: #ef4444;
                }

                .section-box.consider {
                    background: rgba(139, 92, 246, 0.06);
                    border-color: #8b5cf6;
                }

                .box-header {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                }

                .section-box.pros .box-header {
                    color: #22c55e;
                }

                .section-box.cons .box-header {
                    color: #ef4444;
                }

                .section-box.consider .box-header {
                    color: #8b5cf6;
                }

                .box-header i {
                    font-size: 13px;
                }

                .box-content {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.6;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .alternatives-card {
                        padding: 16px;
                    }

                    .alternative-item {
                        padding: 16px;
                    }

                    .alternative-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }

                    .header-left {
                        width: 100%;
                    }

                    .reduction-badge {
                        align-self: flex-start;
                    }

                    .treatment-name {
                        font-size: 15px;
                    }
                }
            `}</style>
        </>
    );
}