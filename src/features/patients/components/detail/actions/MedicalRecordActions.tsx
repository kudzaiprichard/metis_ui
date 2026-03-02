'use client';

import { PatientMedicalData } from '../../../api/patients.types';
import { useGenerateRecommendation } from '@/src/features/recommendation/hooks/useRecommendations';
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
import { Eye, Brain, Pencil, Trash2 } from 'lucide-react';

interface MedicalRecordActionsProps {
    record: PatientMedicalData;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
    layout?: 'row' | 'column';
}

export function MedicalRecordActions({
                                         record,
                                         onEdit,
                                         onDelete,
                                         onView,
                                         layout = 'row',
                                     }: MedicalRecordActionsProps) {
    const generateRecommendation = useGenerateRecommendation();
    const { showToast } = useToast();

    const hasPrediction = !!record.prediction;

    const handlePredict = () => {
        generateRecommendation.mutate(
            { medical_data_id: record.id },
            {
                onSuccess: () => {
                    showToast('Prediction Generated', 'AI recommendation has been generated successfully', 'success');
                },
                onError: (error: ApiError) => {
                    showToast('Prediction Failed', error.getMessage(), 'error');
                },
            }
        );
    };

    return (
        <>
            <BrainPulseLoader isLoading={generateRecommendation.isPending} />
            <TooltipProvider>
                <div className={`flex gap-1.5 ${layout === 'column' ? 'flex-col' : 'flex-row'}`}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onView}
                                className="h-7 px-2.5 rounded-none text-[11px] font-semibold text-blue-400 hover:text-blue-400 hover:bg-blue-400/10 border border-blue-400/20 bg-blue-400/5"
                            >
                                <Eye className="h-3 w-3 mr-1.5" />
                                View
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>View Details</p></TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePredict}
                                disabled={hasPrediction || generateRecommendation.isPending}
                                className="h-7 px-2.5 rounded-none text-[11px] font-semibold text-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 bg-emerald-500/5 disabled:opacity-40"
                            >
                                <Brain className="h-3 w-3 mr-1.5" />
                                Predict
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{hasPrediction ? 'Already predicted' : 'Generate AI prediction'}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onEdit}
                                className="h-7 px-2.5 rounded-none text-[11px] font-semibold text-amber-400 hover:text-amber-400 hover:bg-amber-400/10 border border-amber-400/20 bg-amber-400/5"
                            >
                                <Pencil className="h-3 w-3 mr-1.5" />
                                Edit
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Edit Record</p></TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="h-7 px-2.5 rounded-none text-[11px] font-semibold text-red-500 hover:text-red-500 hover:bg-red-500/10 border border-red-500/20 bg-red-500/5"
                            >
                                <Trash2 className="h-3 w-3 mr-1.5" />
                                Delete
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Delete Record</p></TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        </>
    );
}