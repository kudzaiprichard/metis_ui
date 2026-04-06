'use client';

import { useRouter } from 'next/navigation';
import { MedicalRecord } from '../../../api/patients.types';
import type { PredictionResponse } from '@/src/features/recommendation/api/recommendations.types';
import { useCreatePrediction } from '@/src/features/recommendation/hooks/useRecommendations';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { BrainPulseLoader } from '../../loader/BrainPulseLoader';
import { Button } from '@/src/components/shadcn/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/src/components/shadcn/tooltip';
import { Eye, Brain, CheckCircle } from 'lucide-react';

interface MedicalRecordActionsProps {
    record: MedicalRecord;
    prediction?: PredictionResponse;
    onView: () => void;
    /** @deprecated edit is not supported by the backend */
    onEdit?: () => void;
    /** @deprecated delete is not supported by the backend */
    onDelete?: () => void;
    layout?: 'row' | 'column';
}

export function MedicalRecordActions({
    record,
    prediction,
    onView,
    layout = 'row',
}: MedicalRecordActionsProps) {
    const router = useRouter();
    const createPrediction = useCreatePrediction();
    const { showToast } = useToast();

    const alreadyPredicted = !!prediction;

    const handlePredict = () => {
        createPrediction.mutate(
            { medical_record_id: record.id, patient_id: record.patientId },
            {
                onSuccess: (result) => {
                    showToast(
                        'Prediction Generated',
                        'AI recommendation has been generated. Redirecting…',
                        'success',
                    );
                    router.push(`/doctor/recommendations/${result.id}`);
                },
                onError: (error: ApiError) => {
                    showToast('Prediction Failed', error.getMessage(), 'error');
                },
            },
        );
    };

    const handleViewResult = () => {
        if (prediction) router.push(`/doctor/recommendations/${prediction.id}`);
    };

    return (
        <>
            <BrainPulseLoader isLoading={createPrediction.isPending} />
            <TooltipProvider>
                <div className={`flex gap-1.5 ${layout === 'column' ? 'flex-col' : 'flex-row'}`}>
                    {/* View details in sheet */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onView}
                                className="h-7 px-2.5 rounded-lg text-xs font-semibold text-info hover:text-info hover:bg-info/10 border border-info/20 bg-info/5"
                            >
                                <Eye className="h-3 w-3 mr-1.5" />
                                View
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>View record details</p></TooltipContent>
                    </Tooltip>

                    {/* Predict / View Result */}
                    {alreadyPredicted ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleViewResult}
                                    className="h-7 px-2.5 rounded-lg text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 border border-primary/20 bg-primary/5"
                                >
                                    <CheckCircle className="h-3 w-3 mr-1.5" />
                                    View Result
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Open AI recommendation</p>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePredict}
                                    disabled={createPrediction.isPending}
                                    className="h-7 px-2.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 bg-emerald-500/5 disabled:opacity-40"
                                >
                                    <Brain className="h-3 w-3 mr-1.5" />
                                    Predict
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Generate AI prediction</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </TooltipProvider>
        </>
    );
}
