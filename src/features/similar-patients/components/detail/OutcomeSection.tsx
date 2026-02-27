/**
 * OutcomeSection Component
 * Display treatment outcome information
 */

'use client';

import { Outcome } from '../../api/similar-patients.types';

interface OutcomeSectionProps {
    outcome: Outcome;
}

export function OutcomeSection({ outcome }: OutcomeSectionProps) {
    const hba1cReduction = parseFloat(outcome.hba1c_reduction);
    const hba1cFollowup = parseFloat(outcome.hba1c_followup);

    return (
        <>
            <div className="section-container">
                {/* Outcome Status */}
                <div className={`info-card status ${outcome.success ? 'success' : 'failure'}`}>
                    <div className="card-header">
                        <i className={`fa-solid ${outcome.success ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                        <h3>Treatment Outcome</h3>
                    </div>

                    <div className="status-content">
                        <div className="status-badge-large">
                            <i className={`fa-solid ${outcome.success ? 'fa-trophy' : 'fa-triangle-exclamation'}`}></i>
                            <span>{outcome.outcome_category}</span>
                        </div>
                        <p className="status-description">
                            {outcome.success
                                ? 'Treatment achieved desired therapeutic goals'
                                : 'Treatment did not meet expected outcomes'}
                        </p>
                    </div>
                </div>

                {/* HbA1c Results */}
                <div className="results-grid">
                    <div className="info-card">
                        <div className="card-header">
                            <i className="fa-solid fa-arrow-trend-down"></i>
                            <h3>HbA1c Reduction</h3>
                        </div>

                        <div className="result-display">
                            <div className="result-value reduction">
                                <span className="value-number">{hba1cReduction.toFixed(2)}</span>
                                <span className="value-unit">%</span>
                            </div>
                            <p className="result-label">Absolute reduction achieved</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="card-header">
                            <i className="fa-solid fa-chart-line"></i>
                            <h3>HbA1c Follow-up</h3>
                        </div>

                        <div className="result-display">
                            <div className="result-value followup">
                                <span className="value-number">{hba1cFollowup.toFixed(2)}</span>
                                <span className="value-unit">%</span>
                            </div>
                            <p className="result-label">Final HbA1c level</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="card-header">
                            <i className="fa-solid fa-clock"></i>
                            <h3>Time to Target</h3>
                        </div>

                        <div className="result-display">
                            <div className="result-value time">
                                <span className="value-text">{outcome.time_to_target}</span>
                            </div>
                            <p className="result-label">Duration to reach goal</p>
                        </div>
                    </div>
                </div>

                {/* Adverse Events */}
                <div className="info-card">
                    <div className="card-header">
                        <i className="fa-solid fa-exclamation-triangle"></i>
                        <h3>Adverse Events</h3>
                    </div>

                    <div className="adverse-events-content">
                        {outcome.adverse_events && outcome.adverse_events.trim() !== '' && outcome.adverse_events.toLowerCase() !== 'none' ? (
                            <div className="events-box warning">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                <p>{outcome.adverse_events}</p>
                            </div>
                        ) : (
                            <div className="events-box safe">
                                <i className="fa-solid fa-circle-check"></i>
                                <p>No adverse events reported</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Information Note */}
                <div className="info-note">
                    <i className="fa-solid fa-lightbulb"></i>
                    <p>
                        These outcomes are historical results from a similar patient case. Individual patient
                        responses may vary based on multiple factors including adherence, comorbidities, and
                        individual physiology. Use this information as reference data, not as a guarantee of results.
                    </p>
                </div>
            </div>

            <style jsx>{`
                .section-container {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .info-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 20px;
                }

                .info-card.status.success {
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px solid rgba(16, 185, 129, 0.15);
                }

                .info-card.status.failure {
                    background: rgba(239, 68, 68, 0.05);
                    border: 1px solid rgba(239, 68, 68, 0.15);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .card-header i {
                    font-size: 18px;
                }

                .info-card.status.success .card-header i {
                    color: #34d399;
                }

                .info-card.status.failure .card-header i {
                    color: #f87171;
                }

                .info-card:not(.status) .card-header i {
                    color: #34d399;
                }

                .card-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0;
                    letter-spacing: -0.3px;
                }

                .status-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    text-align: center;
                    padding: 20px 0;
                }

                .status-badge-large {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 24px 32px;
                    border-radius: 12px;
                    font-size: 20px;
                    font-weight: 700;
                }

                .info-card.status.success .status-badge-large {
                    background: rgba(16, 185, 129, 0.15);
                    border: 2px solid rgba(16, 185, 129, 0.3);
                    color: #34d399;
                }

                .info-card.status.failure .status-badge-large {
                    background: rgba(239, 68, 68, 0.15);
                    border: 2px solid rgba(239, 68, 68, 0.3);
                    color: #f87171;
                }

                .status-badge-large i {
                    font-size: 48px;
                }

                .status-description {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.6;
                    margin: 0;
                    max-width: 500px;
                }

                .results-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }

                .result-display {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 20px 0;
                }

                .result-value {
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                }

                .result-value.reduction {
                    color: #34d399;
                }

                .result-value.followup {
                    color: #60a5fa;
                }

                .result-value.time {
                    color: #fb923c;
                }

                .value-number {
                    font-size: 36px;
                    font-weight: 700;
                    letter-spacing: -1px;
                }

                .value-unit {
                    font-size: 20px;
                    font-weight: 600;
                    opacity: 0.8;
                }

                .value-text {
                    font-size: 18px;
                    font-weight: 700;
                }

                .result-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    text-align: center;
                    margin: 0;
                }

                .adverse-events-content {
                    display: flex;
                    flex-direction: column;
                }

                .events-box {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 8px;
                    border: 1px solid;
                }

                .events-box.safe {
                    background: rgba(16, 185, 129, 0.08);
                    border-color: rgba(16, 185, 129, 0.2);
                    color: #34d399;
                }

                .events-box.warning {
                    background: rgba(251, 146, 60, 0.08);
                    border-color: rgba(251, 146, 60, 0.2);
                    color: #fb923c;
                }

                .events-box i {
                    font-size: 18px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .events-box p {
                    font-size: 13px;
                    line-height: 1.6;
                    margin: 0;
                }

                .events-box.safe p {
                    color: rgba(255, 255, 255, 0.7);
                }

                .events-box.warning p {
                    color: rgba(255, 255, 255, 0.8);
                }

                .info-note {
                    display: flex;
                    gap: 12px;
                    padding: 16px 18px;
                    background: rgba(168, 85, 247, 0.08);
                    border: 1px solid rgba(168, 85, 247, 0.15);
                    border-radius: 10px;
                }

                .info-note i {
                    color: #a78bfa;
                    font-size: 18px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .info-note p {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.6;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .info-card {
                        padding: 16px;
                    }

                    .status-badge-large {
                        padding: 20px 24px;
                        font-size: 18px;
                    }

                    .status-badge-large i {
                        font-size: 40px;
                    }

                    .results-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .value-number {
                        font-size: 32px;
                    }

                    .value-unit {
                        font-size: 18px;
                    }

                    .value-text {
                        font-size: 16px;
                    }

                    .info-note {
                        padding: 14px;
                        gap: 10px;
                    }
                }
            `}</style>
        </>
    );
}