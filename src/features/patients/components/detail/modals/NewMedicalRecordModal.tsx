'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/src/components/shadcn/dialog';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import { Checkbox } from '@/src/components/shadcn/checkbox';
import { ScrollArea } from '@/src/components/shadcn/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/src/components/shadcn/select';
import { useCreatePatientMedicalData } from '../../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { Plus, Loader2 } from 'lucide-react';

type GenderType = 'Male' | 'Female';
type EthnicityType = 'Caucasian' | 'African' | 'Asian' | 'Hispanic' | 'Other';

interface NewMedicalRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
}

const defaultForm = {
    age: '',
    gender: 'Male' as GenderType,
    ethnicity: 'Caucasian' as EthnicityType,
    hba1c_baseline: '',
    diabetes_duration: '',
    fasting_glucose: '',
    c_peptide: '',
    egfr: '',
    bmi: '',
    bp_systolic: '',
    bp_diastolic: '',
    alt: '',
    ldl: '',
    hdl: '',
    triglycerides: '',
    previous_prediabetes: false,
    hypertension: false,
    ckd: false,
    cvd: false,
    nafld: false,
    retinopathy: false,
};

export function NewMedicalRecordModal({ isOpen, onClose, patientId }: NewMedicalRecordModalProps) {
    const [formData, setFormData] = useState(defaultForm);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const createMedicalData = useCreatePatientMedicalData();
    const { showToast } = useToast();

    useEffect(() => {
        if (!isOpen) {
            setFormData(defaultForm);
            setFieldErrors({});
        }
    }, [isOpen]);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const n = { ...prev };
                delete n[field];
                return n;
            });
        }
    };

    const handleSubmit = () => {
        setFieldErrors({});

        createMedicalData.mutate(
            {
                patient_id: patientId,
                age: Number(formData.age),
                gender: formData.gender,
                ethnicity: formData.ethnicity,
                hba1c_baseline: Number(formData.hba1c_baseline),
                diabetes_duration: Number(formData.diabetes_duration),
                fasting_glucose: Number(formData.fasting_glucose),
                c_peptide: Number(formData.c_peptide),
                egfr: Number(formData.egfr),
                bmi: Number(formData.bmi),
                bp_systolic: Number(formData.bp_systolic),
                bp_diastolic: Number(formData.bp_diastolic),
                alt: Number(formData.alt),
                ldl: Number(formData.ldl),
                hdl: Number(formData.hdl),
                triglycerides: Number(formData.triglycerides),
                previous_prediabetes: formData.previous_prediabetes,
                hypertension: formData.hypertension,
                ckd: formData.ckd,
                cvd: formData.cvd,
                nafld: formData.nafld,
                retinopathy: formData.retinopathy,
            },
            {
                onSuccess: () => {
                    showToast('Record Created', 'New medical record has been created successfully', 'success');
                    onClose();
                },
                onError: (error: ApiError) => {
                    if (error.hasFieldErrors()) setFieldErrors(error.fieldErrors || {});
                    showToast('Creation Failed', error.getMessage(), 'error');
                },
            }
        );
    };

    const numFields = [
        { key: 'age', label: 'Age (years)', min: 18, max: 120, step: 1, hint: '' },
        { key: 'hba1c_baseline', label: 'HbA1c Baseline (%)', min: 4, max: 20, step: 0.01, hint: 'Normal: 4.0–5.6%' },
        { key: 'diabetes_duration', label: 'Diabetes Duration (yrs)', min: 0, max: 50, step: 0.1, hint: '' },
        { key: 'fasting_glucose', label: 'Fasting Glucose (mg/dL)', min: 50, max: 500, step: 0.1, hint: 'Normal: 70–100' },
        { key: 'c_peptide', label: 'C-Peptide (ng/mL)', min: 0, max: 10, step: 0.01, hint: 'Normal: 1.1–4.4' },
        { key: 'egfr', label: 'eGFR (mL/min/1.73m²)', min: 0, max: 150, step: 0.1, hint: 'Normal: >90' },
        { key: 'bmi', label: 'BMI (kg/m²)', min: 10, max: 80, step: 0.1, hint: 'Normal: 18.5–24.9' },
        { key: 'bp_systolic', label: 'BP Systolic (mmHg)', min: 70, max: 250, step: 1, hint: 'Normal: <120' },
        { key: 'bp_diastolic', label: 'BP Diastolic (mmHg)', min: 40, max: 150, step: 1, hint: 'Normal: <80' },
        { key: 'alt', label: 'ALT (U/L)', min: 0, max: 500, step: 0.1, hint: 'Normal: 7–56' },
        { key: 'ldl', label: 'LDL (mg/dL)', min: 0, max: 500, step: 0.1, hint: 'Optimal: <100' },
        { key: 'hdl', label: 'HDL (mg/dL)', min: 0, max: 200, step: 0.1, hint: 'Normal: >40 (M), >50 (F)' },
        { key: 'triglycerides', label: 'Triglycerides (mg/dL)', min: 0, max: 1000, step: 0.1, hint: 'Normal: <150' },
    ];

    const comorbidities = [
        { key: 'previous_prediabetes', label: 'Previous Prediabetes' },
        { key: 'hypertension', label: 'Hypertension' },
        { key: 'ckd', label: 'Chronic Kidney Disease (CKD)' },
        { key: 'cvd', label: 'Cardiovascular Disease (CVD)' },
        { key: 'nafld', label: 'NAFLD (Fatty Liver Disease)' },
        { key: 'retinopathy', label: 'Retinopathy' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[820px] max-h-[90vh] p-0 gap-0 rounded-none border-white/10 bg-[rgba(10,31,26,0.97)] backdrop-blur-xl">
                {/* Fixed Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/5">
                    <DialogTitle>New Visit Record</DialogTitle>
                    <DialogDescription className="text-xs">
                        Enter clinical data for this visit
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Content */}
                <ScrollArea className="max-h-[calc(90vh-180px)]">
                    <div className="px-6 py-4 space-y-5">
                        {/* Demographics */}
                        <div className="space-y-3">
                            <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5">
                                Demographics
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Age (years) *</Label>
                                    <Input
                                        type="number"
                                        className={`rounded-none border-white/10 bg-white/[0.03] text-[13px] ${fieldErrors.age ? 'border-destructive/40' : ''}`}
                                        value={formData.age}
                                        onChange={(e) => handleChange('age', e.target.value)}
                                        min={18} max={120}
                                        disabled={createMedicalData.isPending}
                                    />
                                    {fieldErrors.age && <p className="text-xs text-destructive">{fieldErrors.age[0]}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Gender *</Label>
                                    <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)} disabled={createMedicalData.isPending}>
                                        <SelectTrigger className="w-full rounded-none border-white/10 bg-white/[0.03] text-[13px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-white/10 bg-card">
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Ethnicity *</Label>
                                    <Select value={formData.ethnicity} onValueChange={(v) => handleChange('ethnicity', v)} disabled={createMedicalData.isPending}>
                                        <SelectTrigger className="w-full rounded-none border-white/10 bg-white/[0.03] text-[13px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-white/10 bg-card">
                                            {['Caucasian', 'African', 'Asian', 'Hispanic', 'Other'].map((e) => (
                                                <SelectItem key={e} value={e}>{e}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Clinical Data */}
                        <div className="space-y-3">
                            <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5">
                                Clinical Data
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {numFields.filter(f => f.key !== 'age').map((f) => (
                                    <div key={f.key} className="space-y-1.5">
                                        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{f.label} *</Label>
                                        <Input
                                            type="number"
                                            step={f.step}
                                            min={f.min}
                                            max={f.max}
                                            className={`rounded-none border-white/10 bg-white/[0.03] text-[13px] ${fieldErrors[f.key] ? 'border-destructive/40' : ''}`}
                                            value={formData[f.key as keyof typeof formData] as string}
                                            onChange={(e) => handleChange(f.key, e.target.value)}
                                            disabled={createMedicalData.isPending}
                                        />
                                        {f.hint && <span className="text-[10px] text-muted-foreground/60 italic">{f.hint}</span>}
                                        {fieldErrors[f.key] && <p className="text-xs text-destructive">{fieldErrors[f.key][0]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comorbidities */}
                        <div className="space-y-3">
                            <h3 className="text-[12px] font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/5">
                                Comorbidities
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {comorbidities.map((c) => (
                                    <label
                                        key={c.key}
                                        className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] border border-white/5 rounded-none cursor-pointer text-[13px] text-muted-foreground hover:bg-white/[0.04] transition-colors"
                                    >
                                        <Checkbox
                                            checked={formData[c.key as keyof typeof formData] as boolean}
                                            onCheckedChange={(checked) => handleChange(c.key, !!checked)}
                                            disabled={createMedicalData.isPending}
                                            className="rounded-none border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white"
                                        />
                                        <span>{c.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Fixed Footer */}
                <DialogFooter className="px-6 py-4 border-t border-white/5">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={createMedicalData.isPending}
                        className="rounded-none border-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createMedicalData.isPending}
                        className="rounded-none"
                    >
                        {createMedicalData.isPending ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
                        ) : (
                            <><Plus className="h-4 w-4 mr-2" /> Create Record</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}