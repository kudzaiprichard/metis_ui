'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

interface FullscreenLayoutProps {
    children: ReactNode;
}

export default function FullscreenLayout({ children }: FullscreenLayoutProps) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <PageLoader isLoading fullPage loadingText="Loading..." />;
    }
    if (!user) return null;

    return <main className="h-screen w-screen overflow-hidden relative z-[1]">{children}</main>;
}
