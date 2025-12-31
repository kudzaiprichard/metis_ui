'use client';

import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <>
            <div className="unauthorized-container">
                <div className="unauthorized-card-wrapper">
                    <div className="unauthorized-card">
                        <div className="unauthorized-content">
                            {/* Icon */}
                            <div className="icon-container">
                                <svg
                                    className="icon-svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>

                            {/* Title */}
                            <h1 className="title">Access Denied</h1>

                            {/* Description */}
                            <p className="description">
                                You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
                            </p>

                            {/* Button */}
                            <button onClick={() => router.back()} className="back-button">
                                <svg
                                    className="back-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="19" y1="12" x2="5" y2="12"></line>
                                    <polyline points="12 19 5 12 12 5"></polyline>
                                </svg>
                                Go Back
                            </button>

                            {/* Error Code */}
                            <p className="error-code">Error Code: 403 - Forbidden</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .unauthorized-container {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: fixed;
                    top: 0;
                    left: 0;
                }

                .unauthorized-card-wrapper {
                    width: 100%;
                    max-width: 26rem;
                }

                .unauthorized-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(16px);
                    border-radius: 0.75rem;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                }

                .unauthorized-content {
                    padding: 1.75rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 1.25rem;
                }

                .icon-container {
                    width: 4rem;
                    height: 4rem;
                    background: rgba(220, 38, 38, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .icon-svg {
                    width: 2rem;
                    height: 2rem;
                }

                .title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: white;
                    margin: 0;
                }

                .description {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9rem;
                    line-height: 1.5;
                    max-width: 22rem;
                    margin: 0;
                }

                .back-button {
                    width: 100%;
                    padding: 0.75rem 1.5rem;
                    background: #059669;
                    color: #ffffff;
                    font-weight: 600;
                    font-size: 0.95rem;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: background-color 0.15s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .back-button:hover {
                    background: #047857;
                }

                .back-button:active {
                    background: #065f46;
                }

                .back-icon {
                    width: 1.25rem;
                    height: 1.25rem;
                    flex-shrink: 0;
                }

                .error-code {
                    font-size: 0.8rem;
                    color: rgba(255, 255, 255, 0.4);
                    margin: 0;
                }

                @media (max-width: 640px) {
                    .unauthorized-content {
                        padding: 1.5rem;
                        gap: 1rem;
                    }

                    .title {
                        font-size: 1.5rem;
                    }

                    .description {
                        font-size: 0.85rem;
                    }

                    .icon-container {
                        width: 3.5rem;
                        height: 3.5rem;
                    }

                    .icon-svg {
                        width: 1.75rem;
                        height: 1.75rem;
                    }

                    .back-button {
                        font-size: 0.9rem;
                        padding: 0.7rem 1.25rem;
                    }
                }
            `}</style>
        </>
    );
}