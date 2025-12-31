/**
 * Providers Wrapper
 * Client-side providers for React Query and Toast
 */

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { ToastProvider } from '@/components/shared/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                {children}
            </ToastProvider>
        </QueryClientProvider>
    );
}