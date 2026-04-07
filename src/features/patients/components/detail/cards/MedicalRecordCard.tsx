'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/src/components/shadcn/card';
import { MedicalRecord } from '../../../api/patients.types';
import type { PredictionResponse } from '@/src/features/recommendation/api/recommendations.types';
import { MedicalRecordActions } from '../actions/MedicalRecordActions';
import {
    Droplet,
    Weight,
    Stethoscope,
    HeartPulse,
    CalendarCheck,
    ListChecks,
    Pill,
    ArrowRight,
} from 'lucide-react';

interface MedicalRecordCardProps {
    record: MedicalRecord;
    index: number;
    prediction?: PredictionResponse;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export function MedicalRecordCard({ record, index, prediction, onView }: MedicalRecordCardProps) {
    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const comorbidityCount = [record.hypertension, record.ckd, record.cvd, record.nafld].filter(
        (v) => v === 1
    ).length;

    const metrics = [
        { label: 'HbA1c', value: `${Number(record.hba1cBaseline).toFixed(1)}%`, icon: Droplet },
        { label: 'BMI',   value: Number(record.bmi).toFixed(1),                 icon: Weight },
        { label: 'eGFR',  value: Number(record.egfr).toFixed(0),                icon: Stethoscope },
        { label: 'BP Sys',value: `${record.bpSystolic}`,                        icon: HeartPulse },
    ];

    return (
        <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 border-white/10 bg-card/30 backdrop-blur-sm rounded-lg overflow-hidden p-0">
            <CardContent className="p-4 flex flex-col gap-3.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                            <CalendarCheck className="h-2.5 w-2.5 text-primary" />
                            Visit {index}
                        </div>
                        <span className="text-base font-semibold text-foreground">
                            {formatDate(record.createdAt)}
                        </span>
                    </div>

                    {/* Prediction treatment badge */}
                    {prediction && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg flex-shrink-0">
                            <Pill className="h-2.5 w-2.5 text-primary" />
                            <span className="text-xs font-semibold text-primary">
                                {prediction.recommendedTreatment}
                            </span>
                        </div>
                    )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {metrics.map((m) => (
                        <div
                            key={m.label}
                            className="flex items-center gap-2 px-2.5 py-2 bg-white/[0.02] border border-white/5 rounded-lg"
                        >
                            <m.icon className="h-3 w-3 text-primary flex-shrink-0" />
                            <div className="flex flex-col gap-px">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                                    {m.label}
                                </span>
                                <span className="text-sm font-semibold text-foreground">
                                    {m.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Prediction summary snippet — only shown when a prediction exists */}
                {prediction && (
                    <div className="flex flex-col gap-1.5 p-2.5 bg-primary/[0.04] border border-primary/10 rounded-lg">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                AI Recommendation
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {prediction.confidencePct}% confidence
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
                            {prediction.explanation.summary}
                        </p>
                        <Link
                            href={`/doctor/recommendations/${prediction.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors mt-0.5"
                            onClick={(e) => e.stopPropagation()}
                        >
                            See full recommendation
                            <ArrowRight className="h-2.5 w-2.5" />
                        </Link>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-white/5 gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ListChecks className="h-2.5 w-2.5" />
                        <span>{comorbidityCount} comorbidities</span>
                    </div>
                    <MedicalRecordActions
                        record={record}
                        prediction={prediction}
                        onView={onView}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
