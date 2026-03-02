'use client';

import { useState } from 'react';
import { usePatientDetail } from '../../hooks/usePatients';
import { PatientHeader } from './PatientHeader';
import { ContactInfoSection } from './sections/ContactInfoSection';
import { MedicalRecordsList } from './sections/MedicalRecordsList';
import { NewMedicalRecordModal } from './modals/NewMedicalRecordModal';
import { Button } from '@/src/components/shadcn/button';
import { Loader2, CircleAlert, Plus } from 'lucide-react';

interface PatientDetailProps {
    patientId: string;
}

export function PatientDetail({ patientId }: PatientDetailProps) {
    const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
    const { data: patient, isLoading, error } = usePatientDetail(patientId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-[14px]">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span>Loading patient...</span>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-[14px]">
                <CircleAlert className="h-7 w-7 text-red-500" />
                <span>Error loading patient details</span>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-4 pb-24">
                <PatientHeader patient={patient} />
                <ContactInfoSection patient={patient} />
                <MedicalRecordsList patient={patient} />
            </div>

            {/* FAB */}
            <Button
                onClick={() => setIsNewRecordModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 rounded-none bg-primary hover:bg-primary/80 text-primary-foreground border border-primary/30 shadow-lg shadow-primary/30 z-50 p-0"
                title="New Visit"
            >
                <Plus className="h-6 w-6" />
            </Button>

            <NewMedicalRecordModal
                isOpen={isNewRecordModalOpen}
                onClose={() => setIsNewRecordModalOpen(false)}
                patientId={patientId}
            />
        </>
    );
}