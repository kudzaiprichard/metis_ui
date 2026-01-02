'use client';

import { useAuth } from "@/src/features/auth/hooks/useAuth";

export default function DoctorDashboardPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    // Middleware guarantees authentication, so this is just a safety check
    // while the user data is being fetched from React Query
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-white text-xl">Loading user data...</div>
            </div>
        );
    }

    return (
        <>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user.first_name}!</p>
                </div>
            </div>

            {/* User Info Card */}
            <div className="dashboard-card">
                <div className="card-header">
                    <div className="user-avatar-large">
                        <span className="avatar-initials">
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                        </span>
                    </div>
                    <div className="user-details">
                        <h2 className="user-full-name">
                            {user.first_name} {user.last_name}
                        </h2>
                        <p className="user-email">{user.email}</p>
                    </div>
                </div>

                {/* User Details Grid */}
                <div className="details-grid">
                    <div className="detail-item">
                        <p className="detail-label">User ID</p>
                        <p className="detail-value mono">{user.id}</p>
                    </div>

                    <div className="detail-item">
                        <p className="detail-label">Role</p>
                        <span className="role-badge">
                            {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>

                    <div className="detail-item">
                        <p className="detail-label">Created At</p>
                        <p className="detail-value">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="detail-item">
                        <p className="detail-label">Last Updated</p>
                        <p className="detail-value">
                            {new Date(user.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Raw JSON (for debugging) */}
            <div className="debug-card">
                <h3 className="debug-title">Raw User Data (Debug)</h3>
                <pre className="debug-content">
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>

            <style jsx>{`
                .page-header {
                    margin-bottom: 30px;
                }

                .page-title {
                    font-size: 28px;
                    font-weight: 600;
                    color: #ffffff;
                }

                .page-subtitle {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    margin-top: 4px;
                }

                .dashboard-card {
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(24px);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    padding: 32px;
                    box-shadow: 
                        0 20px 60px rgba(0, 0, 0, 0.5),
                        0 8px 16px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    margin-bottom: 24px;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 32px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .user-avatar-large {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #047857 0%, #10b981 100%);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .avatar-initials {
                    font-size: 28px;
                    font-weight: 700;
                    color: white;
                }

                .user-details {
                    flex: 1;
                }

                .user-full-name {
                    font-size: 24px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 4px;
                }

                .user-email {
                    font-size: 14px;
                    color: #34d399;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 24px;
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .detail-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .detail-value {
                    font-size: 14px;
                    color: #ffffff;
                    font-weight: 500;
                }

                .detail-value.mono {
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                }

                .role-badge {
                    display: inline-block;
                    padding: 6px 12px;
                    background: rgba(52, 211, 153, 0.2);
                    border: 1px solid rgba(52, 211, 153, 0.3);
                    border-radius: 8px;
                    color: #34d399;
                    font-size: 12px;
                    font-weight: 600;
                }

                .debug-card {
                    background: rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(24px);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 24px;
                    margin-bottom: 100px;
                }

                .debug-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.7);
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .debug-content {
                    font-size: 12px;
                    color: #34d399;
                    overflow: auto;
                    font-family: 'Courier New', monospace;
                    line-height: 1.6;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .dashboard-card {
                        padding: 24px;
                    }

                    .card-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .user-avatar-large {
                        width: 64px;
                        height: 64px;
                    }

                    .avatar-initials {
                        font-size: 24px;
                    }

                    .user-full-name {
                        font-size: 20px;
                    }

                    .details-grid {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                }
            `}</style>
        </>
    );
}