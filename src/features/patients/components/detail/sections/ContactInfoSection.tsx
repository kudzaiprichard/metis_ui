'use client';

import { useState, FormEvent } from 'react';
import { Card } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/src/components/shadcn/collapsible';
import { PatientDetail } from '../../../api/patients.types';
import { useUpdatePatientContact } from '../../../hooks/usePatients';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { ContactRound, ChevronUp, ChevronDown, Pencil, Check, Loader2, User, Mail, Phone } from 'lucide-react';

interface ContactInfoSectionProps {
    patient: PatientDetail;
}

export function ContactInfoSection({ patient }: ContactInfoSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [formData, setFormData] = useState({
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email || '',
        mobile_number: patient.mobile_number || '',
    });

    const updateContact = useUpdatePatientContact();
    const { showToast } = useToast();

    const handleCancel = () => {
        setIsEditing(false);
        setFieldErrors({});
        setFormData({
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email || '',
            mobile_number: patient.mobile_number || '',
        });
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        updateContact.mutate(
            { patientId: patient.id, data: formData },
            {
                onSuccess: () => {
                    showToast('Contact Updated', 'Patient contact information updated', 'success');
                    setIsEditing(false);
                },
                onError: (error: ApiError) => {
                    if (error.hasFieldErrors()) setFieldErrors(error.fieldErrors || {});
                    showToast('Update Failed', error.getMessage(), 'error');
                },
            }
        );
    };

    const fields = [
        { key: 'first_name', label: 'First Name', type: 'text', icon: User, placeholder: '' },
        { key: 'last_name', label: 'Last Name', type: 'text', icon: User, placeholder: '' },
        { key: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'email@example.com' },
        { key: 'mobile_number', label: 'Mobile', type: 'tel', icon: Phone, placeholder: '+263 77 123 4567' },
    ];

    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-none overflow-hidden p-0">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                    <button className="w-full px-5 py-3.5 flex justify-between items-center gap-3 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <ContactRound className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">Contact Information</span>
                            {!isExpanded && (
                                <span className="text-[12px] text-muted-foreground/50 truncate">
                                    {patient.email || 'No email'} &bull; {patient.mobile_number || 'No phone'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                            {isExpanded && !isEditing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2.5 rounded-none text-[11px] font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
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
                            {fields.map((f) => (
                                <div key={f.key} className="flex flex-col gap-1.5">
                                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <f.icon className="h-2.5 w-2.5 text-muted-foreground/40" />
                                        {f.label}
                                    </Label>
                                    <Input
                                        type={f.type}
                                        className={`rounded-none h-9 text-[13px] ${
                                            isEditing
                                                ? 'border-white/10 bg-white/[0.04]'
                                                : 'border-white/5 bg-white/[0.02] text-muted-foreground'
                                        } ${fieldErrors[f.key] ? 'border-red-500/40' : ''}`}
                                        value={formData[f.key as keyof typeof formData]}
                                        onChange={(e) => handleChange(f.key, e.target.value)}
                                        disabled={!isEditing}
                                        placeholder={f.placeholder}
                                    />
                                    {fieldErrors[f.key] && (
                                        <span className="text-[11px] text-red-500">{fieldErrors[f.key][0]}</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-2 mt-3.5 pt-3.5 border-t border-white/5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancel}
                                    disabled={updateContact.isPending}
                                    className="rounded-none border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-8 px-4 text-[12px] font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={updateContact.isPending}
                                    className="rounded-none bg-primary hover:bg-primary/80 text-primary-foreground border-0 h-8 px-4 text-[12px] font-semibold"
                                >
                                    {updateContact.isPending ? (
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