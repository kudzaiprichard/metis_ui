// app/doctor/similar-patients/[caseId]/page.tsx
'use client';

import { use } from 'react';
import { SimilarPatientDetail } from "@/src/features/similar-patients/components/detail/SimilarPatientDetail";

interface SimilarPatientDetailPageProps {
    params: Promise<{
        caseId: string;
    }>;
}

export default function SimilarPatientDetailPage({ params }: SimilarPatientDetailPageProps) {
    const { caseId } = use(params);

    return <SimilarPatientDetail caseId={caseId} />;
}