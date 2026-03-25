import { Suspense } from 'react';
import type { Metadata } from 'next';
import { InferencePredict } from '@/src/features/inference/components/InferencePredict';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Inference | Metis',
};

export default function InferencePage() {
    return (
        <Suspense fallback={<PageLoader isLoading fullPage={false} />}>
            <InferencePredict />
        </Suspense>
    );
}
