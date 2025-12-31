/**
 * Toast Types
 */

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    title: string;
    message: string;
    type: ToastType;
}