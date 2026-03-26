'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SimilarPatientsSearch } from '@/src/features/similar-patients/components/search/SimilarPatientsSearch';

function SimilarPatientsInner() {
    const searchParams = useSearchParams();
    const patientId = searchParams.get('patientId') || undefined;
    const medicalDataId = searchParams.get('medicalDataId') || undefined;

    return (
        <SimilarPatientsSearch
            defaultPatientId={patientId}
            defaultMedicalDataId={medicalDataId}
            autoSearch={!!(patientId || medicalDataId)}
        />
    );
}

export function SimilarPatientsContent() {
    return (
        <Suspense fallback={null}>
            <SimilarPatientsInner />
        </Suspense>
    );
}
