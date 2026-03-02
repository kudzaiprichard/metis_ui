'use client';

import { useSearchParams } from 'next/navigation';
import { SimilarPatientsSearch } from "@/src/features/similar-patients/components/search/SimilarPatientsSearch";

export default function SimilarPatientsPage() {
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