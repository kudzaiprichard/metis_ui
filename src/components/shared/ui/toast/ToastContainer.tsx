/**
 * Toast Container
 * Renders all active toasts
 */

'use client';

import { Toast } from './Toast';
import { ToastMessage } from './types';

interface ToastContainerProps {
    toasts: ToastMessage[];
    onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
    return (
        <div className="fixed top-6 right-6 z-[1000] flex flex-col gap-3">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
}