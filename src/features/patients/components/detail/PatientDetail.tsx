'use client';

import { useMemo, useState } from 'react';
import { usePatientDetail } from '../../hooks/usePatients';
import { usePatientPredictions } from '@/src/features/recommendation/hooks/useRecommendations';
import type { PredictionResponse } from '@/src/features/recommendation/api/recommendations.types';
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

    // Fetch all predictions for this patient so we can show each record's
    // prediction status without a per-card query. pageSize=100 covers any
    // realistic number of records a patient might have.
    const { data: predictionsData } = usePatientPredictions(patientId, {
        page: 1,
        pageSize: 100,
    });

    const predictionsByRecordId = useMemo<Map<string, PredictionResponse>>(() => {
        const map = new Map<string, PredictionResponse>();
        predictionsData?.predictions.forEach((p) => map.set(p.medicalRecordId, p));
        return map;
    }, [predictionsData?.predictions]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span>Loading patient...</span>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <CircleAlert className="h-7 w-7 text-red-500" />
                <span>Error loading patient details</span>
            </div>
        );
    }

    const ageLabel = patient.medicalRecords[0]?.age
        ? `Age ${patient.medicalRecords[0].age}`
        : null;
    const createdLabel = `Created ${new Date(patient.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })}`;
    const subtitle = [
        `${patient.firstName} ${patient.lastName}`,
        ageLabel,
        createdLabel,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <>
            <div className="flex flex-col gap-4 pb-24">
                <header>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        Patient Details
                    </h1>
                    <p className="text-base text-muted-foreground mt-1">{subtitle}</p>
                </header>
                <PatientHeader patient={patient} />
                <ContactInfoSection patient={patient} />
                <MedicalRecordsList
                    patient={patient}
                    predictionsByRecordId={predictionsByRecordId}
                />
            </div>

            {/* FAB */}
            <Button
                onClick={() => setIsNewRecordModalOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground border border-primary/30 shadow-lg shadow-primary/30 z-50 p-0"
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
