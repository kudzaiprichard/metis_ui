'use client';

import { useRouter } from 'next/navigation';
import { PatientMedicalData } from '../../../api/patients.types';
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
    ArrowRight,
    User,
    Droplet,
    HeartPulse,
    FlaskConical,
    ListChecks,
    Users,
} from 'lucide-react';

interface MedicalRecordDetailProps {
    isOpen: boolean;
    onClose: () => void;
    record: PatientMedicalData | null;
    onEdit: () => void;
    onDelete: () => void;
}

export function MedicalRecordDetail({ isOpen, onClose, record, onEdit, onDelete }: MedicalRecordDetailProps) {
    const router = useRouter();

    if (!record) return null;

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleFindSimilar = () => {
        router.push(`/doctor/similar-patients?medicalDataId=${record.id}`);
    };

    const comorbidities = [
        { key: 'previous_prediabetes', label: 'Previous Prediabetes', value: record.previous_prediabetes },
        { key: 'hypertension', label: 'Hypertension', value: record.hypertension },
        { key: 'ckd', label: 'Chronic Kidney Disease', value: record.ckd },
        { key: 'cvd', label: 'Cardiovascular Disease', value: record.cvd },
        { key: 'nafld', label: 'NAFLD', value: record.nafld },
        { key: 'retinopathy', label: 'Retinopathy', value: record.retinopathy },
    ];

    const demographicsFields = [
        { label: 'Age', value: `${record.age} yrs` },
        { label: 'Gender', value: record.gender },
        { label: 'Ethnicity', value: record.ethnicity },
    ];

    const twoColSections = [
        {
            title: 'Diabetes Profile',
            icon: Droplet,
            fields: [
                { label: 'HbA1c Baseline', value: `${parseFloat(record.hba1c_baseline).toFixed(1)}%` },
                { label: 'Diabetes Duration', value: `${parseFloat(record.diabetes_duration).toFixed(1)} yrs` },
                { label: 'Fasting Glucose', value: `${parseFloat(record.fasting_glucose).toFixed(1)} mg/dL` },
                { label: 'C-Peptide', value: `${parseFloat(record.c_peptide).toFixed(2)} ng/mL` },
            ],
        },
        {
            title: 'Metabolic & Cardiovascular',
            icon: HeartPulse,
            fields: [
                { label: 'eGFR', value: `${parseFloat(record.egfr).toFixed(0)} mL/min` },
                { label: 'BMI', value: `${parseFloat(record.bmi).toFixed(1)} kg/m²` },
                { label: 'BP Systolic', value: `${record.bp_systolic} mmHg` },
                { label: 'BP Diastolic', value: `${record.bp_diastolic} mmHg` },
            ],
        },
        {
            title: 'Liver & Lipid Profile',
            icon: FlaskConical,
            fields: [
                { label: 'ALT', value: `${parseFloat(record.alt).toFixed(1)} U/L` },
                { label: 'LDL', value: `${parseFloat(record.ldl).toFixed(1)} mg/dL` },
                { label: 'HDL', value: `${parseFloat(record.hdl).toFixed(1)} mg/dL` },
                { label: 'Triglycerides', value: `${parseFloat(record.triglycerides).toFixed(1)} mg/dL` },
            ],
        },
    ];

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                className="w-[50vw] sm:max-w-[50vw] p-0 gap-0 rounded-none border-l border-white/10 bg-[rgba(10,31,26,0.98)] backdrop-blur-xl"
            >
                <div className="flex flex-col h-full">
                    {/* Fixed Header */}
                    <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/5 flex-shrink-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <SheetTitle>Medical Record</SheetTitle>
                                <SheetDescription className="text-xs">
                                    {formatDate(record.created_at)}
                                </SheetDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleFindSimilar}
                                className="rounded-none h-8 px-3.5 text-[12px] font-semibold border border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/15 hover:text-purple-300"
                            >
                                <Users className="h-3 w-3 mr-1.5" />
                                Find Similar
                            </Button>
                        </div>
                    </SheetHeader>

                    {/* Scrollable Content */}
                    <ScrollArea className="h-[calc(100vh-140px)]">
                        <div className="px-6 py-4 space-y-5">
                            {/* Prediction Banner */}
                            {record.prediction ? (
                                <div className="p-4 bg-primary/[0.06] border border-primary/15 rounded-none space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                AI Recommendation
                                            </p>
                                            <p className="text-[14px] font-semibold text-primary">
                                                {record.prediction.recommended_treatment}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 pl-8">
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                                                Confidence
                                            </span>
                                            <span className="text-[13px] font-bold text-foreground">
                                                {parseFloat(record.prediction.confidence_score).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                                                Reduction
                                            </span>
                                            <span className="text-[13px] font-bold text-foreground">
                                                {parseFloat(record.prediction.predicted_reduction).toFixed(2)}%
                                            </span>
                                        </div>
                                        <div className="ml-auto">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`/doctor/recommendations/${record.prediction!.id}`)}
                                                className="rounded-none text-[11px] font-semibold text-primary hover:bg-primary/10 h-7 px-2.5"
                                            >
                                                Full Details
                                                <ArrowRight className="h-3 w-3 ml-1.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-none">
                                    <Brain className="h-4 w-4 text-muted-foreground/50" />
                                    <p className="text-[13px] text-muted-foreground">
                                        No prediction generated for this record yet.
                                    </p>
                                </div>
                            )}

                            {/* Demographics — 3 columns */}
                            <div className="space-y-3">
                                <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" />
                                    Demographics
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {demographicsFields.map((f) => (
                                        <div
                                            key={f.label}
                                            className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1"
                                        >
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                                                {f.label}
                                            </span>
                                            <span className="text-[13px] font-semibold text-foreground block">
                                                {f.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Other sections — 2 columns */}
                            {twoColSections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <div key={section.title} className="space-y-3">
                                        <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
                                            <Icon className="h-3.5 w-3.5" />
                                            {section.title}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {section.fields.map((f) => (
                                                <div
                                                    key={f.label}
                                                    className="p-3 bg-white/[0.02] border border-white/5 rounded-none space-y-1"
                                                >
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">
                                                        {f.label}
                                                    </span>
                                                    <span className="text-[13px] font-semibold text-foreground block">
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
                                <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
                                    <ListChecks className="h-3.5 w-3.5" />
                                    Comorbidities
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {comorbidities.map((c) => (
                                        <div
                                            key={c.key}
                                            className={`flex items-center gap-2.5 p-2.5 rounded-none border text-[12px] ${
                                                c.value
                                                    ? 'bg-primary/[0.05] border-primary/15 text-foreground/80'
                                                    : 'bg-white/[0.02] border-white/5 text-muted-foreground/50'
                                            }`}
                                        >
                                            {c.value ? (
                                                <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                            ) : (
                                                <div className="h-3.5 w-3.5 border border-white/10 rounded-none flex-shrink-0" />
                                            )}
                                            <span>{c.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Fixed Footer */}
                    <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
                        <MedicalRecordActions
                            record={record}
                            onView={() => {}}
                            onEdit={() => { onClose(); onEdit(); }}
                            onDelete={() => { onClose(); onDelete(); }}
                            layout="row"
                        />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}