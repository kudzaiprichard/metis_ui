'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Card } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/src/components/shadcn/collapsible';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/src/components/shadcn/select';
import {
    PatientDetail,
    PatientGender,
    UpdatePatientRequest,
} from '../../../api/patients.types';
import { useUpdatePatient } from '../../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import {
    ContactRound,
    ChevronUp,
    ChevronDown,
    Pencil,
    Check,
    Loader2,
    User,
    Mail,
    Phone,
    Cake,
    VenusAndMars,
    MapPin,
} from 'lucide-react';

interface ContactInfoSectionProps {
    patient: PatientDetail;
}

// Spec §5 CreatePatientRequest / UpdatePatientRequest constraints.
const LIMITS = {
    NAME_MAX: 100,
    PHONE_MAX: 20,
    ADDRESS_MAX: 500,
} as const;

type FormState = {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: PatientGender | '';
    email: string;
    phone: string;
    address: string;
};

const fromPatient = (p: PatientDetail): FormState => ({
    first_name: p.firstName,
    last_name: p.lastName,
    date_of_birth: p.dateOfBirth,
    gender: (p.gender as PatientGender) ?? '',
    email: p.email ?? '',
    phone: p.phone ?? '',
    address: p.address ?? '',
});

export function ContactInfoSection({ patient }: ContactInfoSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [formData, setFormData] = useState<FormState>(() => fromPatient(patient));

    const updatePatient = useUpdatePatient();
    const { showToast } = useToast();

    // Re-sync when the patient record changes (e.g. query invalidation).
    useEffect(() => {
        setFormData(fromPatient(patient));
    }, [patient]);

    const handleCancel = () => {
        setIsEditing(false);
        setFieldErrors({});
        setFormData(fromPatient(patient));
    };

    const handleChange = (field: keyof FormState, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
        }
    };

    const validateLocally = (): string | null => {
        if (!formData.first_name.trim() || formData.first_name.length > LIMITS.NAME_MAX) {
            return 'First name is required (1–100 characters)';
        }
        if (!formData.last_name.trim() || formData.last_name.length > LIMITS.NAME_MAX) {
            return 'Last name is required (1–100 characters)';
        }
        if (!formData.date_of_birth) {
            return 'Date of birth is required';
        }
        if (!formData.gender) {
            return 'Gender is required';
        }
        if (formData.phone && formData.phone.length > LIMITS.PHONE_MAX) {
            return `Phone must be at most ${LIMITS.PHONE_MAX} characters`;
        }
        if (formData.address && formData.address.length > LIMITS.ADDRESS_MAX) {
            return `Address must be at most ${LIMITS.ADDRESS_MAX} characters`;
        }
        return null;
    };

    // Spec PATCH is partial — only send what actually changed so we don't
    // clobber fields the user didn't touch.
    const diff = (): UpdatePatientRequest => {
        const original = fromPatient(patient);
        const out: UpdatePatientRequest = {};
        if (formData.first_name !== original.first_name) out.first_name = formData.first_name.trim();
        if (formData.last_name !== original.last_name) out.last_name = formData.last_name.trim();
        if (formData.date_of_birth !== original.date_of_birth) out.date_of_birth = formData.date_of_birth;
        if (formData.gender !== original.gender && formData.gender) out.gender = formData.gender;
        if (formData.email !== original.email) out.email = formData.email.trim();
        if (formData.phone !== original.phone) out.phone = formData.phone.trim();
        if (formData.address !== original.address) out.address = formData.address.trim();
        return out;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const validationError = validateLocally();
        if (validationError) {
            showToast('Validation Error', validationError, 'error');
            return;
        }

        const data = diff();
        if (Object.keys(data).length === 0) {
            setIsEditing(false);
            return;
        }

        updatePatient.mutate(
            { patientId: patient.id, data },
            {
                onSuccess: () => {
                    showToast('Patient Updated', 'Patient details updated successfully', 'success');
                    setIsEditing(false);
                },
                onError: (error: ApiError) => {
                    if (error.hasFieldErrors()) setFieldErrors(error.fieldErrors || {});
                    showToast('Update Failed', error.getMessage(), 'error');
                },
            }
        );
    };

    const err = (field: string) =>
        fieldErrors[field]?.[0] ?? fieldErrors[`body.${field}`]?.[0];

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg overflow-hidden p-0">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                    <button className="w-full px-5 py-3.5 flex justify-between items-center gap-3 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <ContactRound className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-base font-semibold text-foreground whitespace-nowrap">Patient Details</span>
                            {!isExpanded && (
                                <span className="text-sm text-muted-foreground/50 truncate">
                                    {patient.email || 'No email'} &bull; {patient.phone || 'No phone'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                            {isExpanded && !isEditing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                                >
                                    <Pencil className="h-3 w-3 mr-1" />
                                    Edit
                                </Button>
                            )}
                            {isExpanded ? (
                                <ChevronUp className="h-3 w-3 text-muted-foreground/40" />
                            ) : (
                                <ChevronDown className="h-3 w-3 text-muted-foreground/40" />
                            )}
                        </div>
                    </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <form className="px-5 pb-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-3">
                            {/* First / Last Name */}
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <User className="h-2.5 w-2.5 text-muted-foreground/40" />
                                    First Name
                                </Label>
                                <Input
                                    type="text"
                                    maxLength={LIMITS.NAME_MAX}
                                    className={`rounded-lg h-9 text-base ${isEditing ? 'border-white/10 bg-white/[0.04]' : 'border-white/5 bg-white/[0.02] text-muted-foreground'} ${err('first_name') ? 'border-red-500/40' : ''}`}
                                    value={formData.first_name}
                                    onChange={(e) => handleChange('first_name', e.target.value)}
                                    disabled={!isEditing || updatePatient.isPending}
                                />
                                {err('first_name') && <span className="text-xs text-red-500">{err('first_name')}</span>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <User className="h-2.5 w-2.5 text-muted-foreground/40" />
                                    Last Name
                                </Label>
                                <Input
                                    type="text"
                                    maxLength={LIMITS.NAME_MAX}
                                    className={`rounded-lg h-9 text-base ${isEditing ? 'border-white/10 bg-white/[0.04]' : 'border-white/5 bg-white/[0.02] text-muted-foreground'} ${err('last_name') ? 'border-red-500/40' : ''}`}
                                    value={formData.last_name}
                                    onChange={(e) => handleChange('last_name', e.target.value)}
                                    disabled={!isEditing || updatePatient.isPending}
                                />
                                {err('last_name') && <span className="text-xs text-red-500">{err('last_name')}</span>}
                            </div>

                            {/* DOB / Gender */}
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Cake className="h-2.5 w-2.5 text-muted-foreground/40" />
                                    Date of Birth
                                </Label>
                                <Input
                                    type="date"
                                    className={`rounded-lg h-9 text-base ${isEditing ? 'border-white/10 bg-white/[0.04]' : 'border-white/5 bg-white/[0.02] text-muted-foreground'} ${err('date_of_birth') ? 'border-red-500/40' : ''}`}
                                    value={formData.date_of_birth}
                                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                                    disabled={!isEditing || updatePatient.isPending}
                                />
                                {err('date_of_birth') && <span className="text-xs text-red-500">{err('date_of_birth')}</span>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <VenusAndMars className="h-2.5 w-2.5 text-muted-foreground/40" />
                                    Gender
                                </Label>
                                {isEditing ? (
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(v) => handleChange('gender', v)}
                                        disabled={updatePatient.isPending}
                                    >
                                        <SelectTrigger
                                            className={`w-full rounded-lg border-white/10 bg-white/[0.04] h-9 text-base ${err('gender') ? 'border-red-500/40' : ''}`}
                                        >
                                            <SelectValue placeholder="Select…" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-white/10 bg-card">
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        type="text"
                                        className="rounded-lg h-9 text-base border-white/5 bg-white/[0.02] text-muted-foreground capitalize"
                                        value={formData.gender}
                                        disabled
                                    />
                                )}
                                {err('gender') && <span className="text-xs text-red-500">{err('gender')}</span>}
                            </div>

                            {/* Email / Phone */}
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Mail className="h-2.5 w-2.5 text-muted-foreground/40" />
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    className={`rounded-lg h-9 text-base ${isEditing ? 'border-white/10 bg-white/[0.04]' : 'border-white/5 bg-white/[0.02] text-muted-foreground'} ${err('email') ? 'border-red-500/40' : ''}`}
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    disabled={!isEditing || updatePatient.isPending}
                                    placeholder="email@example.com"
                                />
                                {err('email') && <span className="text-xs text-red-500">{err('email')}</span>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Phone className="h-2.5 w-2.5 text-muted-foreground/40" />
                                    Phone
                                </Label>
                                <Input
                                    type="tel"
                                    maxLength={LIMITS.PHONE_MAX}
                                    className={`rounded-lg h-9 text-base ${isEditing ? 'border-white/10 bg-white/[0.04]' : 'border-white/5 bg-white/[0.02] text-muted-foreground'} ${err('phone') ? 'border-red-500/40' : ''}`}
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    disabled={!isEditing || updatePatient.isPending}
                                    placeholder="+263 77 123 4567"
                                />
                                {err('phone') && <span className="text-xs text-red-500">{err('phone')}</span>}
                            </div>

                            {/* Address — full-width */}
                            <div className="flex flex-col gap-1.5 col-span-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <MapPin className="h-2.5 w-2.5 text-muted-foreground/40" />
                                    Address
                                </Label>
                                <Input
                                    type="text"
                                    maxLength={LIMITS.ADDRESS_MAX}
                                    className={`rounded-lg h-9 text-base ${isEditing ? 'border-white/10 bg-white/[0.04]' : 'border-white/5 bg-white/[0.02] text-muted-foreground'} ${err('address') ? 'border-red-500/40' : ''}`}
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    disabled={!isEditing || updatePatient.isPending}
                                    placeholder="123 Main St, Harare"
                                />
                                {err('address') && <span className="text-xs text-red-500">{err('address')}</span>}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-2 mt-3.5 pt-3.5 border-t border-white/5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancel}
                                    disabled={updatePatient.isPending}
                                    className="rounded-lg border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-8 px-4 text-sm font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={updatePatient.isPending}
                                    className="rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground border-0 h-8 px-4 text-sm font-semibold"
                                >
                                    {updatePatient.isPending ? (
                                        <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Saving...</>
                                    ) : (
                                        <><Check className="h-3 w-3 mr-1.5" /> Save</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </form>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
