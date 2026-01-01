/**
 * Toast Bridge Utility
 * Pass toast messages across page navigations using sessionStorage
 */

export type ToastType = 'success' | 'error' | 'info';

export interface ToastBridgeMessage {
    title: string;
    message: string;
    type: ToastType;
    timestamp: number;
}

const TOAST_BRIDGE_KEY = 'toast_bridge_message';

/**
 * Queue a toast to be shown on the next page
 *
 * @param title - Toast title
 * @param message - Toast message
 * @param type - Toast type (success, error, info)
 *
 * @example
 * queueToast('Welcome!', 'Login successful', 'success');
 * router.push('/dashboard');
 */
export function queueToast(title: string, message: string, type: ToastType = 'info') {
    if (typeof window !== 'undefined') {
        const toastData: ToastBridgeMessage = {
            title,
            message,
            type,
            timestamp: Date.now()
        };
        sessionStorage.setItem(TOAST_BRIDGE_KEY, JSON.stringify(toastData));
    }
}

/**
 * Retrieve and clear queued toast
 *
 * @param maxAge - Maximum age of toast in milliseconds (default: 5000ms)
 * @returns Toast message or null if no valid toast is queued
 */
export function dequeueToast(maxAge: number = 5000): ToastBridgeMessage | null {
    if (typeof window !== 'undefined') {
        const toastData = sessionStorage.getItem(TOAST_BRIDGE_KEY);
        if (toastData) {
            // Always remove from storage
            sessionStorage.removeItem(TOAST_BRIDGE_KEY);

            try {
                const parsed: ToastBridgeMessage = JSON.parse(toastData);

                // Check if toast is too old (prevents showing stale messages)
                const age = Date.now() - parsed.timestamp;
                if (age > maxAge) {
                    return null;
                }

                return parsed;
            } catch (error) {
                console.error('Error parsing queued toast:', error);
                return null;
            }
        }
    }
    return null;
}

/**
 * Clear any queued toast without showing it
 */
export function clearQueuedToast() {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(TOAST_BRIDGE_KEY);
    }
}