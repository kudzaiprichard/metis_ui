'use client';

import { useRouter } from 'next/navigation';
import { MedicalRecord } from '../../../api/patients.types';
import type { PredictionResponse } from '@/src/features/recommendation/api/recommendations.types';
import { MedicalRecordActions } from '../actions/MedicalRecordActions';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/src/components/shadcn/sheet';
import { ScrollArea } from '@/src/components/shadcn/scroll-area';
import { Button } from '@/src/components/shadcn/button';
import {
    CheckCircle,
    Brain,
    Droplet,
    HeartPulse,
    FlaskConical,
    ListChecks,
    Users,
    Pill,
    ArrowRight,
} from 'lucide-react';

interface MedicalRecordDetailProps {
    isOpen: boolean;
    onClose: () => void;
    record: MedicalRecord | null;
    prediction?: PredictionResponse;
    onEdit: () => void;
    onDelete: () => void;
}

export function MedicalRecordDetail({ isOpen, onClose, record, prediction }: MedicalRecordDetailProps) {
    const router = useRouter();

    if (!record) return null;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleFindSimilar = () => {
        router.push(`/doctor/similar-patients?medicalDataId=${record.id}`);
    };

    const handleViewRecommendation = () => {
        if (prediction) router.push(`/doctor/recommendations/${prediction.id}`);
    };

    const comorbidities = [
        { key: 'hypertension', label: 'Hypertension',          value: record.hypertension === 1 },
        { key: 'ckd',          label: 'Chronic Kidney Disease', value: record.ckd === 1 },
        { key: 'cvd',          label: 'Cardiovascular Disease', value: record.cvd === 1 },
        { key: 'nafld',        label: 'NAFLD',                  value: record.nafld === 1 },
    ];

    const twoColSections = [
        {
            title: 'Diabetes Profile',
            icon: Droplet,
            fields: [
                { label: 'HbA1c Baseline',    value: `${Number(record.hba1cBaseline).toFixed(1)}%` },
                { label: 'Diabetes Duration', value: `${Number(record.diabetesDuration).toFixed(1)} yrs` },
                { label: 'Fasting Glucose',   value: `${Number(record.fastingGlucose).toFixed(1)} mg/dL` },
                { label: 'C-Peptide',         value: `${Number(record.cPeptide).toFixed(2)} ng/mL` },
            ],
        },
        {
            title: 'Metabolic & Cardiovascular',
            icon: HeartPulse,
            fields: [
                { label: 'eGFR',       value: `${Number(record.egfr).toFixed(0)} mL/min` },
                { label: 'BMI',        value: `${Number(record.bmi).toFixed(1)} kg/m²` },
                { label: 'BP Systolic',value: `${record.bpSystolic} mmHg` },
                { label: 'Age',        value: `${record.age} yrs` },
            ],
        },
        {
            title: 'Liver & Lipid Profile',
            icon: FlaskConical,
            fields: [
                { label: 'ALT',          value: `${Number(record.alt).toFixed(1)} U/L` },
                { label: 'LDL',          value: `${Number(record.ldl).toFixed(1)} mg/dL` },
                { label: 'HDL',          value: `${Number(record.hdl).toFixed(1)} mg/dL` },
                { label: 'Triglycerides',value: `${Number(record.triglycerides).toFixed(1)} mg/dL` },
            ],
        },
    ];

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className="w-[50vw] sm:max-w-[50vw] p-0 gap-0 rounded-lg border-l border-white/10 bg-background/95 backdrop-blur-xl"
            >
                <div className="flex flex-col h-full">
                    {/* Fixed Header */}
                    <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/5 flex-shrink-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <SheetTitle>Medical Record</SheetTitle>
                                <SheetDescription className="text-xs">
                                    {formatDate(record.createdAt)}
                                </SheetDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleFindSimilar}
                                className="rounded-lg h-8 px-3.5 text-sm font-semibold border border-info/20 bg-info/10 text-info hover:bg-info/15 hover:text-info"
                            >
                                <Users className="h-3 w-3 mr-1.5" />
                                Find Similar
                            </Button>
                        </div>
                    </SheetHeader>

                    {/* Scrollable Content */}
                    <ScrollArea className="flex-1 min-h-0">
                        <div className="px-6 py-4 space-y-5">

                            {/* Prediction section */}
                            {prediction ? (
                                <div className="p-4 bg-primary/[0.06] border border-primary/20 rounded-lg space-y-3">
                                    {/* Treatment + confidence row */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Pill className="h-4 w-4 text-primary flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider">
                                                    AI Recommendation
                                                </p>
                                                <p className="text-md font-bold text-primary">
                                                    {prediction.recommendedTreatment}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                                Confidence
                                            </p>
                                            <p className="text-md font-bold text-foreground">
                                                {prediction.confidencePct}%
                                                <span className="text-xs font-normal text-muted-foreground ml-1">
                                                    ({prediction.confidenceLabel})
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <p className="text-sm text-muted-foreground/80 leading-relaxed">
                                        {prediction.explanation.summary}
                                    </p>

                                    {/* See full recommendation */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleViewRecommendation}
                                        className="h-8 px-3 rounded-lg text-sm font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 w-full justify-between"
                                    >
                                        <span>See full recommendation</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                                    <Brain className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                                    <p className="text-base text-muted-foreground">
                                        No prediction yet. Use the <strong>Predict</strong> button on the record card to generate an AI recommendation.
                                    </p>
                                </div>
                            )}

                            {/* Clinical sections */}
                            {twoColSections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <div key={section.title} className="space-y-3">
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
                                            <Icon className="h-3.5 w-3.5" />
                                            {section.title}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {section.fields.map((f) => (
                                                <div
                                                    key={f.label}
                                                    className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1"
                                                >
                                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block">
                                                        {f.label}
                                                    </span>
                                                    <span className="text-base font-semibold text-foreground block">
                                                        {f.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Comorbidities */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
                                    <ListChecks className="h-3.5 w-3.5" />
                                    Comorbidities
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {comorbidities.map((c) => (
                                        <div
                                            key={c.key}
                                            className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-sm ${
                                                c.value
                                                    ? 'bg-primary/[0.05] border-primary/15 text-foreground/80'
                                                    : 'bg-white/[0.02] border-white/5 text-muted-foreground/50'
                                            }`}
                                        >
                                            {c.value ? (
                                                <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                            ) : (
                                                <div className="h-3.5 w-3.5 border border-white/10 rounded-lg flex-shrink-0" />
                                            )}
                                            <span>{c.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {record.notes && (
                                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">
                                        Notes
                                    </span>
                                    <p className="text-base text-foreground/80">{record.notes}</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Fixed Footer */}
                    <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
                        <MedicalRecordActions
                            record={record}
                            prediction={prediction}
                            onView={() => {}}
                            layout="row"
                        />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
