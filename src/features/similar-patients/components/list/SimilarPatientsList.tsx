'use client';

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-24">
                {cases.map((c) => (
                    <SimilarPatientCard key={c.case_id} case={c} />
                ))}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto mb-24">
            {/* Table Header */}
            <div className="grid grid-cols-[1.2fr_1fr_1.8fr_1.5fr_1.2fr_0.8fr] gap-4 py-3 border-b border-white/[0.08] mb-1">
                {['Case ID', 'Similarity', 'Profile', 'Treatment', 'Outcome', 'Actions'].map((h, i) => (
                    <span
                        key={h}
                        className={`text-[10px] text-muted-foreground/50 font-semibold uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}
                    >
                        {h}
                    </span>
                ))}
            </div>
            {cases.map((c) => (
                <SimilarPatientTableRow key={c.case_id} case={c} />
            ))}
        </div>
    );
}