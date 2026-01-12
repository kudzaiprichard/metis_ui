// src/features/recommendations/components/detail/ExplanationSection.tsx

/**
 * ExplanationSection Component
 * Displays SHAP features, clinical reasoning, and model explanation
 */

'use client';

import { useState } from 'react';
import { PredictionExplanation } from '../../api/recommendations.types';

interface ExplanationSectionProps {
    explanation: PredictionExplanation;
}

export function ExplanationSection({ explanation }: ExplanationSectionProps) {
    const [activeTab, setActiveTab] = useState<'features' | 'reasoning'>('features');

    // Sort features by rank
    const sortedFeatures = [...explanation.features].sort((a, b) => a.rank - b.rank);

    const getFeatureImpact = (shapValue: string) => {
        const value = parseFloat(shapValue);
        if (value > 0) return { label: 'Positive', color: '#34d399', icon: 'fa-arrow-up' };
        if (value < 0) return { label: 'Negative', color: '#ef4444', icon: 'fa-arrow-down' };
        return { label: 'Neutral', color: '#94a3b8', icon: 'fa-minus' };
    };

    const getConfidenceLevelColor = () => {
        const level = explanation.confidence_level.toLowerCase();
        if (level === 'high') return '#34d399';
        if (level === 'medium') return '#60a5fa';
        return '#fbbf24';
    };

    return (
        <>
            <div className="explanation-card">
                <div className="section-header">
                    <h2 className="section-title">
                        <i className="fa-solid fa-lightbulb"></i>
                        Clinical Explanation
                    </h2>
                    <div className="confidence-badge" style={{ borderColor: getConfidenceLevelColor() }}>
                        <i className="fa-solid fa-certificate" style={{ color: getConfidenceLevelColor() }}></i>
                        <span style={{ color: getConfidenceLevelColor() }}>
                            {explanation.confidence_level} Confidence
                        </span>
                    </div>
                </div>

                {/* Summary */}
                <div className="summary-section">
                    <div className="summary-box">
                        <i className="fa-solid fa-file-medical"></i>
                        <p>{explanation.summary_text}</p>
                    </div>

                    <div className="priority-badge">
                        <i className="fa-solid fa-flag"></i>
                        <span>Priority: {explanation.clinical_priority}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs-nav">
                        <button
                            className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                            onClick={() => setActiveTab('features')}
                        >
                            <i className="fa-solid fa-chart-bar"></i>
                            <span>Key Features ({sortedFeatures.length})</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'reasoning' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reasoning')}
                        >
                            <i className="fa-solid fa-brain"></i>
                            <span>Clinical Reasoning</span>
                        </button>
                    </div>

                    <div className="tabs-content">
                        {/* Features Tab */}
                        {activeTab === 'features' && (
                            <div className="features-grid">
                                {sortedFeatures.map((feature) => {
                                    const impact = getFeatureImpact(feature.shap_value);

                                    return (
                                        <div key={feature.id} className="feature-card">
                                            <div className="feature-header">
                                                <div className="feature-rank">#{feature.rank}</div>
                                                <div className="feature-name">{feature.feature_name}</div>
                                                <div className="impact-badge" style={{
                                                    background: `${impact.color}15`,
                                                    borderColor: `${impact.color}30`,
                                                    color: impact.color
                                                }}>
                                                    <i className={`fa-solid ${impact.icon}`}></i>
                                                    {impact.label}
                                                </div>
                                            </div>

                                            <div className="feature-values">
                                                <div className="value-item">
                                                    <span className="value-label">Patient Value</span>
                                                    <span className="value-number">{parseFloat(feature.raw_value).toFixed(2)}</span>
                                                </div>
                                                <div className="value-item">
                                                    <span className="value-label">SHAP Impact</span>
                                                    <span className="value-number" style={{ color: impact.color }}>
                                                        {parseFloat(feature.shap_value).toFixed(4)}
                                                    </span>
                                                </div>
                                            </div>

                                            {feature.reference_range && (
                                                <div className="reference-range">
                                                    <i className="fa-solid fa-ruler"></i>
                                                    <span>Reference: {feature.reference_range}</span>
                                                </div>
                                            )}

                                            <div className="feature-interpretation">
                                                <i className="fa-solid fa-quote-left"></i>
                                                <p>{feature.interpretation}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Reasoning Tab */}
                        {activeTab === 'reasoning' && (
                            <div className="reasoning-content">
                                <div className="reasoning-box">
                                    <h3>
                                        <i className="fa-solid fa-check-circle"></i>
                                        Why This Treatment?
                                    </h3>
                                    <p>{explanation.why_this_treatment}</p>
                                </div>

                                <div className="reasoning-box">
                                    <h3>
                                        <i className="fa-solid fa-times-circle"></i>
                                        Why Not Alternatives?
                                    </h3>
                                    <p>{explanation.why_not_alternatives}</p>
                                </div>

                                {explanation.feature_interactions && (
                                    <div className="reasoning-box">
                                        <h3>
                                            <i className="fa-solid fa-project-diagram"></i>
                                            Feature Interactions
                                        </h3>
                                        <p>{explanation.feature_interactions}</p>
                                    </div>
                                )}

                                <div className="model-values">
                                    <div className="model-value-item">
                                        <span className="model-label">Base Value</span>
                                        <span className="model-number">{parseFloat(explanation.base_value).toFixed(4)}</span>
                                    </div>
                                    <div className="model-value-item">
                                        <span className="model-label">Prediction Value</span>
                                        <span className="model-number">{parseFloat(explanation.prediction_value).toFixed(4)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .explanation-card {
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
                    color: #34d399;
                    font-size: 18px;
                }

                .confidence-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .summary-section {
                    margin-bottom: 24px;
                }

                .summary-box {
                    display: flex;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(96, 165, 250, 0.08);
                    border: 1px solid rgba(96, 165, 250, 0.15);
                    border-radius: 8px;
                    margin-bottom: 12px;
                }

                .summary-box i {
                    color: #60a5fa;
                    font-size: 18px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .summary-box p {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.6;
                    margin: 0;
                }

                .priority-badge {
                    display: inline-flex;
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

                .priority-badge i {
                    font-size: 12px;
                }

                .tabs-container {
                    margin-top: 20px;
                }

                .tabs-nav {
                    display: flex;
                    gap: 4px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 4px;
                    margin-bottom: 20px;
                }

                .tab-btn {
                    flex: 1;
                    padding: 11px 20px;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .tab-btn:hover {
                    color: rgba(255, 255, 255, 0.9);
                    background: rgba(255, 255, 255, 0.04);
                }

                .tab-btn.active {
                    background: rgba(16, 185, 129, 0.15);
                    color: #34d399;
                }

                .tabs-content {
                    min-height: 200px;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 16px;
                }

                .feature-card {
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .feature-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                }

                .feature-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                }

                .feature-rank {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    background: rgba(16, 185, 129, 0.15);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                    color: #34d399;
                    flex-shrink: 0;
                }

                .feature-name {
                    flex: 1;
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                }

                .impact-badge {
                    padding: 4px 8px;
                    border: 1px solid;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .impact-badge i {
                    font-size: 9px;
                }

                .feature-values {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .value-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 6px;
                }

                .value-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .value-number {
                    font-size: 14px;
                    font-weight: 700;
                    color: #ffffff;
                }

                .reference-range {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    background: rgba(139, 92, 246, 0.08);
                    border: 1px solid rgba(139, 92, 246, 0.15);
                    border-radius: 6px;
                    font-size: 11px;
                    color: #a78bfa;
                    margin-bottom: 10px;
                }

                .reference-range i {
                    font-size: 10px;
                }

                .feature-interpretation {
                    display: flex;
                    gap: 10px;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.02);
                    border-left: 3px solid #34d399;
                    border-radius: 4px;
                }

                .feature-interpretation i {
                    color: #34d399;
                    font-size: 10px;
                    margin-top: 2px;
                    flex-shrink: 0;
                }

                .feature-interpretation p {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.5;
                    margin: 0;
                }

                .reasoning-content {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .reasoning-box {
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                }

                .reasoning-box h3 {
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 0 10px 0;
                }

                .reasoning-box h3 i {
                    color: #34d399;
                    font-size: 14px;
                }

                .reasoning-box p {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.6;
                    margin: 0;
                }

                .model-values {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    padding: 16px;
                    background: rgba(16, 185, 129, 0.06);
                    border: 1px solid rgba(16, 185, 129, 0.12);
                    border-radius: 8px;
                }

                .model-value-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .model-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .model-number {
                    font-size: 16px;
                    font-weight: 700;
                    color: #34d399;
                }

                @media (max-width: 768px) {
                    .explanation-card {
                        padding: 16px;
                    }

                    .features-grid {
                        grid-template-columns: 1fr;
                    }

                    .tabs-nav {
                        flex-direction: column;
                    }

                    .tab-btn {
                        justify-content: flex-start;
                    }

                    .model-values {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
}