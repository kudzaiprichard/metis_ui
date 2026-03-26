/**
 * Predictions are intentionally detail-only: the parent list page was removed
 * in commit f002fba because every prediction is reached from a patient's
 * medical-record actions, never browsed in isolation. If a list view is ever
 * needed, restore `app/(system)/doctor/recommendations/page.tsx` and revive
 * the legacy `RecommendationsList` (currently dead code under
 * `src/features/recommendation/components/list/`).
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PredictionDetail } from '@/src/features/recommendation/components/detail/PredictionDetail';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Prediction | Metis',
};

interface PredictionDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function PredictionDetailPage({ params }: PredictionDetailPageProps) {
    const { id } = await params;
    return (
        <Suspense
            fallback={<PageLoader isLoading fullPage={false} loadingText="Loading prediction…" />}
        >
            <PredictionDetail predictionId={id} />
        </Suspense>
    );
}
