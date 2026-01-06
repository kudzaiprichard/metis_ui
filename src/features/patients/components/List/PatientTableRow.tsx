/**
 * PatientTableRow Component
 * Table row for displaying patient information
 */

'use client';

import { useRouter } from 'next/navigation';
import { Patient } from '../../api/patients.types';

interface PatientTableRowProps {
    patient: Patient;
    onDelete: (patient: Patient) => void;
}

export function PatientTableRow({ patient, onDelete }: PatientTableRowProps) {
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

    const handleView = () => {
        router.push(`/doctor/patients/${patient.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(patient);
    };

    return (
        <>
            <div className="table-row" onClick={handleView}>
                <div className="table-cell patient-cell">
                    <div className="patient-avatar-small">{getInitials()}</div>
                    <div className="patient-info">
                        <p className="patient-name">
                            {patient.first_name} {patient.last_name}
                        </p>
                        <p className="patient-id">ID: {patient.id.slice(0, 8)}</p>
                    </div>
                </div>
                <div className="table-cell">
                    <p className="patient-email">{patient.email || 'Not provided'}</p>
                </div>
                <div className="table-cell">
                    <p className="patient-mobile">{patient.mobile_number || 'Not provided'}</p>
                </div>
                <div className="table-cell">
                    <p className="date-text">{formatDate(patient.created_at)}</p>
                </div>
                <div className="table-cell actions-cell">
                    <button
                        className="action-btn view"
                        title="View patient"
                        onClick={handleView}
                    >
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    <button
                        className="action-btn delete"
                        title="Delete patient"
                        onClick={handleDelete}
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .table-row {
                    display: grid;
                    grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr;
                    gap: 16px;
                    padding: 18px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    cursor: pointer;
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
                }

                .patient-cell {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .patient-avatar-small {
                    width: 44px;
                    height: 44px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 14px;
                    font-weight: 600;
                    color: white;
                    letter-spacing: 0.5px;
                }

                .table-row:hover .patient-avatar-small {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .patient-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }

                .patient-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #ffffff;
                    letter-spacing: -0.1px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .patient-id {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .patient-email,
                .patient-mobile {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 400;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .date-text {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 400;
                }

                .actions-cell {
                    display: flex;
                    gap: 10px;
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

                .action-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.12);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
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

                    .patient-cell {
                        flex-direction: row;
                    }

                    .actions-cell {
                        justify-content: flex-start;
                    }
                }
            `}</style>
        </>
    );
}