/**
 * BrainPulseLoader Component
 * Full-screen AI-themed loading animation with brain icon and ripple effect
 */

'use client';

import { useState, useEffect } from 'react';

interface BrainPulseLoaderProps {
    isLoading?: boolean;
}

interface LoadingMessage {
    text: string;
    icon: string;
    duration: number;
}

const AI_MESSAGES: LoadingMessage[] = [
    { text: "Preprocessing data", icon: "⚙️", duration: 1500 },
    { text: "Processing medical features", icon: "📊", duration: 2000 },
    { text: "Analyzing patient history", icon: "🔬", duration: 2500 },
    { text: "Running AI model", icon: "🤖", duration: 3000 },
    { text: "Calculating Q-values", icon: "📈", duration: 2000 },
    { text: "Evaluating treatment options", icon: "💊", duration: 2500 },
    { text: "Computing SHAP values", icon: "🧮", duration: 2000 },
    { text: "Preparing explanations", icon: "📝", duration: 1500 },
    { text: "Optimizing recommendations", icon: "✨", duration: 2000 }
];

export function BrainPulseLoader({ isLoading = true }: BrainPulseLoaderProps) {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        if (!isLoading) return;

        const timer = setTimeout(() => {
            setMessageIndex((prev) => (prev + 1) % AI_MESSAGES.length);
        }, AI_MESSAGES[messageIndex].duration);

        return () => clearTimeout(timer);
    }, [isLoading, messageIndex]);

    if (!isLoading) return null;

    const currentMsg = AI_MESSAGES[messageIndex];

    return (
        <>
            <div className="loader-overlay">
                <div className="loader-content">
                    <div className="brain-container">
                        <div className="brain-emoji">🧠</div>
                    </div>

                    <div className="text-container">
                        <div className="main-text">Generating Recommendations</div>
                        <div className="sub-text">
                            <span className="msg-icon">{currentMsg.icon}</span>
                            <span className="msg-text">{currentMsg.text}</span>
                            <span className="dots">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .loader-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(10, 31, 26, 0.95);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    animation: fadeIn 0.2s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .loader-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .brain-container {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .brain-emoji {
                    font-size: 60px;
                    animation: brainPulse 2s ease-in-out infinite;
                    z-index: 2;
                    position: relative;
                }

                @keyframes brainPulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% { 
                        transform: scale(1.15);
                        opacity: 0.7;
                    }
                }

                .brain-container::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100px;
                    height: 100px;
                    border: 3px solid rgba(16, 185, 129, 0.3);
                    border-radius: 50%;
                    animation: ripple 2s ease-out infinite;
                    z-index: 1;
                }

                @keyframes ripple {
                    0% {
                        width: 80px;
                        height: 80px;
                        opacity: 1;
                    }
                    100% {
                        width: 140px;
                        height: 140px;
                        opacity: 0;
                    }
                }

                .text-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .main-text {
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.95);
                    font-weight: 600;
                    letter-spacing: -0.2px;
                }

                .sub-text {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.65);
                    font-weight: 400;
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                    animation: slideIn 0.4s ease-out;
                }

                @keyframes slideIn {
                    0% {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .msg-icon {
                    font-size: 12px;
                    line-height: 1;
                    display: inline-block;
                    animation: iconPulse 2s ease-in-out infinite;
                }

                @keyframes iconPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .msg-text {
                    line-height: 1;
                }

                .dots {
                    display: inline-flex;
                    gap: 2px;
                    align-items: center;
                    margin-bottom: 2px;
                }

                .dot {
                    width: 4px;
                    height: 4px;
                    background: rgba(16, 185, 129, 0.8);
                    border-radius: 50%;
                    animation: dotPulse 1.4s ease-in-out infinite;
                }

                .dot:nth-child(1) { animation-delay: 0s; }
                .dot:nth-child(2) { animation-delay: 0.2s; }
                .dot:nth-child(3) { animation-delay: 0.4s; }

                @keyframes dotPulse {
                    0%, 60%, 100% {
                        transform: scale(1);
                        opacity: 0.4;
                    }
                    30% {
                        transform: scale(1.5);
                        opacity: 1;
                    }
                }

                @media (max-width: 768px) {
                    .brain-container {
                        width: 60px;
                        height: 60px;
                    }

                    .brain-emoji {
                        font-size: 48px;
                    }

                    .main-text {
                        font-size: 14px;
                    }

                    .sub-text {
                        font-size: 12px;
                    }

                    .msg-icon {
                        font-size: 11px;
                    }
                }
            `}</style>
        </>
    );
}