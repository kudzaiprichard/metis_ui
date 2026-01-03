/**
 * UserModal Component
 * Modal for creating or updating users
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { User } from '../api/users.types';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { USER_ROLES, UserRole } from '@/src/lib/constants';
import { UpdateUserRequest } from '../api/users.types';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
}

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
    const isEditMode = !!user;

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: USER_ROLES.DOCTOR as UserRole,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const { showToast } = useToast();

    // Initialize form with user data in edit mode
    useEffect(() => {
        if (!isOpen) {
            // Reset form when modal closes
            setFormData({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                role: USER_ROLES.DOCTOR,
            });
            setFieldErrors({});
            setShowPassword(false);
        } else if (isEditMode && user) {
            // Load user data for editing
            setFormData({
                email: user.email,
                password: '',
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role.toUpperCase() as UserRole,
            });
        }
    }, [isOpen, isEditMode, user]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // Validation
        if (!isEditMode && !formData.email) {
            showToast('Validation Error', 'Email is required', 'error');
            return;
        }

        if (!isEditMode && !formData.password) {
            showToast('Validation Error', 'Password is required', 'error');
            return;
        }

        if (!formData.first_name || !formData.last_name) {
            showToast('Validation Error', 'First name and last name are required', 'error');
            return;
        }

        if (isEditMode && user) {
            // Update user
            const updateData: UpdateUserRequest = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                role: formData.role,
            };

            // Only include password if it's been filled
            if (formData.password) {
                updateData.password = formData.password;
            }

            updateUser.mutate(
                { userId: user.id, data: updateData },
                {
                    onSuccess: () => {
                        showToast(
                            'User Updated',
                            `${formData.first_name} ${formData.last_name} has been updated successfully`,
                            'success'
                        );
                        onClose();
                    },
                    onError: (error: ApiError) => {
                        if (error.hasFieldErrors()) {
                            setFieldErrors(error.fieldErrors || {});
                        }
                        showToast('Update Failed', error.getMessage(), 'error');
                    },
                }
            );
        } else {
            // Create user
            createUser.mutate(formData, {
                onSuccess: () => {
                    showToast(
                        'User Created',
                        `${formData.first_name} ${formData.last_name} has been created successfully`,
                        'success'
                    );
                    onClose();
                },
                onError: (error: ApiError) => {
                    if (error.hasFieldErrors()) {
                        setFieldErrors(error.fieldErrors || {});
                    }
                    showToast('Creation Failed', error.getMessage(), 'error');
                },
            });
        }
    };

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

    const isPending = createUser.isPending || updateUser.isPending;

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="modal-header">
                        <div className="header-content">
                            <h2 className="modal-title">
                                {isEditMode ? 'Edit User' : 'Add New User'}
                            </h2>
                            <p className="modal-subtitle">
                                {isEditMode
                                    ? 'Update user information and role'
                                    : 'Create a new user account for the system'}
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
                                        disabled={isPending}
                                        autoComplete="given-name"
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
                                        placeholder="Smith"
                                        value={formData.last_name}
                                        onChange={(e) => handleChange('last_name', e.target.value)}
                                        disabled={isPending}
                                        autoComplete="family-name"
                                    />
                                    {fieldErrors.last_name && (
                                        <p className="error-text">{fieldErrors.last_name[0]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="input-group">
                                <label className="input-label" htmlFor="email">
                                    Email Address <span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className={`input-field ${fieldErrors.email ? 'error' : ''}`}
                                    placeholder="user@hospital.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    disabled={isPending}
                                    autoComplete="email"
                                />
                                {fieldErrors.email && (
                                    <p className="error-text">{fieldErrors.email[0]}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label className="input-label" htmlFor="password">
                                    Password {isEditMode && <span className="optional">(optional)</span>}
                                    {!isEditMode && <span className="required">*</span>}
                                </label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        className={`input-field ${fieldErrors.password ? 'error' : ''}`}
                                        placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        disabled={isPending}
                                        autoComplete={isEditMode ? 'new-password' : 'new-password'}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {fieldErrors.password && (
                                    <p className="error-text">{fieldErrors.password[0]}</p>
                                )}
                            </div>

                            {/* Role */}
                            <div className="input-group">
                                <label className="input-label" htmlFor="role">
                                    Role <span className="required">*</span>
                                </label>
                                <div className="role-selector">
                                    <label className={`role-option ${formData.role === USER_ROLES.DOCTOR ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value={USER_ROLES.DOCTOR}
                                            checked={formData.role === USER_ROLES.DOCTOR}
                                            onChange={(e) => handleChange('role', e.target.value)}
                                            disabled={isPending}
                                        />
                                        <div className="role-content">
                                            <i className="fa-solid fa-user-doctor"></i>
                                            <span>Doctor</span>
                                        </div>
                                    </label>
                                    <label className={`role-option ${formData.role === USER_ROLES.ML_ENGINEER ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value={USER_ROLES.ML_ENGINEER}
                                            checked={formData.role === USER_ROLES.ML_ENGINEER}
                                            onChange={(e) => handleChange('role', e.target.value)}
                                            disabled={isPending}
                                        />
                                        <div className="role-content">
                                            <i className="fa-solid fa-brain"></i>
                                            <span>ML Engineer</span>
                                        </div>
                                    </label>
                                </div>
                                {fieldErrors.role && (
                                    <p className="error-text">{fieldErrors.role[0]}</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="modal-btn cancel"
                                onClick={onClose}
                                disabled={isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="modal-btn submit"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <i className={`fa-solid ${isEditMode ? 'fa-check' : 'fa-plus'}`}></i>
                                        {isEditMode ? 'Update User' : 'Create User'}
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

                .password-wrapper {
                    position: relative;
                }

                .password-toggle {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    padding: 8px;
                    font-size: 14px;
                    transition: color 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .password-toggle:hover {
                    color: rgba(255, 255, 255, 0.7);
                }

                .role-selector {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .role-option {
                    position: relative;
                    cursor: pointer;
                }

                .role-option input[type="radio"] {
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                }

                .role-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 16px 12px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1.5px solid rgba(52, 211, 153, 0.15);
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }

                .role-content i {
                    font-size: 22px;
                    color: rgba(255, 255, 255, 0.5);
                    transition: all 0.2s ease;
                }

                .role-content span {
                    font-size: 13px;
                    font-weight: 500;
                    color: rgba(255, 255, 255, 0.6);
                    transition: all 0.2s ease;
                }

                .role-option:hover .role-content {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(52, 211, 153, 0.3);
                }

                .role-option.selected .role-content {
                    background: rgba(16, 185, 129, 0.12);
                    border-color: #10b981;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
                }

                .role-option.selected .role-content i {
                    color: #10b981;
                }

                .role-option.selected .role-content span {
                    color: #ffffff;
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

                    .role-selector {
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