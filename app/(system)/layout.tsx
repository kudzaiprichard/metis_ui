'use client';

import { ReactNode } from 'react';
import { SystemLayout } from '@/src/components/layout';

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