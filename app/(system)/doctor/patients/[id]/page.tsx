'use client';

import { PatientDetail } from '@/src/features/patients/components/detail/PatientDetail';
import { useParams } from 'next/navigation';

export default function PatientPage() {
    const params = useParams();
    const patientId = params.id as string;

    return <PatientDetail patientId={patientId} />;
}