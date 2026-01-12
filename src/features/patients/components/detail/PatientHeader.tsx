// src/features/patients/components/detail/PatientHeader.tsx

/**
 * PatientHeader Component
 * Displays patient information header with avatar and quick stats
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PatientDetail } from '../../api/patients.types';
import { BrainPulseLoader } from "@/src/features/patients/components/loader/BrainPulseLoader";
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import {useGenerateRecommendation} from "@/src/features/recommendation/hooks/useRecommendations";

interface PatientHeaderProps {
    patient: PatientDetail;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
    const router = useRouter();
    const [isFindingSimilar, setIsFindingSimilar] = useState(false);
    const { showToast } = useToast();
    const generateRecommendation = useGenerateRecommendation();

    const getInitials = () => {
        return `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getAge = () => {
        if (!patient.medical_data?.age) return 'N/A';
        return patient.medical_data.age;
    };

    const getGender = () => {
        if (!patient.medical_data?.gender) return 'N/A';
        return patient.medical_data.gender;
    };

    const getHbA1c = () => {
        if (!patient.medical_data?.hba1c_baseline) return 'N/A';
        return patient.medical_data.hba1c_baseline;
    };

    const getBMI = () => {
        if (!patient.medical_data?.bmi) return 'N/A';
        return patient.medical_data.bmi;
    };

    const handleBack = () => {
        router.push('/doctor/patients');
    };

    const handleFindSimilar = async () => {
        console.log('Finding similar patients for:', patient.id);

        // Show loading
        setIsFindingSimilar(true);

        try {
            // TODO: Replace with actual API call
            // const response = await findSimilarPatients(patient.id);

            // Simulate API call for now
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Hide loading after search is complete
            setIsFindingSimilar(false);

            // TODO: Handle successful search - navigate to similar patients view
            console.log('Similar patients found!');

        } catch (error) {
            console.error('Find similar patients failed:', error);
            setIsFindingSimilar(false);
        }
    };

    const handlePredict = async () => {
        console.log('Run AI prediction for patient:', patient.id);

        // Check if patient has medical data
        if (!patient.medical_data) {
            showToast(
                'Medical Data Required',
                'Please add medical data for this patient before generating predictions',
                'error'
            );
            return;
        }

        // Generate prediction
        generateRecommendation.mutate(
            { patient_id: patient.id },
            {
                onSuccess: (prediction) => {
                    showToast(
                        'Prediction Generated',
                        `Successfully generated treatment recommendation for ${patient.first_name} ${patient.last_name}`,
                        'success'
                    );

                    // Navigate to the prediction detail page
                    router.push(`/doctor/recommendations/${prediction.id}`);
                },
                onError: (error: ApiError) => {
                    showToast(
                        'Prediction Failed',
                        error.getMessage() || 'Failed to generate prediction. Please try again.',
                        'error'
                    );
                },
            }
        );
    };

    // Mock data for now - replace with actual data when available
    const lastVisit = 'Jan 2, 2026';
    const nextAppointment = 'Jan 15, 2026';
    const status = 'Active';

    return (
        <>
            {/* Brain Pulse Loader */}
            <BrainPulseLoader isLoading={generateRecommendation.isPending} />

            <div className="patient-header-card">
                {/* Top Row: Basic Info + Actions */}
                <div className="header-top-row">
                    <div className="patient-basic-info">
                        <div className="patient-avatar">{getInitials()}</div>
                        <div className="patient-details">
                            <h1 className="patient-name">
                                {patient.first_name} {patient.last_name}
                            </h1>
                            <p className="patient-id">ID: {patient.id.slice(0, 16)}...</p>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="action-btn back-btn" onClick={handleBack}>
                            <i className="fa-solid fa-arrow-left"></i>
                            <span>Back to Patients</span>
                        </button>
                        <button
                            className="action-btn similar-btn"
                            onClick={handleFindSimilar}
                            disabled={isFindingSimilar}
                        >
                            {isFindingSimilar ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    <span>Searching...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-users"></i>
                                    <span>Find Similar</span>
                                </>
                            )}
                        </button>
                        <button
                            className="action-btn primary"
                            onClick={handlePredict}
                            disabled={generateRecommendation.isPending || !patient.medical_data}
                        >
                            {generateRecommendation.isPending ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-brain"></i>
                                    <span>AI Predict</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Bottom Row: Stats Grid */}
                <div className="stats-grid">
                    {/* Medical Stats */}
                    <div className="stat-group">
                        <div className="stat-item">
                            <i className="fa-solid fa-user stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">Age</span>
                                <span className="stat-value">{getAge()}<span className="stat-unit">yrs</span></span>
                            </div>
                        </div>

                        <div className="stat-item">
                            <i className="fa-solid fa-venus-mars stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">Gender</span>
                                <span className="stat-value">{getGender()}</span>
                            </div>
                        </div>

                        <div className="stat-item">
                            <i className="fa-solid fa-droplet stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">HbA1c</span>
                                <span className="stat-value">{getHbA1c()}<span className="stat-unit">%</span></span>
                            </div>
                        </div>

                        <div className="stat-item">
                            <i className="fa-solid fa-weight-scale stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">BMI</span>
                                <span className="stat-value">{getBMI()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="stat-group">
                        <div className="stat-item">
                            <i className="fa-solid fa-calendar-check stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">Last Visit</span>
                                <span className="stat-value">{lastVisit}</span>
                            </div>
                        </div>

                        <div className="stat-item">
                            <i className="fa-solid fa-calendar-days stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">Next Appointment</span>
                                <span className="stat-value">{nextAppointment}</span>
                            </div>
                        </div>

                        <div className="stat-item">
                            <i className="fa-solid fa-circle-check stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">Status</span>
                                <span className="stat-value status-active">{status}</span>
                            </div>
                        </div>

                        <div className="stat-item">
                            <i className="fa-solid fa-clock stat-icon"></i>
                            <div className="stat-content">
                                <span className="stat-label">Last Updated</span>
                                <span className="stat-value">{formatDate(patient.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .patient-header-card {
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    margin-bottom: 20px;
                }

                .header-top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .patient-basic-info {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .patient-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #047857, #10b981);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .patient-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .patient-name {
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffffff;
                    letter-spacing: -0.3px;
                    margin: 0;
                }

                .patient-id {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 500;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    gap: 10px;
                    flex-shrink: 0;
                }

                .action-btn {
                    padding: 10px 18px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    white-space: nowrap;
                }

                .action-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.18);
                    color: #ffffff;
                }

                .action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .action-btn.back-btn {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.7);
                }

                .action-btn.back-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                    color: rgba(255, 255, 255, 0.9);
                }

                .action-btn.similar-btn {
                    background: rgba(139, 92, 246, 0.12);
                    border-color: rgba(139, 92, 246, 0.2);
                    color: #a78bfa;
                }

                .action-btn.similar-btn:hover:not(:disabled) {
                    background: rgba(139, 92, 246, 0.18);
                    border-color: rgba(139, 92, 246, 0.3);
                    color: #c4b5fd;
                }

                .action-btn.similar-btn:disabled {
                    opacity: 1;
                    background: rgba(139, 92, 246, 0.15);
                }

                .action-btn.primary {
                    background: linear-gradient(135deg, #047857, #10b981);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: #ffffff;
                }

                .action-btn.primary:hover:not(:disabled) {
                    background: linear-gradient(135deg, #059669, #34d399);
                }

                .action-btn.primary:disabled {
                    opacity: 0.5;
                    background: linear-gradient(135deg, #047857, #10b981);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .stat-group {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .stat-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .stat-icon {
                    font-size: 16px;
                    color: #34d399;
                    width: 20px;
                    text-align: center;
                    flex-shrink: 0;
                }

                .stat-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .stat-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .stat-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .stat-unit {
                    font-size: 11px;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.6);
                    margin-left: 2px;
                }

                .stat-value.status-active {
                    color: #34d399;
                }

                @media (max-width: 1200px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .patient-header-card {
                        padding: 16px;
                    }

                    .header-top-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .patient-avatar {
                        width: 48px;
                        height: 48px;
                        font-size: 18px;
                    }

                    .patient-name {
                        font-size: 18px;
                    }

                    .header-actions {
                        width: 100%;
                        flex-direction: column;
                    }

                    .action-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .stat-group {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                }
            `}</style>
        </>
    );
}