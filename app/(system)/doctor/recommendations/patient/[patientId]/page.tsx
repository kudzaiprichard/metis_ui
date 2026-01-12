// app/(system)/doctor/recommendations/patient/[patientId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import {RecommendationsList} from "@/src/features/recommendation/components/list/RecommendationsList";

export default function PatientRecommendationsPage() {
    const params = useParams();
    const patientId = params.patientId as string;

    return <RecommendationsList patientId={patientId} />;
}