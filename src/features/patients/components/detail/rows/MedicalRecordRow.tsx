'use client';

import Link from 'next/link';
import { TableCell, TableRow } from '@/src/components/shadcn/table';
import { Button } from '@/src/components/shadcn/button';
import { MedicalRecord } from '../../../api/patients.types';
import type { PredictionResponse } from '@/src/features/recommendation/api/recommendations.types';
import { Eye, ListChecks, Pill } from 'lucide-react';

interface MedicalRecordRowProps {
    record: MedicalRecord;
    index: number;
    prediction?: PredictionResponse;
    onView: () => void;
}

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

export function MedicalRecordRow({
    record,
    index,
    prediction,
    onView,
}: MedicalRecordRowProps) {
    const comorbidityCount = [
        record.hypertension,
        record.ckd,
        record.cvd,
        record.nafld,
    ].filter((v) => v === 1).length;

    return (
        <TableRow
            onClick={onView}
            className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer"
        >
            <TableCell className="py-3 align-middle">
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Visit {index}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                        {formatDate(record.createdAt)}
                    </span>
                </div>
            </TableCell>
            <TableCell className="py-3 align-middle text-sm font-semibold text-foreground tabular-nums">
                {Number(record.hba1cBaseline).toFixed(1)}%
            </TableCell>
            <TableCell className="py-3 align-middle text-sm text-foreground tabular-nums">
                {Number(record.bmi).toFixed(1)}
            </TableCell>
            <TableCell className="py-3 align-middle text-sm text-foreground tabular-nums">
                {Number(record.egfr).toFixed(0)}
            </TableCell>
            <TableCell className="py-3 align-middle text-sm text-foreground tabular-nums">
                {record.bpSystolic}
            </TableCell>
            <TableCell className="py-3 align-middle">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-muted-foreground">
                    <ListChecks className="h-3 w-3" />
                    {comorbidityCount}
                </div>
            </TableCell>
            <TableCell className="py-3 align-middle">
                {prediction ? (
                    <Link
                        href={`/doctor/recommendations/${prediction.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors"
                    >
                        <Pill className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">
                            {prediction.recommendedTreatment}
                        </span>
                    </Link>
                ) : (
                    <span className="text-xs text-muted-foreground/50 italic">
                        No prediction
                    </span>
                )}
            </TableCell>
            <TableCell className="py-3 align-middle text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onView();
                    }}
                    className="h-8 w-8 rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted-foreground/60 hover:bg-info/[0.12] hover:border-info/30 hover:text-info"
                    aria-label="View record"
                >
                    <Eye className="h-3.5 w-3.5" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
