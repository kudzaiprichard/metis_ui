'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/src/components/shadcn/dialog';
import { PatientMedicalData } from '../../../api/patients.types';

interface EditMedicalRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: PatientMedicalData | null;
    patientId: string;
}

// Editing medical records is not supported by the current backend (spec §5).
export function EditMedicalRecordModal({ isOpen, onClose }: EditMedicalRecordModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-lg border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>Edit Not Supported</DialogTitle>
                    <DialogDescription>
                        Editing medical records is not available in the current backend.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
