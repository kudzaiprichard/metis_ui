/**
 * CreatePatientModal Component
 * Modal for creating a new patient (contact information only)
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useCreatePatient } from '../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';

interface CreatePatientModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreatePatientModal({ isOpen, onClose }: CreatePatientModalProps) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile_number: '',
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const createPatient = useCreatePatient();
    const { showToast } = useToast();

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                mobile_number: '',
            });
            setFieldErrors({});
        }
    }, [isOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
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

        // Basic validation
        if (!formData.first_name || !formData.last_name) {
            showToast('Validation Error', 'First name and last name are required', 'error');
            return;
        }

        // Prepare submit data - only include email and mobile if they have values
        const submitData: {
            first_name: string;
            last_name: string;
            email?: string;
            mobile_number?: string;
        } = {
            first_name: formData.first_name,
            last_name: formData.last_name,
        };

        if (formData.email) {
            submitData.email = formData.email;
        }

        if (formData.mobile_number) {
            submitData.mobile_number = formData.mobile_number;
        }

        createPatient.mutate(submitData, {
            onSuccess: (newPatient) => {
                showToast(
                    'Patient Created',
                    `${formData.first_name} ${formData.last_name} has been created successfully`,
                    'success'
                );
                onClose();

                // Optional: Navigate to patient detail page
                // You can pass a callback prop to handle navigation
                // onPatientCreated?.(newPatient.id);
            },
            onError: (error: ApiError) => {
                if (error.hasFieldErrors()) {
                    setFieldErrors(error.fieldErrors || {});
                }
                showToast('Creation Failed', error.getMessage(), 'error');
            },
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="modal-header">
                        <div className="header-content">
                            <h2 className="modal-title">Add New Patient</h2>
                            <p className="modal-subtitle">
                                Create a new patient record. You can add medical data later.
                            </p>
                        </div>
                        <button className="close-btn" onClick={onClose} type="button">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="modal-content">
                            {/* Name Fields - Side by Side */}
                            <div className="name-row">
                                <div className="input-group">
                                    <label className="input-label" htmlFor="first_name">
                                        First Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        className={`input-field ${fieldErrors.first_name ? 'error' : ''}`}
                                        placeholder="John"
                                        value={formData.first_name}
                                        onChange={(e) => handleChange('first_name', e.target.value)}
                                        disabled={createPatient.isPending}
                                        autoComplete="given-name"
                                        required
                                    />
                                    {fieldErrors.first_name && (
                                        <p className="error-text">{fieldErrors.first_name[0]}</p>
                                    )}
                                </div>

                                <div className="input-group">
                                    <label className="input-label" htmlFor="last_name">
                                        Last Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        className={`input-field ${fieldErrors.last_name ? 'error' : ''}`}
                                        placeholder="Moyo"
                                        value={formData.last_name}
                                        onChange={(e) => handleChange('last_name', e.target.value)}
                                        disabled={createPatient.isPending}
                                        autoComplete="family-name"
                                        required
                                    />
                                    {fieldErrors.last_name && (
                                        <p className="error-text">{fieldErrors.last_name[0]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="input-group">
                                <label className="input-label" htmlFor="email">
                                    Email Address <span className="optional">(optional)</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className={`input-field ${fieldErrors.email ? 'error' : ''}`}
                                    placeholder="patient@example.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    disabled={createPatient.isPending}
                                    autoComplete="email"
                                />
                                {fieldErrors.email && (
                                    <p className="error-text">{fieldErrors.email[0]}</p>
                                )}
                            </div>

                            {/* Mobile Number */}
                            <div className="input-group">
                                <label className="input-label" htmlFor="mobile_number">
                                    Mobile Number <span className="optional">(optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    id="mobile_number"
                                    className={`input-field ${fieldErrors.mobile_number ? 'error' : ''}`}
                                    placeholder="+263 77 123 4567"
                                    value={formData.mobile_number}
                                    onChange={(e) => handleChange('mobile_number', e.target.value)}
                                    disabled={createPatient.isPending}
                                    autoComplete="tel"
                                />
                                {fieldErrors.mobile_number && (
                                    <p className="error-text">{fieldErrors.mobile_number[0]}</p>
                                )}
                            </div>

                            {/* Info Message */}
                            <div className="info-box">
                                <i className="fa-solid fa-circle-info"></i>
                                <div>
                                    <p className="info-title">Medical Data</p>
                                    <p className="info-text">
                                        You can add detailed medical information after creating the patient record.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="modal-btn cancel"
                                onClick={onClose}
                                disabled={createPatient.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="modal-btn submit"
                                disabled={createPatient.isPending}
                            >
                                {createPatient.isPending ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-plus"></i>
                                        Create Patient
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
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

                .modal-container {
                    width: 100%;
                    max-width: 480px;
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

                .modal-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    padding: 24px 24px 20px;
                    border-bottom: 1px solid rgba(52, 211, 153, 0.1);
                }

                .header-content {
                    flex: 1;
                }

                .modal-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffffff;
                    letter-spacing: -0.3px;
                    margin-bottom: 4px;
                }

                .modal-subtitle {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 400;
                    line-height: 1.4;
                }

                .close-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 18px;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .modal-content {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .name-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .input-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.7);
                    letter-spacing: 0.2px;
                }

                .required {
                    color: #ef4444;
                    margin-left: 2px;
                }

                .optional {
                    font-size: 11px;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.4);
                    font-style: italic;
                }

                .input-field {
                    width: 100%;
                    padding: 12px 14px;
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(52, 211, 153, 0.15);
                    border-radius: 8px;
                    font-size: 14px;
                    color: #ffffff !important;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                    outline: none;
                    font-family: inherit;
                }

                .input-field::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .input-field:focus {
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                }

                .input-field:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .input-field.error {
                    border-color: #ef4444;
                    background: rgba(239, 68, 68, 0.05) !important;
                }

                .input-field.error:focus {
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }

                /* Force autofill styles */
                .input-field:-webkit-autofill,
                .input-field:-webkit-autofill:hover,
                .input-field:-webkit-autofill:focus,
                .input-field:-webkit-autofill:active {
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: #ffffff !important;
                    transition: background-color 5000s ease-in-out 0s;
                    box-shadow: inset 0 0 20px 20px rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(52, 211, 153, 0.15) !important;
                }

                .error-text {
                    font-size: 11px;
                    color: #ef4444;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .error-text::before {
                    content: '⚠';
                    font-size: 12px;
                }

                .info-box {
                    display: flex;
                    gap: 12px;
                    padding: 14px 16px;
                    border-radius: 10px;
                    background: rgba(52, 211, 153, 0.08);
                    border: 1px solid rgba(52, 211, 153, 0.2);
                }

                .info-box i {
                    font-size: 18px;
                    color: #34d399;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .info-title {
                    font-size: 13px;
                    font-weight: 500;
                    color: #ffffff;
                    margin-bottom: 4px;
                }

                .info-text {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    line-height: 1.5;
                }

                .modal-actions {
                    display: flex;
                    gap: 10px;
                    padding: 20px 24px 24px;
                    border-top: 1px solid rgba(52, 211, 153, 0.1);
                }

                .modal-btn {
                    flex: 1;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: 1px solid;
                }

                .modal-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .modal-btn.cancel {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                    color: rgba(255, 255, 255, 0.7);
                }

                .modal-btn.cancel:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: #ffffff;
                }

                .modal-btn.submit {
                    background: linear-gradient(135deg, #047857, #10b981);
                    border-color: transparent;
                    color: white;
                }

                .modal-btn.submit:hover:not(:disabled) {
                    background: linear-gradient(135deg, #059669, #34d399);
                }

                .modal-btn:active:not(:disabled) {
                    transform: scale(0.98);
                }

                @media (max-width: 640px) {
                    .modal-container {
                        max-width: 100%;
                    }

                    .name-row {
                        grid-template-columns: 1fr;
                    }

                    .modal-actions {
                        flex-direction: column-reverse;
                    }
                }
            `}</style>
        </>
    );
}