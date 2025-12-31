/**
 * Providers Wrapper
 * Client-side providers for React Query and Toast
 */

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/src/lib/query-client';
import { ToastProvider } from '@/src/components/shared/ui/toast';
import { AuthChecker } from './AuthChecker';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <AuthChecker />
                {children}
            </ToastProvider>
        </QueryClientProvider>
    );
}