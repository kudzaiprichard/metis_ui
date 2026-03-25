import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DashboardContent } from './dashboard-content';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Dashboard | Metis',
};

export default function DoctorDashboardPage() {
    return (
        <Suspense fallback={<PageLoader isLoading fullPage={false} />}>
            <DashboardContent />
        </Suspense>
    );
}
