/**
 * DeleteUserDialog Component
 * Confirmation dialog for delete/restore actions
 */

'use client';

import { User } from '../api/users.types';
import { useDeleteUser, useRestoreUser } from '../hooks/useUsers';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';

interface DeleteUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    action: 'delete' | 'restore';
    currentUserId?: string;
}

export function DeleteUserDialog({ isOpen, onClose, user, action, currentUserId }: DeleteUserDialogProps) {
    const deleteUser = useDeleteUser();
    const restoreUser = useRestoreUser();
    const { showToast } = useToast();

    if (!isOpen || !user) return null;

    const isDelete = action === 'delete';
    const isSelf = currentUserId === user.id;

    const handleConfirm = () => {
        if (isSelf && isDelete) {
            showToast('Cannot Delete', 'You cannot delete your own account', 'error');
            return;
        }

        const mutation = isDelete ? deleteUser : restoreUser;

        mutation.mutate(user.id, {
            onSuccess: () => {
                showToast(
                    isDelete ? 'User Deleted' : 'User Restored',
                    `${user.first_name} ${user.last_name} has been ${isDelete ? 'deleted' : 'restored'} successfully`,
                    'success'
                );
                onClose();
            },
            onError: (error: ApiError) => {
                showToast(
                    isDelete ? 'Delete Failed' : 'Restore Failed',
                    error.getMessage(),
                    'error'
                );
            },
        });
    };

    const isPending = deleteUser.isPending || restoreUser.isPending;

    return (
        <>
            <div className="dialog-overlay" onClick={onClose}>
                <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="dialog-header">
                        <div className="header-content">
                            <h2 className="dialog-title">
                                {isDelete ? 'Delete User?' : 'Restore User?'}
                            </h2>
                            <p className="dialog-subtitle">
                                {isDelete ? 'This action can be reversed later' : 'Reactivate this user account'}
                            </p>
                        </div>
                        <button className="close-btn" onClick={onClose} type="button">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="dialog-content">
                        {isSelf && isDelete ? (
                            <div className="message-box error">
                                <i className="fa-solid fa-circle-exclamation"></i>
                                <div>
                                    <p className="message-title">Cannot delete your own account</p>
                                    <p className="message-text">Please ask another administrator to perform this action if needed.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={`message-box ${isDelete ? 'warning' : 'info'}`}>
                                    <i className={`fa-solid ${isDelete ? 'fa-trash-can' : 'fa-rotate-left'}`}></i>
                                    <div>
                                        <p className="message-title">
                                            {isDelete ? 'Delete' : 'Restore'} <strong>{user.first_name} {user.last_name}</strong>
                                        </p>
                                        <p className="message-text">
                                            {isDelete
                                                ? 'This user will be deactivated and can be restored later from the archive.'
                                                : 'This user will be reactivated and can access the system again.'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="dialog-actions">
                        <button
                            className="dialog-btn cancel"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                        {!(isSelf && isDelete) && (
                            <button
                                className={`dialog-btn confirm ${isDelete ? 'delete' : 'restore'}`}
                                onClick={handleConfirm}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        {isDelete ? 'Deleting...' : 'Restoring...'}
                                    </>
                                ) : (
                                    <>
                                        {isDelete ? 'Delete User' : 'Restore User'}
                                    </>
                                )}
                            </button>
                        )}
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

                .message-box.info {
                    background: rgba(52, 211, 153, 0.08);
                    border-color: rgba(52, 211, 153, 0.2);
                }

                .message-box.info i {
                    color: #34d399;
                }

                .message-box.error {
                    background: rgba(239, 68, 68, 0.08);
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .message-box.error i {
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
                    color: #10b981;
                }

                .message-box.warning .message-title strong {
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

                .dialog-btn.confirm.restore {
                    background: linear-gradient(135deg, #047857, #10b981);
                    border-color: transparent;
                    color: white;
                }

                .dialog-btn.confirm.restore:hover:not(:disabled) {
                    background: linear-gradient(135deg, #059669, #34d399);
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