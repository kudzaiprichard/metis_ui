import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SimulationHistoryList } from '@/src/features/bandit-demo';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Simulation History | Metis',
};

export default function SimulationHistoryPage() {
    return (
        <Suspense
            fallback={<PageLoader isLoading fullPage={false} loadingText="Loading history…" />}
        >
            <SimulationHistoryList />
        </Suspense>
    );
}
