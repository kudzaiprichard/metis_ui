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
import { PatientMedicalData } from '../../../api/patients.types';
import { useUpdatePatientMedicalData } from '../../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { Check, Loader2 } from 'lucide-react';

type GenderType = 'Male' | 'Female';
type EthnicityType = 'Caucasian' | 'African' | 'Asian' | 'Hispanic' | 'Other';

interface EditMedicalRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: PatientMedicalData | null;
    patientId: string;
}

export function EditMedicalRecordModal({ isOpen, onClose, record, patientId }: EditMedicalRecordModalProps) {
    const [formData, setFormData] = useState<Record<string, string | boolean>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const updateMedicalData = useUpdatePatientMedicalData();
    const { showToast } = useToast();

    useEffect(() => {
        if (record) {
            setFormData({
                age: String(record.age),
                gender: record.gender,
                ethnicity: record.ethnicity,
                hba1c_baseline: record.hba1c_baseline,
                diabetes_duration: record.diabetes_duration,
                fasting_glucose: record.fasting_glucose,
                c_peptide: record.c_peptide,
                egfr: record.egfr,
                bmi: record.bmi,
                bp_systolic: String(record.bp_systolic),
                bp_diastolic: String(record.bp_diastolic),
                alt: record.alt,
                ldl: record.ldl,
                hdl: record.hdl,
                triglycerides: record.triglycerides,
                previous_prediabetes: record.previous_prediabetes,
                hypertension: record.hypertension,
                ckd: record.ckd,
                cvd: record.cvd,
                nafld: record.nafld,
                retinopathy: record.retinopathy,
            });
        }
        if (!isOpen) setFieldErrors({});
    }, [record, isOpen]);

    if (!record) return null;

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

        updateMedicalData.mutate(
            {
                medicalDataId: record.id,
                patientId,
                data: {
                    age: Number(formData.age),
                    gender: formData.gender as GenderType,
                    ethnicity: formData.ethnicity as EthnicityType,
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
                    previous_prediabetes: formData.previous_prediabetes as boolean,
                    hypertension: formData.hypertension as boolean,
                    ckd: formData.ckd as boolean,
                    cvd: formData.cvd as boolean,
                    nafld: formData.nafld as boolean,
                    retinopathy: formData.retinopathy as boolean,
                },
            },
            {
                onSuccess: () => {
                    showToast('Record Updated', 'Medical record has been updated successfully', 'success');
                    onClose();
                },
                onError: (error: ApiError) => {
                    if (error.hasFieldErrors()) setFieldErrors(error.fieldErrors || {});
                    showToast('Update Failed', error.getMessage(), 'error');
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
                    <DialogTitle>Edit Medical Record</DialogTitle>
                    <DialogDescription className="text-xs">
                        Visit: {new Date(record.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Content */}
                <ScrollArea className="max-h-[calc(90vh-180px)]">
                    <div className="px-6 py-4 space-y-5">
                        {/* Demographics */}
                        <div className="space-y-3">
                            <h3 className="text-[12px] font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-white/5">
                                Demographics
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Age (years) *</Label>
                                    <Input
                                        type="number"
                                        className={`rounded-none border-white/10 bg-white/[0.03] text-[13px] ${fieldErrors.age ? 'border-destructive/40' : ''}`}
                                        value={formData.age as string}
                                        onChange={(e) => handleChange('age', e.target.value)}
                                        min={18} max={120}
                                        disabled={updateMedicalData.isPending}
                                    />
                                    {fieldErrors.age && <p className="text-xs text-destructive">{fieldErrors.age[0]}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Gender *</Label>
                                    <Select value={formData.gender as string} onValueChange={(v) => handleChange('gender', v)} disabled={updateMedicalData.isPending}>
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
                                    <Select value={formData.ethnicity as string} onValueChange={(v) => handleChange('ethnicity', v)} disabled={updateMedicalData.isPending}>
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
                            <h3 className="text-[12px] font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-white/5">
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
                                            value={formData[f.key] as string}
                                            onChange={(e) => handleChange(f.key, e.target.value)}
                                            disabled={updateMedicalData.isPending}
                                        />
                                        {f.hint && <span className="text-[10px] text-muted-foreground/60 italic">{f.hint}</span>}
                                        {fieldErrors[f.key] && <p className="text-xs text-destructive">{fieldErrors[f.key][0]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comorbidities */}
                        <div className="space-y-3">
                            <h3 className="text-[12px] font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-white/5">
                                Comorbidities
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {comorbidities.map((c) => (
                                    <label
                                        key={c.key}
                                        className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] border border-white/5 rounded-none cursor-pointer text-[13px] text-muted-foreground hover:bg-white/[0.04] transition-colors"
                                    >
                                        <Checkbox
                                            checked={formData[c.key] as boolean}
                                            onCheckedChange={(checked) => handleChange(c.key, !!checked)}
                                            disabled={updateMedicalData.isPending}
                                            className="rounded-none border-white/20 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400 data-[state=checked]:text-black"
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
                        disabled={updateMedicalData.isPending}
                        className="rounded-none border-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={updateMedicalData.isPending}
                        className="rounded-none bg-amber-500 hover:bg-amber-400 text-black"
                    >
                        {updateMedicalData.isPending ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                        ) : (
                            <><Check className="h-4 w-4 mr-2" /> Save Changes</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}