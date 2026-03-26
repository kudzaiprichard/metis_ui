import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SimilarPatientDetail } from '@/src/features/similar-patients/components/detail/SimilarPatientDetail';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Similar Patient | Metis',
};

interface SimilarPatientDetailPageProps {
    params: Promise<{ caseId: string }>;
}

export default async function SimilarPatientDetailPage({ params }: SimilarPatientDetailPageProps) {
    const { caseId } = await params;
    return (
        <Suspense fallback={<PageLoader isLoading fullPage={false} loadingText="Loading case…" />}>
            <SimilarPatientDetail caseId={caseId} />
        </Suspense>
    );
}
