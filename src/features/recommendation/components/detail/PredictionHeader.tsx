'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import { PredictionDetail } from '../../api/recommendations.types';
import { ArrowLeft, User, Download, Brain, Clock, Cpu, FlaskConical } from 'lucide-react';

interface PredictionHeaderProps {
    prediction: PredictionDetail;
}

export function PredictionHeader({ prediction }: PredictionHeaderProps) {
    const router = useRouter();
    const patientId = prediction.patient.id;

    const getInitials = () => {
        const { first_name, last_name } = prediction.patient;
        return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase();
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
        });

    const metadata = [
        { label: 'Prediction ID', value: prediction.id.slice(0, 8), icon: Brain },
        { label: 'Generated', value: formatDate(prediction.created_at), icon: Clock },
        { label: 'Model Version', value: prediction.model_version, icon: Cpu },
        { label: 'Treatment Index', value: `#${prediction.treatment_index}`, icon: FlaskConical },
    ];

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="rounded-none h-8 px-3.5 text-[13px] font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground mb-5"
            >
                <ArrowLeft className="h-3 w-3 mr-1.5" />
                Back
            </Button>

            <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-none p-5 mb-5">
                {/* Top Row */}
                <div className="flex justify-between items-center mb-5 pb-5 border-b border-white/[0.06] flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-none bg-primary/80 flex items-center justify-center text-primary-foreground font-semibold text-[20px] flex-shrink-0">
                            {getInitials()}
                        </div>
                        <div className="flex flex-col gap-1">
                            <h1 className="text-[20px] font-semibold text-foreground tracking-tight">
                                {prediction.patient.first_name} {prediction.patient.last_name}
                            </h1>
                            <p className="text-[13px] text-muted-foreground font-medium">
                                {prediction.patient.age} years &bull; {prediction.patient.gender}
                            </p>
                            <p className="text-[11px] text-muted-foreground/50 font-medium">
                                Patient ID: {patientId.slice(0, 16)}...
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/doctor/patients/${patientId}`)}
                            className="rounded-none h-8 px-3.5 text-[12px] font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                        >
                            <User className="h-3 w-3 mr-1.5" />
                            View Patient
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-none h-8 px-3.5 text-[12px] font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                        >
                            <Download className="h-3 w-3 mr-1.5" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-4 gap-3">
                    {metadata.map((m) => (
                        <div key={m.label} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-none hover:bg-white/[0.04] transition-colors">
                            <m.icon className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{m.label}</span>
                                <span className="text-[13px] font-semibold text-foreground truncate">{m.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
}