import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PatientList } from '@/src/features/patients/components/List/PatientList';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export const metadata: Metadata = {
    title: 'Patients | Metis',
};

export default function PatientsPage() {
    return (
        <Suspense fallback={<PageLoader isLoading fullPage={false} loadingText="Loading patients…" />}>
            <PatientList />
        </Suspense>
    );
}
