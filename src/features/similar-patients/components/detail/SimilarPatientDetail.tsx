/**
 * SimilarPatientDetail Component
 * Main container for similar patient case detail page with tabs
 */

'use client';

import { useState } from 'react';
import { useSimilarPatientDetail } from '../../hooks/useSimilarPatients';
import { DetailHeader } from './DetailHeader';
import { DemographicsSection } from './DemographicsSection';
import { ClinicalFeaturesSection } from './ClinicalFeaturesSection';
import { TreatmentSection } from './TreatmentSection';
import { OutcomeSection } from './OutcomeSection';

interface SimilarPatientDetailProps {
    caseId: string;
}

export type TabType = 'demographics' | 'clinical' | 'treatment' | 'outcome';

export function SimilarPatientDetail({ caseId }: SimilarPatientDetailProps) {
    const [activeTab, setActiveTab] = useState<TabType>('demographics');
    const { data: patientCase, isLoading, error } = useSimilarPatientDetail(caseId);

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'demographics', label: 'Demographics', icon: 'fa-user' },
        { id: 'clinical', label: 'Clinical Features', icon: 'fa-notes-medical' },
        { id: 'treatment', label: 'Treatment', icon: 'fa-prescription-bottle-medical' },
        { id: 'outcome', label: 'Outcome', icon: 'fa-chart-line' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="loading-spinner">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Loading case details...</span>
                </div>
            </div>
        );
    }

    if (error || !patientCase) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="error-message">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>Error loading case details</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="detail-container">
                {/* Detail Header */}
                <DetailHeader patientCase={patientCase} />

                {/* Tab Navigation */}
                <div className="tab-navigation">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="tab-content-container">
                    {activeTab === 'demographics' && (
                        <DemographicsSection
                            demographics={patientCase.demographics}
                            comorbidities={patientCase.comorbidities}
                        />
                    )}
                    {activeTab === 'clinical' && (
                        <ClinicalFeaturesSection
                            features={patientCase.clinical_features}
                            categories={patientCase.clinical_categories}
                        />
                    )}
                    {activeTab === 'treatment' && patientCase.treatment && (
                        <TreatmentSection treatment={patientCase.treatment} />
                    )}
                    {activeTab === 'outcome' && patientCase.outcome && (
                        <OutcomeSection outcome={patientCase.outcome} />
                    )}
                </div>
            </div>

            <style jsx>{`
                .loading-spinner,
                .error-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    color: #ffffff;
                    font-size: 16px;
                }

                .loading-spinner i,
                .error-message i {
                    font-size: 32px;
                    color: #10b981;
                }

                .error-message i {
                    color: #ef4444;
                }

                .detail-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .tab-navigation {
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

                .tab-btn i {
                    font-size: 13px;
                }

                .tab-content-container {
                    margin-bottom: 100px;
                }

                @media (max-width: 768px) {
                    .detail-container {
                        padding: 0;
                    }

                    .tab-navigation {
                        flex-direction: column;
                    }

                    .tab-btn {
                        justify-content: flex-start;
                        padding: 12px 16px;
                    }
                }
            `}</style>
        </>
    );
}