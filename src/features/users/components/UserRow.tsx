/**
 * UserRow Component
 * Individual table row for displaying user data
 */

'use client';

import { User } from '../api/users.types';
import { USER_ROLES } from '@/src/lib/constants';

interface UserRowProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

export function UserRow({ user, onEdit, onDelete }: UserRowProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRoleDisplay = (role: string) => {
        const normalizedRole = role.toUpperCase();
        return normalizedRole === 'ML_ENGINEER' ? 'ML Engineer' : 'Doctor';
    };

    const getRoleClass = (role: string) => {
        const normalizedRole = role.toUpperCase();
        return normalizedRole === 'ML_ENGINEER' ? 'ml_engineer' : 'doctor';
    };

    return (
        <>
            <div className="table-row">
                <div className="table-cell user-cell">
                    <div className="user-avatar-small">
                        <span className="avatar-initials-small">
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                        </span>
                    </div>
                    <div className="user-info">
                        <p className="user-name">{user.first_name} {user.last_name}</p>
                    </div>
                </div>
                <div className="table-cell">
                    <p className="user-email">{user.email}</p>
                </div>
                <div className="table-cell">
                    <span className={`role-badge ${getRoleClass(user.role)}`}>
                        {getRoleDisplay(user.role)}
                    </span>
                </div>
                <div className="table-cell">
                    <span className="status-badge active">
                        <span className="status-dot"></span>
                        Active
                    </span>
                </div>
                <div className="table-cell">
                    <p className="date-text">{formatDate(user.created_at)}</p>
                </div>
                <div className="table-cell actions-cell">
                    <button
                        className="action-btn edit"
                        title="Edit user"
                        onClick={() => onEdit(user)}
                    >
                        <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                        className="action-btn delete"
                        title="Delete user"
                        onClick={() => onDelete(user)}
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .table-row {
                    display: grid;
                    grid-template-columns: 2fr 2fr 1.5fr 1fr 1.5fr 1fr;
                    gap: 16px;
                    padding: 18px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
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

                .user-cell {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .user-avatar-small {
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
                }

                .table-row:hover .user-avatar-small {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .avatar-initials-small {
                    font-size: 14px;
                    font-weight: 600;
                    color: white;
                    letter-spacing: 0.5px;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                }

                .user-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #ffffff;
                    letter-spacing: -0.1px;
                }

                .user-email {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 400;
                }

                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 6px 14px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    letter-spacing: 0.3px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .role-badge.doctor {
                    background: rgba(167, 139, 250, 0.12);
                    color: #a78bfa;
                    border: 1px solid rgba(167, 139, 250, 0.2);
                }

                .table-row:hover .role-badge.doctor {
                    background: rgba(167, 139, 250, 0.18);
                    border-color: rgba(167, 139, 250, 0.3);
                }

                .role-badge.ml_engineer {
                    background: rgba(244, 114, 182, 0.12);
                    color: #f472b6;
                    border: 1px solid rgba(244, 114, 182, 0.2);
                }

                .table-row:hover .role-badge.ml_engineer {
                    background: rgba(244, 114, 182, 0.18);
                    border-color: rgba(244, 114, 182, 0.3);
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: capitalize;
                    letter-spacing: 0.3px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .status-badge.active {
                    background: rgba(52, 211, 153, 0.12);
                    color: #34d399;
                    border: 1px solid rgba(52, 211, 153, 0.2);
                }

                .status-badge.active .status-dot {
                    background: #34d399;
                    box-shadow: 0 0 8px rgba(52, 211, 153, 0.6);
                }

                .table-row:hover .status-badge.active {
                    background: rgba(52, 211, 153, 0.18);
                    border-color: rgba(52, 211, 153, 0.3);
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

                .action-btn.edit:hover {
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

                @media (max-width: 1024px) {
                    .table-row {
                        grid-template-columns: 1.5fr 1.5fr 1fr 0.8fr 1fr 0.8fr;
                    }
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

                    .user-cell {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .actions-cell {
                        justify-content: flex-start;
                    }
                }
            `}</style>
        </>
    );
}