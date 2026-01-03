'use client';

import { ReactNode } from 'react';
import { SystemLayout } from '@/src/components/layouts/SystemLayout';

interface SystemLayoutWrapperProps {
    children: ReactNode;
}

export default function SystemLayoutWrapper({ children }: SystemLayoutWrapperProps) {
    return (
        <SystemLayout>
            {children}
        </SystemLayout>
    );
}