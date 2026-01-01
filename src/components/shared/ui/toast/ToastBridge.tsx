'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from './ToastProvider';
import { dequeueToast } from '@/src/lib/utils/toast-bridge';

/**
 * Toast Bridge Component
 * Automatically checks for queued toasts on every page navigation
 *
 * Place this component in your root layout for global coverage
 */
export function ToastBridge() {
    const { showToast } = useToast();
    const pathname = usePathname();
    const lastPathname = useRef<string | null>(null);

    useEffect(() => {
        // Only check for toast if pathname actually changed
        // This prevents duplicate toasts on re-renders
        if (pathname !== lastPathname.current) {
            lastPathname.current = pathname;

            // Check for queued toast
            const queuedToast = dequeueToast();

            if (queuedToast) {
                // Small delay to ensure page is fully mounted
                setTimeout(() => {
                    showToast(queuedToast.title, queuedToast.message, queuedToast.type);
                }, 100);
            }
        }
    }, [pathname, showToast]);

    // This component renders nothing
    return null;
}