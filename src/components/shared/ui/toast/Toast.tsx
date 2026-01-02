/**
 * Toast Component
 * Medical-themed notification (system)
 */

'use client';

import { useEffect, useState } from 'react';
import { ToastMessage } from './types';

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose(toast.id);
        }, 300);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [handleClose]);

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                );
            case 'error':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                );
            case 'info':
            default:
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                );
        }
    };

    const getIconBackground = () => {
        switch (toast.type) {
            case 'success':
                return { background: 'rgba(16, 185, 129, 0.3)' };
            case 'error':
                return { background: 'rgba(239, 68, 68, 0.3)' };
            case 'info':
            default:
                return { background: 'rgba(4, 120, 87, 0.3)' };
        }
    };

    return (
        <>
            <div
                className={`toast ${toast.type} ${isClosing ? 'hide' : ''}`}
            >
                <div className="toast-icon" style={getIconBackground()}>
                    {getIcon()}
                </div>
                <div className="toast-content">
                    <div className="toast-title">{toast.title}</div>
                    <div className="toast-message">{toast.message}</div>
                </div>
                <button className="toast-close" onClick={handleClose}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <style jsx>{`
                .toast {
                    width: 380px;
                    max-width: 380px;
                    min-height: 64px;
                    padding: 16px 20px;
                    background: rgba(10, 31, 26, 0.95);
                    backdrop-filter: blur(24px);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow:
                            0 20px 60px rgba(0, 0, 0, 0.5),
                            0 8px 16px rgba(0, 0, 0, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    opacity: 0;
                    transform: translateX(400px);
                    animation: slideIn 0.3s ease forwards;
                }

                .toast.hide {
                    animation: slideOut 0.3s ease forwards;
                }

                @keyframes slideIn {
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideOut {
                    to {
                        opacity: 0;
                        transform: translateX(400px);
                    }
                }

                .toast-icon {
                    width: 24px;
                    height: 24px;
                    min-width: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .toast-content {
                    flex: 1;
                    min-width: 0;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                .toast-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 4px;
                    word-wrap: break-word;
                }

                .toast-message {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.5;
                    word-wrap: break-word;
                    white-space: pre-wrap;
                }

                .toast-close {
                    width: 20px;
                    height: 20px;
                    min-width: 20px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .toast-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.8);
                }
            `}</style>
        </>
    );
}