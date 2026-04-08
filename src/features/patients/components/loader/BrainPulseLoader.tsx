'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
    { text: "Optimizing recommendations", icon: "✨", duration: 2000 },
];

export function BrainPulseLoader({ isLoading = true }: BrainPulseLoaderProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    // Guard against SSR — createPortal requires document
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!isLoading) return;
        const timer = setTimeout(
            () => setMessageIndex((prev) => (prev + 1) % AI_MESSAGES.length),
            AI_MESSAGES[messageIndex].duration,
        );
        return () => clearTimeout(timer);
    }, [isLoading, messageIndex]);

    if (!isLoading || !mounted) return null;

    const currentMsg = AI_MESSAGES[messageIndex];

    /*
     * We portal to document.body to escape any ancestor `backdrop-filter`,
     * `transform`, or `filter` CSS that would create a new containing block
     * and trap `position:fixed` descendants to that element's bounds.
     * Inline styles are used so the overlay doesn't depend on any
     * styled-jsx scope class that can be lost across portal boundaries.
     */
    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(10, 31, 26, 0.95)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                animation: 'bpl-fade-in 0.2s ease-out',
            }}
        >
            <style>{`
                @keyframes bpl-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes bpl-slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes bpl-brain-pulse {
                    0%, 100% { transform: scale(1);    opacity: 1; }
                    50%       { transform: scale(1.15); opacity: 0.7; }
                }
                @keyframes bpl-ripple {
                    0%   { width: 80px; height: 80px; opacity: 1; }
                    100% { width: 140px; height: 140px; opacity: 0; }
                }
                @keyframes bpl-msg-slide {
                    from { opacity: 0; transform: translateX(-10px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes bpl-dot-pulse {
                    0%, 60%, 100% { transform: scale(1);   opacity: 0.4; }
                    30%           { transform: scale(1.5); opacity: 1; }
                }
                .bpl-brain-wrap {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bpl-brain-wrap::before {
                    content: '';
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80px; height: 80px;
                    border: 3px solid rgba(16, 185, 129, 0.3);
                    border-radius: 50%;
                    animation: bpl-ripple 2s ease-out infinite;
                }
                .bpl-brain {
                    font-size: 60px;
                    animation: bpl-brain-pulse 2s ease-in-out infinite;
                    position: relative;
                    z-index: 2;
                }
                .bpl-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                    animation: bpl-slide-up 0.3s ease-out;
                }
                .bpl-main-text {
                    font-size: 16px;
                    color: rgba(255,255,255,0.95);
                    font-weight: 600;
                    letter-spacing: -0.2px;
                }
                .bpl-sub-text {
                    font-size: 13px;
                    color: rgba(255,255,255,0.65);
                    display: flex;
                    align-items: baseline;
                    gap: 6px;
                    animation: bpl-msg-slide 0.4s ease-out;
                }
                .bpl-dots { display: inline-flex; gap: 2px; align-items: center; margin-bottom: 2px; }
                .bpl-dot {
                    width: 4px; height: 4px;
                    background: rgba(16, 185, 129, 0.8);
                    border-radius: 50%;
                    animation: bpl-dot-pulse 1.4s ease-in-out infinite;
                }
                .bpl-dot:nth-child(1) { animation-delay: 0s; }
                .bpl-dot:nth-child(2) { animation-delay: 0.2s; }
                .bpl-dot:nth-child(3) { animation-delay: 0.4s; }
            `}</style>

            <div className="bpl-content">
                <div className="bpl-brain-wrap">
                    <div className="bpl-brain">🧠</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div className="bpl-main-text">Generating Recommendations</div>
                    <div className="bpl-sub-text">
                        <span>{currentMsg.icon}</span>
                        <span>{currentMsg.text}</span>
                        <span className="bpl-dots">
                            <span className="bpl-dot" />
                            <span className="bpl-dot" />
                            <span className="bpl-dot" />
                        </span>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
