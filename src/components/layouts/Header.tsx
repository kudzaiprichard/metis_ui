'use client';

import { useRouter } from 'next/navigation';
import { useLogout } from '@/src/features/auth/hooks/useAuth';
import { useToast } from '@/src/components/shared/ui/toast';

interface HeaderProps {
    userName: string;
    userRole: string;
    userInitials: string;
}

export function Header({ userName, userRole, userInitials }: HeaderProps) {
    const router = useRouter();
    const logout = useLogout();
    const { showToast } = useToast();

    const handleLogout = () => {
        logout.mutate(undefined, {
            onSuccess: () => {
                showToast('Logged Out', 'You have been successfully logged out', 'success');
                router.push('/login');
            },
            onError: () => {
                showToast('Logout Failed', 'An error occurred during logout', 'error');
            }
        });
    };

    return (
        <>
            <div className="top-header">
                <div className="user-profile">
                    <div className="user-avatar">{userInitials}</div>
                    <div className="user-info">
                        <div className="user-name">{userName}</div>
                        <div className="user-role">{userRole}</div>
                    </div>
                </div>
                <div className="logout-container">
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        disabled={logout.isPending}
                        title="Logout"
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                    <div className="logout-label">Logout</div>
                </div>
            </div>

            <style jsx>{`
                .top-header {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    width: 56px;
                }

                .user-profile {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow:
                            0 20px 60px rgba(0, 0, 0, 0.5),
                            0 8px 16px rgba(0, 0, 0, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    position: relative;
                }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #047857 0%, #10b981 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                }

                .user-info {
                    position: absolute;
                    right: 70px;
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(24px);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow:
                            0 20px 60px rgba(0, 0, 0, 0.5),
                            0 8px 16px rgba(0, 0, 0, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                .user-info::before {
                    content: '';
                    position: absolute;
                    left: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    border: 6px solid transparent;
                    border-left-color: rgba(255, 255, 255, 0.08);
                }

                .user-profile:hover .user-info {
                    opacity: 1;
                    right: 80px;
                }

                .user-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 2px;
                }

                .user-role {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.6);
                }

                .logout-container {
                    position: relative;
                }

                .logout-btn {
                    width: 100%;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow:
                            0 20px 60px rgba(0, 0, 0, 0.5),
                            0 8px 16px rgba(0, 0, 0, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: all 0.25s ease;
                    color: rgba(255, 255, 255, 0.7);
                }

                .logout-btn:hover:not(:disabled) {
                    color: #ef4444;
                }

                .logout-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .logout-label {
                    position: absolute;
                    right: 65px;
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 6px 12px;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(24px);
                    border-radius: 6px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 
                        0 8px 24px rgba(0, 0, 0, 0.4),
                        0 4px 8px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 12px;
                    font-weight: 500;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.25s ease;
                    letter-spacing: 0.2px;
                }

                .logout-label::before {
                    content: '';
                    position: absolute;
                    left: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    border: 5px solid transparent;
                    border-left-color: rgba(255, 255, 255, 0.08);
                }

                .logout-container:hover .logout-label {
                    opacity: 1;
                    right: 72px;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .top-header {
                        top: 10px;
                        right: 10px;
                        width: 48px;
                    }

                    .user-avatar {
                        width: 32px;
                        height: 32px;
                        font-size: 12px;
                    }

                    .logout-btn {
                        height: 32px;
                        font-size: 14px;
                    }
                }
            `}</style>
        </>
    );
}