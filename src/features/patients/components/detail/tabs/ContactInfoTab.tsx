/**
 * ContactInfoTab Component
 * Display and edit patient contact information with toggle mode
 */

'use client';

import { useState, FormEvent } from 'react';
import { PatientDetail } from '../../../api/patients.types';
import { useUpdatePatientContact } from '../../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';

interface ContactInfoTabProps {
    patient: PatientDetail;
}

export function ContactInfoTab({ patient }: ContactInfoTabProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [formData, setFormData] = useState({
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email || '',
        mobile_number: patient.mobile_number || '',
    });

    const updateContact = useUpdatePatientContact();
    const { showToast } = useToast();

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setFieldErrors({});
        setFormData({
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email || '',
            mobile_number: patient.mobile_number || '',
        });
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        updateContact.mutate(
            { patientId: patient.id, data: formData },
            {
                onSuccess: () => {
                    showToast(
                        'Contact Updated',
                        'Patient contact information has been updated successfully',
                        'success'
                    );
                    setIsEditMode(false);
                },
                onError: (error: ApiError) => {
                    if (error.hasFieldErrors()) {
                        setFieldErrors(error.fieldErrors || {});
                    }
                    showToast('Update Failed', error.getMessage(), 'error');
                },
            }
        );
    };

    return (
        <>
            <div className="tab-content">
                <div className="content-header">
                    <h2 className="content-title">Contact Information</h2>
                    {!isEditMode && (
                        <button className="edit-btn" onClick={handleEdit}>
                            <i className="fa-solid fa-pen"></i>
                            <span>Edit</span>
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                className={`form-input ${fieldErrors.first_name ? 'error' : ''}`}
                                value={formData.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                disabled={!isEditMode}
                            />
                            {fieldErrors.first_name && (
                                <p className="error-text">{fieldErrors.first_name[0]}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                className={`form-input ${fieldErrors.last_name ? 'error' : ''}`}
                                value={formData.last_name}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                disabled={!isEditMode}
                            />
                            {fieldErrors.last_name && (
                                <p className="error-text">{fieldErrors.last_name[0]}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                disabled={!isEditMode}
                                placeholder="email@example.com"
                            />
                            {fieldErrors.email && (
                                <p className="error-text">{fieldErrors.email[0]}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mobile Number</label>
                            <input
                                type="tel"
                                className={`form-input ${fieldErrors.mobile_number ? 'error' : ''}`}
                                value={formData.mobile_number}
                                onChange={(e) => handleChange('mobile_number', e.target.value)}
                                disabled={!isEditMode}
                                placeholder="+263 77 123 4567"
                            />
                            {fieldErrors.mobile_number && (
                                <p className="error-text">{fieldErrors.mobile_number[0]}</p>
                            )}
                        </div>
                    </div>

                    {isEditMode && (
                        <div className="form-actions">
                            <button
                                type="button"
                                className="form-btn cancel"
                                onClick={handleCancel}
                                disabled={updateContact.isPending}
                            >
                                <span>Cancel</span>
                            </button>
                            <button
                                type="submit"
                                className="form-btn submit"
                                disabled={updateContact.isPending}
                            >
                                {updateContact.isPending ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-check"></i>
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            <style jsx>{`
                .tab-content {
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }

                .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .content-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #ffffff;
                    letter-spacing: -0.3px;
                }

                .edit-btn {
                    padding: 8px 16px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .edit-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-input {
                    padding: 12px 14px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .form-input:focus:not(:disabled) {
                    border-color: rgba(16, 185, 129, 0.4);
                    background: rgba(255, 255, 255, 0.05);
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                }

                .form-input:disabled {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.7);
                    cursor: not-allowed;
                }

                .form-input.error {
                    border-color: rgba(239, 68, 68, 0.5);
                    background: rgba(239, 68, 68, 0.05);
                }

                .error-text {
                    font-size: 12px;
                    color: #ef4444;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: -4px;
                }

                .error-text::before {
                    content: '⚠';
                    font-size: 11px;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }

                .form-btn {
                    padding: 11px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid;
                }

                .form-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .form-btn.cancel {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.12);
                    color: rgba(255, 255, 255, 0.8);
                }

                .form-btn.cancel:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: #ffffff;
                }

                .form-btn.submit {
                    background: linear-gradient(135deg, #047857, #10b981);
                    border-color: rgba(16, 185, 129, 0.3);
                    color: white;
                }

                .form-btn.submit:hover:not(:disabled) {
                    background: linear-gradient(135deg, #059669, #34d399);
                    border-color: rgba(16, 185, 129, 0.4);
                }

                @media (max-width: 768px) {
                    .tab-content {
                        padding: 16px;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .form-actions {
                        flex-direction: column-reverse;
                        gap: 10px;
                    }

                    .form-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </>
    );
}