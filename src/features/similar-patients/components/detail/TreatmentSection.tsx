/**
 * TreatmentSection Component
 * Display treatment information
 */

'use client';

import { TreatmentInfo } from '../../api/similar-patients.types';

interface TreatmentSectionProps {
    treatment: TreatmentInfo;
}

export function TreatmentSection({ treatment }: TreatmentSectionProps) {
    const getCostColor = (category: string) => {
        const colors: Record<string, string> = {
            'Low': '#34d399',
            'Medium': '#fb923c',
            'High': '#f87171',
        };
        return colors[category] || '#9ca3af';
    };

    const getEvidenceColor = (level: string) => {
        const colors: Record<string, string> = {
            'High': '#34d399',
            'Moderate': '#60a5fa',
            'Low': '#fb923c',
        };
        return colors[level] || '#9ca3af';
    };

    return (
        <>
            <div className="section-container">
                {/* Treatment Overview */}
                <div className="info-card highlight">
                    <div className="card-header">
                        <i className="fa-solid fa-prescription-bottle-medical"></i>
                        <h3>Treatment Given</h3>
                    </div>

                    <div className="treatment-overview">
                        <div className="drug-name-section">
                            <span className="drug-label">Drug Name</span>
                            <h2 className="drug-name">{treatment.drug_name}</h2>
                        </div>
                        <div className="drug-class-badge">
                            <i className="fa-solid fa-pills"></i>
                            <span>{treatment.drug_class}</span>
                        </div>
                    </div>
                </div>

                {/* Treatment Details */}
                <div className="details-grid">
                    {/* Cost Category */}
                    <div className="info-card">
                        <div className="card-header">
                            <i className="fa-solid fa-dollar-sign"></i>
                            <h3>Cost Category</h3>
                        </div>

                        <div className="detail-content">
                            <div
                                className="cost-badge"
                                style={{
                                    background: `${getCostColor(treatment.cost_category)}20`,
                                    color: getCostColor(treatment.cost_category),
                                    borderColor: `${getCostColor(treatment.cost_category)}40`
                                }}
                            >
                                <i className="fa-solid fa-tag"></i>
                                <span>{treatment.cost_category}</span>
                            </div>
                            <p className="detail-description">
                                {treatment.cost_category === 'Low' && 'Generally affordable and cost-effective'}
                                {treatment.cost_category === 'Medium' && 'Moderately priced treatment option'}
                                {treatment.cost_category === 'High' && 'Premium priced treatment option'}
                            </p>
                        </div>
                    </div>

                    {/* Evidence Level */}
                    <div className="info-card">
                        <div className="card-header">
                            <i className="fa-solid fa-flask"></i>
                            <h3>Evidence Level</h3>
                        </div>

                        <div className="detail-content">
                            <div
                                className="evidence-badge"
                                style={{
                                    background: `${getEvidenceColor(treatment.evidence_level)}20`,
                                    color: getEvidenceColor(treatment.evidence_level),
                                    borderColor: `${getEvidenceColor(treatment.evidence_level)}40`
                                }}
                            >
                                <i className="fa-solid fa-certificate"></i>
                                <span>{treatment.evidence_level}</span>
                            </div>
                            <p className="detail-description">
                                {treatment.evidence_level === 'High' && 'Strong clinical evidence supporting efficacy'}
                                {treatment.evidence_level === 'Moderate' && 'Adequate clinical evidence available'}
                                {treatment.evidence_level === 'Low' && 'Limited clinical evidence available'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Information Note */}
                <div className="info-note">
                    <i className="fa-solid fa-circle-info"></i>
                    <p>
                        This treatment information is from historical data and represents what was administered
                        to this similar patient case. Always consult current clinical guidelines and patient-specific
                        factors when making treatment decisions.
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

                .info-card.highlight {
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px solid rgba(16, 185, 129, 0.15);
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

                .treatment-overview {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                }

                .drug-name-section {
                    flex: 1;
                    min-width: 0;
                }

                .drug-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                    display: block;
                    margin-bottom: 8px;
                }

                .drug-name {
                    font-size: 28px;
                    font-weight: 700;
                    color: #34d399;
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                .drug-class-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.25);
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #34d399;
                    white-space: nowrap;
                }

                .drug-class-badge i {
                    font-size: 16px;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .detail-content {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .cost-badge,
                .evidence-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 700;
                    border: 1px solid;
                    width: fit-content;
                }

                .cost-badge i,
                .evidence-badge i {
                    font-size: 13px;
                }

                .detail-description {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                    line-height: 1.6;
                    margin: 0;
                }

                .info-note {
                    display: flex;
                    gap: 12px;
                    padding: 16px 18px;
                    background: rgba(59, 130, 246, 0.08);
                    border: 1px solid rgba(59, 130, 246, 0.15);
                    border-radius: 10px;
                }

                .info-note i {
                    color: #60a5fa;
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

                    .treatment-overview {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .drug-name {
                        font-size: 22px;
                    }

                    .drug-class-badge {
                        align-self: flex-start;
                    }

                    .details-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
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