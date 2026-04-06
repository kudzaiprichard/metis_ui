'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/src/components/shadcn/select';
import { useCreatePatient } from '../../../hooks/usePatients';
import { CreatePatientRequest, PatientGender } from '../../../api/patients.types';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { patientCreateSchema, type PatientCreateValues } from '@/src/lib/schemas/patients';
import { Plus, Loader2, Info } from 'lucide-react';

interface CreatePatientModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LIMITS = {
    NAME_MAX: 100,
    PHONE_MAX: 20,
    ADDRESS_MAX: 500,
} as const;

const emptyForm: PatientCreateValues = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    email: '',
    phone: '',
    address: '',
};

export function CreatePatientModal({ isOpen, onClose }: CreatePatientModalProps) {
    const createPatient = useCreatePatient();
    const { showToast } = useToast();

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PatientCreateValues>({
        resolver: zodResolver(patientCreateSchema),
        defaultValues: emptyForm,
    });

    useEffect(() => {
        if (!isOpen) reset(emptyForm);
    }, [isOpen, reset]);

    const onSubmit = (values: PatientCreateValues) => {
        const payload: CreatePatientRequest = {
            first_name: values.firstName.trim(),
            last_name: values.lastName.trim(),
            date_of_birth: values.dateOfBirth,
            gender: values.gender,
        };
        if (values.email) payload.email = values.email.trim();
        if (values.phone) payload.phone = values.phone.trim();
        if (values.address) payload.address = values.address.trim();

        createPatient.mutate(payload, {
            onSuccess: () => {
                showToast(
                    'Patient Created',
                    `${payload.first_name} ${payload.last_name} has been created successfully`,
                    'success',
                );
                onClose();
            },
            onError: (error: ApiError) => {
                showToast('Creation Failed', error.getMessage(), 'error');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-lg border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl max-w-[520px] p-0 gap-0">
                <DialogHeader className="p-5 pb-4 border-b border-primary/10">
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        Add New Patient
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                        Create a new patient record. Medical records can be added afterwards.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="p-5 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="John"
                                    maxLength={LIMITS.NAME_MAX}
                                    disabled={createPatient.isPending}
                                    aria-invalid={!!errors.firstName}
                                    {...register('firstName')}
                                    className="rounded-lg border-white/10 bg-white/[0.04] h-9 text-base"
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-destructive">
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Moyo"
                                    maxLength={LIMITS.NAME_MAX}
                                    disabled={createPatient.isPending}
                                    aria-invalid={!!errors.lastName}
                                    {...register('lastName')}
                                    className="rounded-lg border-white/10 bg-white/[0.04] h-9 text-base"
                                />
                                {errors.lastName && (
                                    <p className="text-xs text-destructive">
                                        {errors.lastName.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Date of Birth <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="date"
                                    disabled={createPatient.isPending}
                                    aria-invalid={!!errors.dateOfBirth}
                                    {...register('dateOfBirth')}
                                    className="rounded-lg border-white/10 bg-white/[0.04] h-9 text-base"
                                />
                                {errors.dateOfBirth && (
                                    <p className="text-xs text-destructive">
                                        {errors.dateOfBirth.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Gender <span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name="gender"
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={(v) => field.onChange(v as PatientGender)}
                                            disabled={createPatient.isPending}
                                        >
                                            <SelectTrigger className="w-full rounded-lg border-white/10 bg-white/[0.04] h-9 text-base">
                                                <SelectValue placeholder="Select…" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg border-white/10 bg-card">
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.gender && (
                                    <p className="text-xs text-destructive">
                                        {errors.gender.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Email Address{' '}
                                <span className="text-muted-foreground/50 normal-case italic font-normal">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                type="email"
                                placeholder="patient@example.com"
                                disabled={createPatient.isPending}
                                aria-invalid={!!errors.email}
                                {...register('email')}
                                className="rounded-lg border-white/10 bg-white/[0.04] h-9 text-base"
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Phone{' '}
                                <span className="text-muted-foreground/50 normal-case italic font-normal">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                type="tel"
                                placeholder="+263 77 123 4567"
                                maxLength={LIMITS.PHONE_MAX}
                                disabled={createPatient.isPending}
                                aria-invalid={!!errors.phone}
                                {...register('phone')}
                                className="rounded-lg border-white/10 bg-white/[0.04] h-9 text-base"
                            />
                            {errors.phone && (
                                <p className="text-xs text-destructive">{errors.phone.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Address{' '}
                                <span className="text-muted-foreground/50 normal-case italic font-normal">
                                    (optional)
                                </span>
                            </Label>
                            <Input
                                type="text"
                                placeholder="123 Main St, Harare"
                                maxLength={LIMITS.ADDRESS_MAX}
                                disabled={createPatient.isPending}
                                aria-invalid={!!errors.address}
                                {...register('address')}
                                className="rounded-lg border-white/10 bg-white/[0.04] h-9 text-base"
                            />
                            {errors.address && (
                                <p className="text-xs text-destructive">{errors.address.message}</p>
                            )}
                        </div>

                        <div className="flex gap-3 p-3.5 bg-primary/[0.08] border border-primary/20 rounded-lg">
                            <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-base font-medium text-foreground mb-1">
                                    Medical Records
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Clinical data can be added via a medical record on the patient
                                    detail page.
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
                            className="flex-1 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-10 text-base font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createPatient.isPending}
                            className="flex-1 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground border-0 h-10 text-base font-semibold"
                        >
                            {createPatient.isPending ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                    Create Patient
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
