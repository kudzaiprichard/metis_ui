/**
 * SimilarPatientTableRow Component
 * Table row for displaying a similar patient case
 */

'use client';

import { useRouter } from 'next/navigation';
import { SimilarPatientCase } from '../../api/similar-patients.types';

interface SimilarPatientTableRowProps {
    case: SimilarPatientCase;
}

export function SimilarPatientTableRow({ case: patientCase }: SimilarPatientTableRowProps) {
    const router = useRouter();

    const handleView = () => {
        router.push(`/doctor/similar-patients/${patientCase.case_id}`);
    };

    const similarityScore = (patientCase.similarity_score * 100).toFixed(1);
    const clinicalSimilarity = (patientCase.clinical_similarity * 100).toFixed(0);
    const comorbiditySimilarity = (patientCase.comorbidity_similarity * 100).toFixed(0);
    const hba1cReduction = parseFloat(patientCase.outcome.hba1c_reduction);

    // Determine similarity color
    const getSimilarityColor = (score: number) => {
        if (score >= 0.8) return '#34d399';
        if (score >= 0.6) return '#60a5fa';
        return '#fb923c';
    };

    const similarityColor = getSimilarityColor(patientCase.similarity_score);

    return (
        <>
            <div className="table-row" onClick={handleView}>
                {/* Case ID */}
                <div className="table-cell case-id-cell">
                    <div className="case-id-badge">
                        <i className="fa-solid fa-id-card"></i>
                        <span>{patientCase.case_id}</span>
                    </div>
                </div>

                {/* Similarity */}
                <div className="table-cell">
                    <div className="similarity-container">
                        <div className="similarity-main" style={{ color: similarityColor }}>
                            <i className="fa-solid fa-percent"></i>
                            <span>{similarityScore}%</span>
                        </div>
                        <div className="similarity-breakdown">
                            <span className="breakdown-item">C: {clinicalSimilarity}%</span>
                            <span className="breakdown-divider">•</span>
                            <span className="breakdown-item">Co: {comorbiditySimilarity}%</span>
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <div className="table-cell profile-cell">
                    <div className="profile-info">
                        <div className="profile-line">
                            <i className="fa-solid fa-user"></i>
                            <span>{patientCase.profile.age} yrs • {patientCase.profile.gender} • {patientCase.profile.ethnicity}</span>
                        </div>
                        <div className="profile-line">
                            <i className="fa-solid fa-chart-line"></i>
                            <span>HbA1c: {patientCase.profile.hba1c_baseline}% • BMI: {patientCase.profile.bmi}</span>
                        </div>
                    </div>
                </div>

                {/* Treatment */}
                <div className="table-cell treatment-cell">
                    <div className="treatment-info">
                        <div className="treatment-name">{patientCase.treatment_given}</div>
                        <div className="drug-class">({patientCase.drug_class})</div>
                    </div>
                </div>

                {/* Outcome */}
                <div className="table-cell outcome-cell">
                    <div className="outcome-info">
                        <div className="reduction-value">
                            <i className="fa-solid fa-arrow-trend-down"></i>
                            <span>{hba1cReduction.toFixed(2)}%</span>
                        </div>
                        <div className={`outcome-badge ${patientCase.outcome.success ? 'success' : 'failure'}`}>
                            <i className={`fa-solid ${patientCase.outcome.success ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                            <span>{patientCase.outcome.success ? 'Success' : 'Failed'}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="table-cell actions-cell">
                    <button className="action-btn view" title="View details" onClick={handleView}>
                        <i className="fa-solid fa-eye"></i>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .table-row {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr 1.8fr 1.5fr 1.2fr 0.8fr;
                    gap: 16px;
                    padding: 16px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    cursor: pointer;
                    align-items: center;
                }

                .table-row:hover {
                    background: rgba(255, 255, 255, 0.03);
                    transform: translateY(-1px);
                    border-bottom-color: rgba(255, 255, 255, 0.08);
                }

                .table-row:hover::before {
                    content: '';
                    position: absolute;
                    left: -32px;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: linear-gradient(to bottom, #34d399, #10b981);
                    border-radius: 0 2px 2px 0;
                    opacity: 0.8;
                }

                .table-cell {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    color: #ffffff;
                    min-width: 0;
                }

                .case-id-cell {
                    min-width: 0;
                }

                .case-id-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 10px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                    max-width: 100%;
                }

                .case-id-badge i {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 11px;
                    flex-shrink: 0;
                }

                .case-id-badge span {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .similarity-container {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .similarity-main {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 15px;
                    font-weight: 700;
                }

                .similarity-main i {
                    font-size: 11px;
                }

                .similarity-breakdown {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 500;
                }

                .breakdown-divider {
                    color: rgba(255, 255, 255, 0.3);
                }

                .profile-cell {
                    min-width: 0;
                }

                .profile-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 0;
                    flex: 1;
                }

                .profile-line {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .profile-line i {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 11px;
                    flex-shrink: 0;
                }

                .treatment-cell {
                    min-width: 0;
                }

                .treatment-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                    flex: 1;
                }

                .treatment-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #34d399;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .drug-class {
                    font-size: 11px;
                    color: rgba(52, 211, 153, 0.6);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .outcome-cell {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;
                }

                .outcome-info {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    width: 100%;
                }

                .reduction-value {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #34d399;
                }

                .reduction-value i {
                    font-size: 11px;
                }

                .outcome-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 600;
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
                    font-size: 9px;
                }

                .actions-cell {
                    justify-content: flex-end;
                }

                .action-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.03);
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 13px;
                }

                .action-btn:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .action-btn.view:hover {
                    background: rgba(96, 165, 250, 0.12);
                    border-color: rgba(96, 165, 250, 0.3);
                    color: #60a5fa;
                }

                .action-btn:active {
                    transform: translateY(0);
                }

                @media (max-width: 768px) {
                    .table-row {
                        grid-template-columns: 1fr;
                        gap: 14px;
                        padding: 20px;
                        background: rgba(255, 255, 255, 0.02);
                        border-radius: 12px;
                        margin-bottom: 12px;
                        border: 1px solid rgba(255, 255, 255, 0.06);
                    }

                    .table-row:hover::before {
                        display: none;
                    }

                    .table-cell {
                        justify-content: space-between;
                    }

                    .outcome-cell {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .actions-cell {
                        justify-content: flex-start;
                    }
                }
            `}</style>
        </>
    );
}