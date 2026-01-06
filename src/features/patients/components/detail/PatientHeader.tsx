/**
 * PatientHeader Component
 * Displays patient information header with avatar and quick stats
 */

'use client';

import { useRouter } from 'next/navigation';
import { PatientDetail } from '../../api/patients.types';

interface PatientHeaderProps {
    patient: PatientDetail;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
    const router = useRouter();

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

    const handleExport = () => {
        console.log('Export patient data:', patient.id);
    };

    const handlePredict = () => {
        console.log('Run AI prediction for patient:', patient.id);
    };

    // Mock data for now - replace with actual data when available
    const lastVisit = 'Jan 2, 2026';
    const nextAppointment = 'Jan 15, 2026';
    const status = 'Active';

    return (
        <>
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
                        <button className="action-btn" onClick={handleExport}>
                            <i className="fa-solid fa-download"></i>
                            <span>Export</span>
                        </button>
                        <button className="action-btn primary" onClick={handlePredict}>
                            <i className="fa-solid fa-brain"></i>
                            <span>AI Predict</span>
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

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.18);
                    color: #ffffff;
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

                .action-btn.primary {
                    background: linear-gradient(135deg, #047857, #10b981);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: #ffffff;
                }

                .action-btn.primary:hover {
                    background: linear-gradient(135deg, #059669, #34d399);
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