/**
 * PatientCard Component
 * Grid view card for displaying patient information
 */

'use client';

import { useRouter } from 'next/navigation';
import { Patient } from '../../api/patients.types';

interface PatientCardProps {
    patient: Patient;
    onDelete: (patient: Patient) => void;
}

export function PatientCard({ patient, onDelete }: PatientCardProps) {
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

    const handleViewDetails = () => {
        router.push(`/doctor/patients/${patient.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(patient);
    };

    return (
        <>
            <div className="patient-card" onClick={handleViewDetails}>
                <div className="card-header">
                    <div className="patient-avatar">{getInitials()}</div>
                    <div className="header-content">
                        <div className="patient-name">
                            {patient.first_name} {patient.last_name}
                        </div>
                        <div className="patient-id">ID: {patient.id.slice(0, 8)}</div>
                    </div>
                    <button className="delete-btn" onClick={handleDelete}>
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>

                <div className="card-body">
                    <div className="info-grid">
                        <div className="info-item">
                            <i className="fa-solid fa-envelope icon"></i>
                            <div className="info-content">
                                <span className="info-label">Email</span>
                                <span className="info-value">{patient.email || 'Not provided'}</span>
                            </div>
                        </div>

                        <div className="info-item">
                            <i className="fa-solid fa-phone icon"></i>
                            <div className="info-content">
                                <span className="info-label">Mobile</span>
                                <span className="info-value">{patient.mobile_number || 'Not provided'}</span>
                            </div>
                        </div>

                        <div className="info-item">
                            <i className="fa-solid fa-calendar icon"></i>
                            <div className="info-content">
                                <span className="info-label">Created</span>
                                <span className="info-value">{formatDate(patient.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <button className="view-btn" onClick={handleViewDetails}>
                        <i className="fa-solid fa-eye"></i>
                        <span>View Details</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .patient-card {
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    padding: 16px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .patient-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 14px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .patient-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #047857, #10b981);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 15px;
                    flex-shrink: 0;
                }

                .header-content {
                    flex: 1;
                    min-width: 0;
                }

                .patient-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .patient-id {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 500;
                }

                .delete-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    flex-shrink: 0;
                }

                .delete-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }

                .card-body {
                    margin-bottom: 12px;
                }

                .info-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 6px;
                }

                .icon {
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #34d399;
                    font-size: 12px;
                    margin-top: 2px;
                    flex-shrink: 0;
                }

                .info-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .info-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .info-value {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 400;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .card-footer {
                    padding-top: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .view-btn {
                    width: 100%;
                    padding: 10px 16px;
                    background: rgba(16, 185, 129, 0.12);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 7px;
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
                    .patient-card {
                        padding: 14px;
                    }

                    .patient-name {
                        font-size: 14px;
                    }

                    .info-value {
                        font-size: 12px;
                    }
                }
            `}</style>
        </>
    );
}