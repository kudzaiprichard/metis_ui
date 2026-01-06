/**
 * DeletePatientDialog Component
 * Confirmation dialog for deleting patients
 */

'use client';

import { Patient } from '../../api/patients.types';
import { useDeletePatient } from '../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';

interface DeletePatientDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

export function DeletePatientDialog({ isOpen, onClose, patient }: DeletePatientDialogProps) {
    const deletePatient = useDeletePatient();
    const { showToast } = useToast();

    if (!isOpen || !patient) return null;

    const handleConfirm = () => {
        deletePatient.mutate(patient.id, {
            onSuccess: () => {
                showToast(
                    'Patient Deleted',
                    `${patient.first_name} ${patient.last_name} has been deleted successfully`,
                    'success'
                );
                onClose();
            },
            onError: (error: ApiError) => {
                showToast(
                    'Delete Failed',
                    error.getMessage(),
                    'error'
                );
            },
        });
    };

    return (
        <>
            <div className="dialog-overlay" onClick={onClose}>
                <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="dialog-header">
                        <div className="header-content">
                            <h2 className="dialog-title">Delete Patient?</h2>
                            <p className="dialog-subtitle">This action can be reversed later</p>
                        </div>
                        <button className="close-btn" onClick={onClose} type="button">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="dialog-content">
                        <div className="message-box warning">
                            <i className="fa-solid fa-trash-can"></i>
                            <div>
                                <p className="message-title">
                                    Delete <strong>{patient.first_name} {patient.last_name}</strong>
                                </p>
                                <p className="message-text">
                                    This patient record will be deactivated and can be restored later if needed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="dialog-actions">
                        <button
                            className="dialog-btn cancel"
                            onClick={onClose}
                            disabled={deletePatient.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            className="dialog-btn confirm delete"
                            onClick={handleConfirm}
                            disabled={deletePatient.isPending}
                        >
                            {deletePatient.isPending ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-trash"></i>
                                    Delete Patient
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dialog-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .dialog-container {
                    width: 100%;
                    max-width: 420px;
                    background: rgba(10, 31, 26, 0.95);
                    border-radius: 16px;
                    border: 1px solid rgba(52, 211, 153, 0.2);
                    box-shadow:
                        0 24px 48px rgba(0, 0, 0, 0.5),
                        0 0 0 1px rgba(52, 211, 153, 0.1) inset;
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(16px) scale(0.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .dialog-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    padding: 20px 20px 16px;
                    border-bottom: 1px solid rgba(52, 211, 153, 0.1);
                }

                .header-content {
                    flex: 1;
                }

                .dialog-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    letter-spacing: -0.3px;
                    margin-bottom: 2px;
                }

                .dialog-subtitle {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 400;
                }

                .close-btn {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 16px;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .dialog-content {
                    padding: 20px;
                }

                .message-box {
                    display: flex;
                    gap: 12px;
                    padding: 14px 16px;
                    border-radius: 10px;
                    border: 1px solid;
                }

                .message-box i {
                    font-size: 20px;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .message-box.warning {
                    background: rgba(239, 68, 68, 0.08);
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .message-box.warning i {
                    color: #ef4444;
                }

                .message-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #ffffff;
                    margin-bottom: 4px;
                    line-height: 1.4;
                }

                .message-title strong {
                    font-weight: 600;
                    color: #ef4444;
                }

                .message-text {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    line-height: 1.5;
                }

                .dialog-actions {
                    display: flex;
                    gap: 10px;
                    padding: 16px 20px 20px;
                    border-top: 1px solid rgba(52, 211, 153, 0.1);
                }

                .dialog-btn {
                    flex: 1;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    border: 1px solid;
                }

                .dialog-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .dialog-btn.cancel {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                    color: rgba(255, 255, 255, 0.7);
                }

                .dialog-btn.cancel:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: #ffffff;
                }

                .dialog-btn.confirm.delete {
                    background: linear-gradient(135deg, #dc2626, #ef4444);
                    border-color: transparent;
                    color: white;
                }

                .dialog-btn.confirm.delete:hover:not(:disabled) {
                    background: linear-gradient(135deg, #b91c1c, #dc2626);
                }

                .dialog-btn:active:not(:disabled) {
                    transform: scale(0.98);
                }

                @media (max-width: 640px) {
                    .dialog-container {
                        max-width: 100%;
                    }

                    .dialog-actions {
                        flex-direction: column-reverse;
                    }
                }
            `}</style>
        </>
    );
}