'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/shadcn/button';
import { TableCell, TableRow } from '@/src/components/shadcn/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/src/components/shadcn/tooltip';
import { Patient } from '../../api/patients.types';
import { Eye, Trash2 } from 'lucide-react';

interface PatientTableRowProps {
    patient: Patient;
    onDelete: (patient: Patient) => void;
}

export function PatientTableRow({ patient, onDelete }: PatientTableRowProps) {
    const router = useRouter();

    const getInitials = () =>
        `${patient.firstName?.charAt(0) ?? ''}${patient.lastName?.charAt(0) ?? ''}`.toUpperCase();

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const handleView = () => router.push(`/doctor/patients/${patient.id}`);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(patient);
    };

    return (
        <TableRow
            className="hover:bg-white/[0.03] border-b border-white/5 cursor-pointer"
            onClick={handleView}
        >
            {/* Patient */}
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center text-base font-semibold text-foreground flex-shrink-0">
                        {getInitials()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-semibold text-foreground truncate">
                            {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            ID: {patient.id.slice(0, 8)}
                        </p>
                    </div>
                </div>
            </TableCell>

            {/* Gender */}
            <TableCell className="text-sm">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-muted-foreground capitalize">
                    {patient.gender || '—'}
                </span>
            </TableCell>

            {/* Email */}
            <TableCell className="text-base text-muted-foreground truncate max-w-[200px]">
                {patient.email || 'Not provided'}
            </TableCell>

            {/* Mobile */}
            <TableCell className="text-base text-muted-foreground">
                {patient.phone || 'Not provided'}
            </TableCell>

            {/* Created */}
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(patient.createdAt)}
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
                <TooltipProvider>
                    <div className="flex items-center justify-end gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg"
                                    onClick={handleView}
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>View</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Delete</p></TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </TableCell>
        </TableRow>
    );
}