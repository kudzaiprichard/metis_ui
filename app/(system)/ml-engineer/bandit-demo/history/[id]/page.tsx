import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SimulationStepsView } from '@/src/features/bandit-demo';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Simulation Steps | Metis',
};

interface SimulationStepsPageProps {
    params: Promise<{ id: string }>;
}

export default async function SimulationStepsPage({ params }: SimulationStepsPageProps) {
    const { id } = await params;
    return (
        <Suspense
            fallback={<PageLoader isLoading fullPage={false} loadingText="Loading simulation…" />}
        >
            <SimulationStepsView simulationId={id} />
        </Suspense>
    );
}
