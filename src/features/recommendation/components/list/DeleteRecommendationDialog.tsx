'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/src/components/shadcn/dialog';
import { Button } from '@/src/components/shadcn/button';
import { Prediction } from '../../api/recommendations.types';
import { useDeleteRecommendation } from '../../hooks/useRecommendations';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteRecommendationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    prediction: Prediction | null;
}

export function DeleteRecommendationDialog({ isOpen, onClose, prediction }: DeleteRecommendationDialogProps) {
    const deleteRecommendation = useDeleteRecommendation();
    const { showToast } = useToast();

    if (!prediction) return null;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const handleConfirm = () => {
        deleteRecommendation.mutate(prediction.id, {
            onSuccess: () => {
                showToast(
                    'Prediction Deleted',
                    `Prediction for ${prediction.patient.first_name} ${prediction.patient.last_name} has been deleted successfully`,
                    'success'
                );
                onClose();
            },
            onError: (error: ApiError) => {
                showToast('Delete Failed', error.getMessage(), 'error');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-none border-white/10 bg-[rgba(10,31,26,0.97)] backdrop-blur-xl shadow-2xl max-w-[440px] p-0 gap-0">
                <DialogHeader className="p-5 pb-4 border-b border-white/10">
                    <DialogTitle className="text-[18px] font-semibold text-foreground">
                        Delete Prediction?
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-muted-foreground">
                        This action cannot be undone
                    </DialogDescription>
                </DialogHeader>

                <div className="p-5 flex flex-col gap-3.5">
                    {/* Warning Box */}
                    <div className="flex gap-3 p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-none">
                        <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[14px] font-medium text-foreground mb-1">
                                Delete prediction for{' '}
                                <span className="text-red-500 font-semibold">
                                    {prediction.patient.first_name} {prediction.patient.last_name}
                                </span>
                            </p>
                            <p className="text-[12px] text-muted-foreground leading-relaxed">
                                This will permanently remove the prediction record created on {formatDate(prediction.created_at)}.
                            </p>
                        </div>
                    </div>

                    {/* Prediction Summary */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-none p-3.5 flex flex-col gap-2">
                        {[
                            { label: 'Treatment', value: prediction.recommended_treatment },
                            { label: 'Confidence', value: `${parseFloat(prediction.confidence_score).toFixed(1)}%` },
                            { label: 'Reduction', value: `${parseFloat(prediction.predicted_reduction).toFixed(2)}%` },
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center text-[13px]">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span className="text-foreground font-semibold">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter className="p-5 pt-4 border-t border-white/10 flex gap-2.5 sm:flex-row">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={deleteRecommendation.isPending}
                        className="flex-1 rounded-none border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-10 text-[13px] font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={deleteRecommendation.isPending}
                        className="flex-1 rounded-none bg-red-600 hover:bg-red-700 text-white border-0 h-10 text-[13px] font-semibold"
                    >
                        {deleteRecommendation.isPending ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Deleting...</>
                        ) : (
                            <><Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Prediction</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}