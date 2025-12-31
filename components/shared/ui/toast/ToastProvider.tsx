/**
 * Toast Provider
 * Global toast notification provider
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ToastContainer } from './ToastContainer';
import { ToastMessage, ToastType } from './types';

interface ToastContextType {
    showToast: (title: string, message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (title: string, message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        const newToast: ToastMessage = { id, title, message, type };

        setToasts((prev) => [...prev, newToast]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}