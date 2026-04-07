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
import { PatientMedicalData } from '../../../api/patients.types';
import { useDeletePatientMedicalData } from '../../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteMedicalRecordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    record: PatientMedicalData | null;
    patientId: string;
}

export function DeleteMedicalRecordDialog({ isOpen, onClose, record, patientId }: DeleteMedicalRecordDialogProps) {
    const deleteMedicalData = useDeletePatientMedicalData();
    const { showToast } = useToast();

    if (!record) return null;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const handleConfirm = () => {
        deleteMedicalData.mutate(
            { medicalDataId: record.id, patientId },
            {
                onSuccess: () => {
                    showToast('Record Deleted', 'Medical record has been deleted successfully', 'success');
                    onClose();
                },
                onError: (error: unknown) => {
                    showToast('Delete Failed', 'Operation failed', 'error');
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-lg border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl max-w-[440px] p-0 gap-0">
                <DialogHeader className="p-5 pb-4 border-b border-white/10">
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        Delete Medical Record?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        This action can be reversed later
                    </DialogDescription>
                </DialogHeader>

                <div className="p-5 flex flex-col gap-3.5">
                    {/* Warning Box */}
                    <div className="flex gap-3 p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-lg">
                        <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-md font-medium text-foreground mb-1">
                                Delete record from <span className="text-red-500 font-semibold">{formatDate(record.createdAt)}</span>
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                This will remove the medical data and its prediction if one exists.
                            </p>
                        </div>
                    </div>

                    {/* Record Summary */}
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3.5 flex flex-col gap-2">
                        {[
                            { label: 'HbA1c', value: `${Number(record.hba1cBaseline).toFixed(1)}%` },
                            { label: 'BMI', value: Number(record.bmi).toFixed(1) },
                            { label: 'Age', value: `${record.age} yrs` },
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center text-base">
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
                        disabled={deleteMedicalData.isPending}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-10 text-base font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={deleteMedicalData.isPending}
                        className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white border-0 h-10 text-base font-semibold"
                    >
                        {deleteMedicalData.isPending ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Deleting...</>
                        ) : (
                            <><Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Record</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}