// File: src/components/shared/ui/page-loader/PageLoader.tsx
/**
 * PageLoader Component
 * Full-page or inline loading overlay with triple ring gradient spinner
 */

'use client';

import React from 'react';

interface PageLoaderProps {
    isLoading: boolean;
    fullPage?: boolean;
    size?: 'small' | 'medium' | 'large';
    loadingText?: string;
    subText?: string;
    showText?: boolean;
}

export function PageLoader({
                               isLoading,
                               fullPage = true,
                               size = 'medium',
                               loadingText = 'Loading...',
                               subText = 'Please wait while we fetch your data',
                               showText = true
                           }: PageLoaderProps) {
    if (!isLoading) return null;

    const sizes = {
        small: 60,
        medium: 100,
        large: 140
    };

    const loaderSize = sizes[size];

    return (
        <>
            <div className={`page-loader ${fullPage ? 'full-page' : 'inline'}`}>
                <div className="loader-container">
                    <div className="triple-ring-loader">
                        <div className="gradient-ring"></div>
                        <div className="middle-ring"></div>
                        <div className="outer-ring"></div>
                    </div>

                    {showText && (
                        <div className="loader-texts">
                            <div className="loader-text">{loadingText}</div>
                            {subText && <div className="loader-subtext">{subText}</div>}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .page-loader {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    background: transparent;
                }

                .page-loader.full-page {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }

                .page-loader.inline {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%;
                    min-height: 400px;
                }

                .loader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                }

                .triple-ring-loader {
                    width: ${loaderSize}px;
                    height: ${loaderSize}px;
                    position: relative;
                }

                /* Inner gradient ring */
                .gradient-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: conic-gradient(
                            from 0deg,
                            transparent 0deg,
                            #10b981 360deg
                    );
                    animation: spin 1.2s linear infinite;
                }

                .gradient-ring::before {
                    content: '';
                    position: absolute;
                    inset: 4px;
                    background: transparent;
                    border-radius: 50%;
                }

                /* Middle ring - emerald */
                .middle-ring {
                    position: absolute;
                    width: 120%;
                    height: 120%;
                    top: -10%;
                    left: -10%;
                    border: 3px solid transparent;
                    border-top-color: #34d399;
                    border-right-color: #34d399;
                    border-radius: 50%;
                    animation: spin 1.8s linear infinite;
                }

                /* Outer ring - light emerald */
                .outer-ring {
                    position: absolute;
                    width: 140%;
                    height: 140%;
                    top: -20%;
                    left: -20%;
                    border: 3px solid transparent;
                    border-bottom-color: #6ee7b7;
                    border-left-color: #6ee7b7;
                    border-radius: 50%;
                    animation: spin 2.4s linear infinite;
                    animation-direction: reverse;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loader-texts {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .loader-text {
                    font-size: 18px;
                    color: #ffffff;
                    font-weight: 600;
                    letter-spacing: -0.3px;
                    text-align: center;
                }

                .loader-subtext {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 400;
                    text-align: center;
                    max-width: 300px;
                }

                @media (max-width: 768px) {
                    .loader-text {
                        font-size: 16px;
                    }

                    .loader-subtext {
                        font-size: 13px;
                    }
                }
            `}</style>
        </>
    );
}