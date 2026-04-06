'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/src/components/shadcn/tooltip';
import { Patient } from '../../api/patients.types';
import { Eye, Trash2, Mail, Phone, Calendar } from 'lucide-react';

interface PatientCardProps {
    patient: Patient;
    onDelete: (patient: Patient) => void;
}

export function PatientCard({ patient, onDelete }: PatientCardProps) {
    const router = useRouter();

    const getInitials = () =>
        `${patient.firstName?.charAt(0) ?? ''}${patient.lastName?.charAt(0) ?? ''}`.toUpperCase();

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const handleViewDetails = () => router.push(`/doctor/patients/${patient.id}`);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(patient);
    };

    return (
        <Card
            className="cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 active:scale-[0.98] active:opacity-90 border-white/10 bg-card/30 backdrop-blur-sm rounded-lg overflow-hidden p-0"
            onClick={handleViewDetails}
        >
            <CardContent className="p-4 flex flex-col gap-0">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3.5 pb-3 border-b border-white/[0.06]">
                    <div className="w-10 h-10 rounded-lg bg-primary/80 flex items-center justify-center text-primary-foreground font-semibold text-md flex-shrink-0">
                        {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-md font-semibold text-foreground truncate">
                            {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground/50 font-medium">
                            ID: {patient.id.slice(0, 8)}
                        </p>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border border-white/10 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Delete</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Info Items */}
                <div className="flex flex-col gap-2 mb-3">
                    {[
                        { icon: Mail, label: 'Email', value: patient.email || 'Not provided' },
                        { icon: Phone, label: 'Mobile', value: patient.phone || 'Not provided' },
                        { icon: Calendar, label: 'Created', value: formatDate(patient.createdAt) },
                    ].map((item) => (
                        <div key={item.label} className="flex items-start gap-2.5 p-2 bg-white/[0.02] rounded-lg">
                            <item.icon className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col gap-px min-w-0 flex-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                    {item.label}
                                </span>
                                <span className="text-base text-foreground/90 truncate">
                                    {item.value}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-white/[0.06]">
                    <Button
                        variant="ghost"
                        className="w-full h-9 rounded-lg text-base font-semibold text-primary hover:text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20"
                        onClick={handleViewDetails}
                    >
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}