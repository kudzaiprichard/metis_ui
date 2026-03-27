import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BanditDemo } from '@/src/features/bandit-demo';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Bandit Demo | Metis',
};

export default function BanditDemoPage() {
    return (
        <Suspense fallback={<PageLoader isLoading fullPage={false} />}>
            <BanditDemo />
        </Suspense>
    );
}
