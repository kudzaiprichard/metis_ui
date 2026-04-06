'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import { PatientDetail } from '../../api/patients.types';
import { ArrowLeft, Users, User, Droplet, Weight, FolderOpen, CalendarCheck } from 'lucide-react';

interface PatientHeaderProps {
    patient: PatientDetail;
}

export function PatientHeader({ patient }: PatientHeaderProps) {
    const router = useRouter();

    const latest = patient.medicalRecords.length > 0 ? patient.medicalRecords[0] : null;

    const getInitials = () =>
        `${patient.firstName?.charAt(0) ?? ''}${patient.lastName?.charAt(0) ?? ''}`.toUpperCase();

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const handleBack = () => router.push('/doctor/patients');

    const handleFindSimilar = () => {
        if (!latest) return;
        router.push(`/doctor/similar-patients?patientId=${patient.id}`);
    };

    const stats = [
        { label: 'Age', value: latest?.age ?? 'N/A', unit: latest?.age ? 'yrs' : '', icon: User },
        { label: 'Gender', value: patient.gender ?? 'N/A', unit: '', icon: User },
        { label: 'HbA1c', value: latest?.hba1cBaseline ?? 'N/A', unit: latest?.hba1cBaseline ? '%' : '', icon: Droplet },
        { label: 'BMI', value: latest?.bmi ?? 'N/A', unit: '', icon: Weight },
        { label: 'Records', value: patient.medicalRecords.length, unit: '', icon: FolderOpen },
        { label: 'Last Visit', value: latest ? formatDate(latest.createdAt) : 'None', unit: '', icon: CalendarCheck },
    ];

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5">
            {/* Top Row */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-lg bg-primary/80 flex items-center justify-center text-primary-foreground font-semibold text-lg flex-shrink-0">
                        {getInitials()}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-lg font-semibold text-foreground tracking-tight">
                            {patient.firstName} {patient.lastName}
                        </h1>
                        <span className="text-xs text-muted-foreground/50 font-medium">
                            ID: {patient.id.slice(0, 16)}...
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBack}
                        className="rounded-lg h-8 px-3.5 text-sm font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                    >
                        <ArrowLeft className="h-3 w-3 mr-1.5" />
                        Back
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFindSimilar}
                        disabled={!latest}
                        className="rounded-lg h-8 px-3.5 text-sm font-semibold border border-info/20 bg-info/10 text-info hover:bg-info/15 hover:text-info disabled:opacity-40"
                    >
                        <Users className="h-3 w-3 mr-1.5" />
                        Find Similar
                    </Button>
                </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-6 gap-2 pt-3.5 border-t border-white/5">
                {stats.map((s) => (
                    <div key={s.label} className="flex items-center gap-2 px-2.5 py-2 bg-white/[0.02] border border-white/5 rounded-lg">
                        <s.icon className="h-3 w-3 text-primary flex-shrink-0" />
                        <div className="flex flex-col gap-px min-w-0">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                {s.label}
                            </span>
                            <span className="text-sm font-semibold text-foreground truncate">
                                {s.value}{s.unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{s.unit}</span>}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}