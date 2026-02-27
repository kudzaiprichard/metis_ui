/**
 * SimilarPatientCard Component
 * Card view for displaying a similar patient case
 */

'use client';

import { useRouter } from 'next/navigation';
import { SimilarPatientCase } from '../../api/similar-patients.types';

interface SimilarPatientCardProps {
    case: SimilarPatientCase;
}

export function SimilarPatientCard({ case: patientCase }: SimilarPatientCardProps) {
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/doctor/similar-patients/${patientCase.case_id}`);
    };

    const similarityScore = (patientCase.similarity_score * 100).toFixed(1);
    const clinicalSimilarity = (patientCase.clinical_similarity * 100).toFixed(0);
    const comorbiditySimilarity = (patientCase.comorbidity_similarity * 100).toFixed(0);
    const hba1cReduction = parseFloat(patientCase.outcome.hba1c_reduction);

    // Determine similarity color
    const getSimilarityColor = (score: number) => {
        if (score >= 0.8) return '#34d399'; // High
        if (score >= 0.6) return '#60a5fa'; // Medium
        return '#fb923c'; // Low
    };

    const similarityColor = getSimilarityColor(patientCase.similarity_score);

    return (
        <>
            <div className="case-card" onClick={handleViewDetails}>
                {/* Header with Case ID and Similarity */}
                <div className="card-header">
                    <div className="case-id">
                        <i className="fa-solid fa-id-card"></i>
                        <span>{patientCase.case_id}</span>
                    </div>
                    <div className="similarity-badge" style={{ background: `${similarityColor}20`, color: similarityColor, borderColor: `${similarityColor}40` }}>
                        <i className="fa-solid fa-percent"></i>
                        {similarityScore}%
                    </div>
                </div>

                {/* Patient Profile */}
                <div className="profile-section">
                    <div className="profile-row">
                        <div className="profile-item">
                            <i className="fa-solid fa-user"></i>
                            <span>{patientCase.profile.age} yrs • {patientCase.profile.gender}</span>
                        </div>
                        <div className="profile-item">
                            <i className="fa-solid fa-globe"></i>
                            <span>{patientCase.profile.ethnicity}</span>
                        </div>
                    </div>
                    <div className="profile-row">
                        <div className="profile-item">
                            <i className="fa-solid fa-chart-line"></i>
                            <span>HbA1c: {patientCase.profile.hba1c_baseline}%</span>
                        </div>
                        <div className="profile-item">
                            <i className="fa-solid fa-weight-scale"></i>
                            <span>BMI: {patientCase.profile.bmi}</span>
                        </div>
                    </div>
                </div>

                {/* Similarity Breakdown */}
                <div className="similarity-breakdown">
                    <div className="breakdown-item">
                        <span className="breakdown-label">Clinical</span>
                        <span className="breakdown-value">{clinicalSimilarity}%</span>
                    </div>
                    <div className="breakdown-item">
                        <span className="breakdown-label">Comorbidity</span>
                        <span className="breakdown-value">{comorbiditySimilarity}%</span>
                    </div>
                </div>

                {/* Comorbidities */}
                {patientCase.comorbidities.length > 0 && (
                    <div className="comorbidities-section">
                        <div className="section-label">Comorbidities</div>
                        <div className="comorbidity-tags">
                            {patientCase.comorbidities.slice(0, 3).map((comorbidity, index) => (
                                <span key={index} className="comorbidity-tag">
                                    {comorbidity}
                                </span>
                            ))}
                            {patientCase.comorbidities.length > 3 && (
                                <span className="comorbidity-tag more">
                                    +{patientCase.comorbidities.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Treatment & Outcome */}
                <div className="treatment-section">
                    <div className="section-label">Treatment Given</div>
                    <div className="treatment-badge">
                        <i className="fa-solid fa-prescription-bottle-medical"></i>
                        <span>{patientCase.treatment_given}</span>
                        <span className="drug-class">({patientCase.drug_class})</span>
                    </div>
                </div>

                <div className="outcome-section">
                    <div className="outcome-stat">
                        <i className="fa-solid fa-arrow-trend-down"></i>
                        <span>HbA1c Reduction: <strong>{hba1cReduction.toFixed(2)}%</strong></span>
                    </div>
                    <div className={`outcome-badge ${patientCase.outcome.success ? 'success' : 'failure'}`}>
                        <i className={`fa-solid ${patientCase.outcome.success ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                        <span>{patientCase.outcome.outcome_category}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="card-footer">
                    <button className="view-btn" onClick={handleViewDetails}>
                        <i className="fa-solid fa-eye"></i>
                        <span>View Details</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .case-card {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 16px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .case-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .case-id {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                }

                .case-id i {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                }

                .similarity-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    border: 1px solid;
                }

                .similarity-badge i {
                    font-size: 11px;
                }

                .profile-section {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 12px;
                }

                .profile-row {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .profile-row:last-child {
                    margin-bottom: 0;
                }

                .profile-item {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                }

                .profile-item i {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 11px;
                }

                .similarity-breakdown {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 12px;
                }

                .breakdown-item {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 6px;
                    padding: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .breakdown-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .breakdown-value {
                    font-size: 12px;
                    font-weight: 700;
                    color: #34d399;
                }

                .comorbidities-section {
                    margin-bottom: 12px;
                }

                .section-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                    margin-bottom: 8px;
                }

                .comorbidity-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .comorbidity-tag {
                    padding: 4px 8px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 600;
                    color: #f87171;
                }

                .comorbidity-tag.more {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.6);
                }

                .treatment-section {
                    margin-bottom: 12px;
                }

                .treatment-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: rgba(16, 185, 129, 0.08);
                    border: 1px solid rgba(16, 185, 129, 0.15);
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #34d399;
                }

                .treatment-badge i {
                    font-size: 12px;
                }

                .drug-class {
                    font-size: 11px;
                    font-weight: 500;
                    color: rgba(52, 211, 153, 0.7);
                }

                .outcome-section {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 8px;
                    padding: 10px 12px;
                    margin-bottom: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                }

                .outcome-stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                }

                .outcome-stat i {
                    color: #34d399;
                    font-size: 11px;
                }

                .outcome-stat strong {
                    color: #34d399;
                }

                .outcome-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .outcome-badge.success {
                    background: rgba(16, 185, 129, 0.12);
                    color: #34d399;
                }

                .outcome-badge.failure {
                    background: rgba(239, 68, 68, 0.12);
                    color: #f87171;
                }

                .outcome-badge i {
                    font-size: 10px;
                }

                .card-footer {
                    padding-top: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .view-btn {
                    width: 100%;
                    padding: 10px;
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
                    justify-content: center;
                    gap: 8px;
                }

                .view-btn:hover {
                    background: rgba(16, 185, 129, 0.18);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: #6ee7b7;
                }

                @media (max-width: 768px) {
                    .outcome-section {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .outcome-badge {
                        align-self: flex-end;
                    }
                }
            `}</style>
        </>
    );
}