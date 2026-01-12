'use client';

import { useParams } from 'next/navigation';
import {PredictionDetail} from "@/src/features/recommendation/components/detail/PredictionDetail";

export default function PredictionDetailPage() {
    const params = useParams();
    const predictionId = params.id as string;

    return <PredictionDetail predictionId={predictionId} />;
}