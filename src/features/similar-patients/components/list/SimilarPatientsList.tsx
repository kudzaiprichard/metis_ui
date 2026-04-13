'use client';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/src/components/shadcn/table';
import { SimilarPatientCase } from '../../api/similar-patients.types';
import { SimilarPatientCard } from './SimilarPatientCard';
import { SimilarPatientTableRow } from './SimilarPatientTableRow';

interface SimilarPatientsListProps {
    cases: SimilarPatientCase[];
    viewMode: 'cards' | 'table';
}

export function SimilarPatientsList({ cases, viewMode }: SimilarPatientsListProps) {
    if (viewMode === 'cards') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 mb-24">
                {cases.map((c) => (
                    <SimilarPatientCard key={c.caseId} case={c} />
                ))}
            </div>
        );
    }

    return (
        <div className="mb-24">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-white/[0.08] hover:bg-transparent">
                        <TableHead className="w-0 p-0" aria-hidden="true" />
                        <TableHead className="text-xs text-muted-foreground/50 font-semibold uppercase tracking-wider">
                            Case ID
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground/50 font-semibold uppercase tracking-wider">
                            Similarity
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground/50 font-semibold uppercase tracking-wider">
                            Profile
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground/50 font-semibold uppercase tracking-wider">
                            Treatment
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground/50 font-semibold uppercase tracking-wider">
                            Outcome
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground/50 font-semibold uppercase tracking-wider text-right">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cases.map((c) => (
                        <SimilarPatientTableRow key={c.caseId} case={c} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
