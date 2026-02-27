/**
 * ClinicalFeaturesSection Component
 * Display clinical features and categories
 */

'use client';

import { ClinicalFeatures, ClinicalCategories } from '../../api/similar-patients.types';

interface ClinicalFeaturesSectionProps {
    features: ClinicalFeatures;
    categories: ClinicalCategories;
}

export function ClinicalFeaturesSection({ features, categories }: ClinicalFeaturesSectionProps) {
    return (
        <>
            <div className="section-container">
                {/* Clinical Categories */}
                <div className="info-card">
                    <div className="card-header">
                        <i className="fa-solid fa-tags"></i>
                        <h3>Clinical Categories</h3>
                    </div>

                    <div className="categories-grid">
                        <div className="category-item">
                            <div className="category-icon">
                                <i className="fa-solid fa-weight-scale"></i>
                            </div>
                            <div className="category-content">
                                <span className="category-label">BMI Category</span>
                                <span className="category-value">{categories.bmi_category}</span>
                            </div>
                        </div>

                        <div className="category-item">
                            <div className="category-icon">
                                <i className="fa-solid fa-droplet"></i>
                            </div>
                            <div className="category-content">
                                <span className="category-label">HbA1c Severity</span>
                                <span className="category-value">{categories.hba1c_severity}</span>
                            </div>
                        </div>

                        <div className="category-item">
                            <div className="category-icon">
                                <i className="fa-solid fa-heart-pulse"></i>
                            </div>
                            <div className="category-content">
                                <span className="category-label">Kidney Function</span>
                                <span className="category-value">{categories.kidney_function}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diabetes Profile */}
                <div className="info-card">
                    <div className="card-header">
                        <i className="fa-solid fa-chart-line"></i>
                        <h3>Diabetes Profile</h3>
                    </div>

                    <div className="features-grid">
                        <div className="feature-item">
                            <span className="feature-label">HbA1c Baseline</span>
                            <span className="feature-value">{features.hba1c_baseline}%</span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-label">Diabetes Duration</span>
                            <span className="feature-value">{features.diabetes_duration} yrs</span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-label">Fasting Glucose</span>
                            <span className="feature-value">{features.fasting_glucose} mg/dL</span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-label">C-Peptide</span>
                            <span className="feature-value">{features.c_peptide} ng/mL</span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-label">Previous Prediabetes</span>
                            <span className={`feature-badge ${features.previous_prediabetes ? 'yes' : 'no'}`}>
                                <i className={`fa-solid ${features.previous_prediabetes ? 'fa-check' : 'fa-xmark'}`}></i>
                                {features.previous_prediabetes ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metabolic & Cardiovascular */}
                <div className="info-card">
                    <div className="card-header">
                        <i className="fa-solid fa-heart-circle-bolt"></i>
                        <h3>Metabolic & Cardiovascular</h3>
                    </div>

                    <div className="features-grid">
                        <div className="feature-item">
                            <span className="feature-label">eGFR</span>
                            <span className="feature-value">{features.egfr} mL/min/1.73m²</span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-label">BMI</span>
                            <span className="feature-value">{features.bmi} kg/m²</span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-label">BP Systolic</span>
                            <span className="feature-value">{features.bp_systolic} mmHg</span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-label">BP Diastolic</span>
                            <span className="feature-value">{features.bp_diastolic} mmHg</span>
                        </div>
                    </div>
                </div>

                {/* Liver & Lipid Profile */}
                <div className="info-card">
                    <div className="card-header">
                        <i className="fa-solid fa-vial"></i>
                        <h3>Liver & Lipid Profile</h3>
                    </div>

                    <div className="features-grid">
                        <div className="feature-item">
                            <span className="feature-label">ALT</span>
                            <span className="feature-value">{features.alt} U/L</span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-label">LDL</span>
                            <span className="feature-value">{features.ldl} mg/dL</span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-label">HDL</span>
                            <span className="feature-value">{features.hdl} mg/dL</span>
                        </div>

                        <div className="feature-item">
                            <span className="feature-label">Triglycerides</span>
                            <span className="feature-value">{features.triglycerides} mg/dL</span>
                        </div>
                    </div>
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

                .categories-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }

                .category-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 10px;
                }

                .category-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    color: #34d399;
                    flex-shrink: 0;
                }

                .category-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    min-width: 0;
                }

                .category-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .category-value {
                    font-size: 14px;
                    color: #ffffff;
                    font-weight: 600;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }

                .feature-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 14px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 8px;
                }

                .feature-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .feature-value {
                    font-size: 15px;
                    color: #ffffff;
                    font-weight: 600;
                }

                .feature-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    width: fit-content;
                }

                .feature-badge.yes {
                    background: rgba(16, 185, 129, 0.12);
                    color: #34d399;
                }

                .feature-badge.no {
                    background: rgba(107, 114, 128, 0.12);
                    color: rgba(255, 255, 255, 0.6);
                }

                .feature-badge i {
                    font-size: 10px;
                }

                @media (max-width: 768px) {
                    .info-card {
                        padding: 16px;
                    }

                    .categories-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .category-item {
                        padding: 12px;
                    }

                    .category-icon {
                        width: 40px;
                        height: 40px;
                        font-size: 16px;
                    }

                    .features-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }

                    .feature-item {
                        padding: 12px;
                    }
                }
            `}</style>
        </>
    );
}