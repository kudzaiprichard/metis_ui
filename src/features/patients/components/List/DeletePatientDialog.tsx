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
import { Patient } from '../../api/patients.types';
import { useDeletePatient } from '../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { Trash2, Loader2 } from 'lucide-react';

interface DeletePatientDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

export function DeletePatientDialog({ isOpen, onClose, patient }: DeletePatientDialogProps) {
    const deletePatient = useDeletePatient();
    const { showToast } = useToast();

    if (!patient) return null;

    const handleConfirm = () => {
        deletePatient.mutate(patient.id, {
            onSuccess: () => {
                showToast('Patient Deleted', `${patient.firstName} ${patient.lastName} has been deleted successfully`, 'success');
                onClose();
            },
            onError: (error: ApiError) => {
                showToast('Delete Failed', error.getMessage(), 'error');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-lg border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl max-w-[420px] p-0 gap-0">
                <DialogHeader className="p-5 pb-4 border-b border-white/10">
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        Delete Patient?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        This action can be reversed later
                    </DialogDescription>
                </DialogHeader>

                <div className="p-5">
                    <div className="flex gap-3 p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-lg">
                        <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
                        <div>
                            <p className="text-md font-medium text-foreground mb-1">
                                Delete <span className="text-red-500 font-semibold">{patient.firstName} {patient.lastName}</span>
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                This patient record will be deactivated and can be restored later if needed.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-5 pt-4 border-t border-white/10 flex gap-2.5 sm:flex-row">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={deletePatient.isPending}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-10 text-base font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={deletePatient.isPending}
                        className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white border-0 h-10 text-base font-semibold"
                    >
                        {deletePatient.isPending ? (
                            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Deleting...</>
                        ) : (
                            <><Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Patient</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}