/**
 * DemographicsSection Component
 * Display demographics and comorbidities information
 */

'use client';

import { Demographics } from '../../api/similar-patients.types';

interface DemographicsSectionProps {
    demographics: Demographics;
    comorbidities: string[];
}

export function DemographicsSection({ demographics, comorbidities }: DemographicsSectionProps) {
    return (
        <>
            <div className="section-container">
                {/* Demographics Card */}
                <div className="info-card">
                    <div className="card-header">
                        <i className="fa-solid fa-user"></i>
                        <h3>Demographics</h3>
                    </div>

                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Age</span>
                            <span className="info-value">{demographics.age} years</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Gender</span>
                            <span className="info-value">{demographics.gender}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Ethnicity</span>
                            <span className="info-value">{demographics.ethnicity}</span>
                        </div>

                        <div className="info-item">
                            <span className="info-label">Age Group</span>
                            <span className="info-value">{demographics.age_group}</span>
                        </div>
                    </div>
                </div>

                {/* Comorbidities Card */}
                <div className="info-card">
                    <div className="card-header">
                        <i className="fa-solid fa-notes-medical"></i>
                        <h3>Comorbidities</h3>
                        <span className="count-badge">{comorbidities.length}</span>
                    </div>

                    {comorbidities.length > 0 ? (
                        <div className="comorbidities-container">
                            {comorbidities.map((comorbidity, index) => (
                                <div key={index} className="comorbidity-item">
                                    <i className="fa-solid fa-circle-check"></i>
                                    <span>{comorbidity}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <i className="fa-solid fa-check-circle"></i>
                            <p>No comorbidities reported</p>
                        </div>
                    )}
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

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .card-header i {
                    color: #34d399;
                    font-size: 18px;
                }

                .card-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0;
                    letter-spacing: -0.3px;
                }

                .count-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 24px;
                    height: 24px;
                    padding: 0 8px;
                    background: rgba(16, 185, 129, 0.15);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #34d399;
                    margin-left: auto;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding: 14px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 8px;
                }

                .info-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .info-value {
                    font-size: 15px;
                    color: #ffffff;
                    font-weight: 600;
                }

                .comorbidities-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .comorbidity-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px;
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.15);
                    border-radius: 8px;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 500;
                }

                .comorbidity-item i {
                    color: #f87171;
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    text-align: center;
                }

                .empty-state i {
                    font-size: 32px;
                    color: #34d399;
                    margin-bottom: 12px;
                }

                .empty-state p {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .info-card {
                        padding: 16px;
                    }

                    .info-grid,
                    .comorbidities-container {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .info-item {
                        padding: 12px;
                    }

                    .comorbidity-item {
                        padding: 10px 12px;
                    }
                }
            `}</style>
        </>
    );
}