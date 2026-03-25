import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PatientDetail } from '@/src/features/patients/components/detail/PatientDetail';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Patient | Metis',
};

interface PatientPageProps {
    params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PatientPageProps) {
    const { id } = await params;
    return (
        <Suspense fallback={<PageLoader isLoading fullPage={false} loadingText="Loading patient…" />}>
            <PatientDetail patientId={id} />
        </Suspense>
    );
}
