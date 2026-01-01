/**
 * Providers Wrapper
 * Client-side providers for React Query, Toast, and Splash Screen
 */

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/src/lib/query-client';
import { ToastProvider } from '@/src/components/shared/ui/toast';
import { AuthChecker } from './AuthChecker';
import { SplashScreen, useSplashScreen } from '@/src/components/shared/ui/splash';

export function Providers({ children }: { children: React.ReactNode }) {
    const { isLoading } = useSplashScreen();

    return (
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <SplashScreen isLoading={isLoading} />
                <AuthChecker />
                {!isLoading && children}
            </ToastProvider>
        </QueryClientProvider>
    );
}