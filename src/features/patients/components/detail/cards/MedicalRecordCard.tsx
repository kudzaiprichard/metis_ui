'use client';

import { Card, CardContent } from '@/src/components/shadcn/card';
import { Badge } from '@/src/components/shadcn/badge';
import { PatientMedicalData } from '../../../api/patients.types';
import { MedicalRecordActions } from '../actions/MedicalRecordActions';
import { Droplet, Weight, Heart, Stethoscope, CalendarCheck, ListChecks, CircleCheck, Circle } from 'lucide-react';

interface MedicalRecordCardProps {
    record: PatientMedicalData;
    index: number;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function MedicalRecordCard({ record, index, onView, onEdit, onDelete }: MedicalRecordCardProps) {
    const hasPrediction = !!record.prediction;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const comorbidityCount = [
        record.previous_prediabetes,
        record.hypertension,
        record.ckd,
        record.cvd,
        record.nafld,
        record.retinopathy,
    ].filter(Boolean).length;

    const metrics = [
        { label: 'HbA1c', value: `${parseFloat(record.hba1c_baseline).toFixed(1)}%`, icon: Droplet },
        { label: 'BMI', value: parseFloat(record.bmi).toFixed(1), icon: Weight },
        { label: 'eGFR', value: parseFloat(record.egfr).toFixed(0), icon: Stethoscope },
        { label: 'BP', value: `${record.bp_systolic}/${record.bp_diastolic}`, icon: Heart },
    ];

    return (
        <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 border-white/10 bg-card/30 backdrop-blur-sm rounded-none overflow-hidden p-0">
            <CardContent className="p-4 flex flex-col gap-3.5">
                {/* Header */}
                <div className="flex justify-between items-start gap-2.5">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                            <CalendarCheck className="h-2.5 w-2.5 text-primary" />
                            Visit {index}
                        </div>
                        <span className="text-[13px] font-semibold text-foreground">
                            {formatDate(record.created_at)}
                        </span>
                    </div>

                    <Badge
                        variant="secondary"
                        className={`rounded-none text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1.5 max-w-[160px] truncate border ${
                            hasPrediction
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10'
                                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/5'
                        }`}
                    >
                        {hasPrediction ? (
                            <CircleCheck className="h-3 w-3 flex-shrink-0" />
                        ) : (
                            <Circle className="h-3 w-3 flex-shrink-0" />
                        )}
                        <span className="truncate">
                            {hasPrediction ? record.prediction!.recommended_treatment : 'Not Predicted'}
                        </span>
                    </Badge>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {metrics.map((m) => (
                        <div
                            key={m.label}
                            className="flex items-center gap-2 px-2.5 py-2 bg-white/[0.02] border border-white/5 rounded-none"
                        >
                            <m.icon className="h-3 w-3 text-primary flex-shrink-0" />
                            <div className="flex flex-col gap-px">
                                <span className="text-[9px] text-muted-foreground uppercase tracking-wide font-semibold">
                                    {m.label}
                                </span>
                                <span className="text-[12px] font-semibold text-foreground">
                                    {m.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-white/5 gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <ListChecks className="h-2.5 w-2.5" />
                        <span>{comorbidityCount} comorbidities</span>
                    </div>
                    <MedicalRecordActions
                        record={record}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </div>
            </CardContent>
        </Card>
    );
}