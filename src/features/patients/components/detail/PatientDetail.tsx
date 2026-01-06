/**
 * PatientDetail Component
 * Main container for patient detail page with tabs
 */

'use client';

import { useState } from 'react';
import { usePatient } from '../../hooks/usePatients';
import { PatientHeader } from './PatientHeader';
import { ContactInfoTab } from './tabs/ContactInfoTab';
import { MedicalDataTab } from './tabs/MedicalDataTab';
import { TimelineTab } from './tabs/TimelineTab';

interface PatientDetailProps {
    patientId: string;
}

export type TabType = 'contact' | 'medical' | 'timeline';

export function PatientDetail({ patientId }: PatientDetailProps) {
    const [activeTab, setActiveTab] = useState<TabType>('contact');
    const { data: patient, isLoading, error } = usePatient(patientId);

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'contact', label: 'Contact Information', icon: 'fa-user' },
        { id: 'medical', label: 'Medical Data', icon: 'fa-notes-medical' },
        { id: 'timeline', label: 'Timeline', icon: 'fa-clock-rotate-left' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="loading-spinner">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Loading patient...</span>
                </div>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="error-message">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>Error loading patient details</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="patient-detail-container">
                {/* Patient Header */}
                <PatientHeader patient={patient} />

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
                    {activeTab === 'contact' && <ContactInfoTab patient={patient} />}
                    {activeTab === 'medical' && <MedicalDataTab patient={patient} />}
                    {activeTab === 'timeline' && <TimelineTab patientId={patientId} />}
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

                .patient-detail-container {
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
                    .patient-detail-container {
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