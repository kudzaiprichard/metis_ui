'use client';

import { useState, useEffect, FormEvent } from 'react';
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
import { useCreatePatient } from '../../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { Plus, Loader2, Info } from 'lucide-react';

interface CreatePatientModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreatePatientModal({ isOpen, onClose }: CreatePatientModalProps) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile_number: '',
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const createPatient = useCreatePatient();
    const { showToast } = useToast();

    useEffect(() => {
        if (!isOpen) {
            setFormData({ first_name: '', last_name: '', email: '', mobile_number: '' });
            setFieldErrors({});
        }
    }, [isOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        if (!formData.first_name || !formData.last_name) {
            showToast('Validation Error', 'First name and last name are required', 'error');
            return;
        }

        const submitData: { first_name: string; last_name: string; email?: string; mobile_number?: string } = {
            first_name: formData.first_name,
            last_name: formData.last_name,
        };
        if (formData.email) submitData.email = formData.email;
        if (formData.mobile_number) submitData.mobile_number = formData.mobile_number;

        createPatient.mutate(submitData, {
            onSuccess: () => {
                showToast('Patient Created', `${formData.first_name} ${formData.last_name} has been created successfully`, 'success');
                onClose();
            },
            onError: (error: ApiError) => {
                if (error.hasFieldErrors()) setFieldErrors(error.fieldErrors || {});
                showToast('Creation Failed', error.getMessage(), 'error');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-none border-primary/20 bg-[rgba(10,31,26,0.97)] backdrop-blur-xl shadow-2xl max-w-[480px] p-0 gap-0">
                <DialogHeader className="p-5 pb-4 border-b border-primary/10">
                    <DialogTitle className="text-[18px] font-semibold text-foreground">
                        Add New Patient
                    </DialogTitle>
                    <DialogDescription className="text-[12px] text-muted-foreground leading-relaxed">
                        Create a new patient record. You can add medical data later.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="p-5 flex flex-col gap-4">
                        {/* Name Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="John"
                                    className={`rounded-none border-white/10 bg-white/[0.04] h-9 text-[13px] ${fieldErrors.first_name ? 'border-red-500/40' : ''}`}
                                    value={formData.first_name}
                                    onChange={(e) => handleChange('first_name', e.target.value)}
                                    disabled={createPatient.isPending}
                                    required
                                />
                                {fieldErrors.first_name && <p className="text-[11px] text-red-500">{fieldErrors.first_name[0]}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Moyo"
                                    className={`rounded-none border-white/10 bg-white/[0.04] h-9 text-[13px] ${fieldErrors.last_name ? 'border-red-500/40' : ''}`}
                                    value={formData.last_name}
                                    onChange={(e) => handleChange('last_name', e.target.value)}
                                    disabled={createPatient.isPending}
                                    required
                                />
                                {fieldErrors.last_name && <p className="text-[11px] text-red-500">{fieldErrors.last_name[0]}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                Email Address <span className="text-muted-foreground/50 normal-case italic font-normal">(optional)</span>
                            </Label>
                            <Input
                                type="email"
                                placeholder="patient@example.com"
                                className={`rounded-none border-white/10 bg-white/[0.04] h-9 text-[13px] ${fieldErrors.email ? 'border-red-500/40' : ''}`}
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                disabled={createPatient.isPending}
                            />
                            {fieldErrors.email && <p className="text-[11px] text-red-500">{fieldErrors.email[0]}</p>}
                        </div>

                        {/* Mobile */}
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                Mobile Number <span className="text-muted-foreground/50 normal-case italic font-normal">(optional)</span>
                            </Label>
                            <Input
                                type="tel"
                                placeholder="+263 77 123 4567"
                                className={`rounded-none border-white/10 bg-white/[0.04] h-9 text-[13px] ${fieldErrors.mobile_number ? 'border-red-500/40' : ''}`}
                                value={formData.mobile_number}
                                onChange={(e) => handleChange('mobile_number', e.target.value)}
                                disabled={createPatient.isPending}
                            />
                            {fieldErrors.mobile_number && <p className="text-[11px] text-red-500">{fieldErrors.mobile_number[0]}</p>}
                        </div>

                        {/* Info Box */}
                        <div className="flex gap-3 p-3.5 bg-primary/[0.08] border border-primary/20 rounded-none">
                            <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[13px] font-medium text-foreground mb-1">Medical Data</p>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">
                                    Detailed medical information can be added after creating the patient record.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-5 pt-4 border-t border-primary/10 flex gap-2.5 sm:flex-row">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={createPatient.isPending}
                            className="flex-1 rounded-none border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-10 text-[13px] font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createPatient.isPending}
                            className="flex-1 rounded-none bg-primary hover:bg-primary/80 text-primary-foreground border-0 h-10 text-[13px] font-semibold"
                        >
                            {createPatient.isPending ? (
                                <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Creating...</>
                            ) : (
                                <><Plus className="h-3.5 w-3.5 mr-1.5" /> Create Patient</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}