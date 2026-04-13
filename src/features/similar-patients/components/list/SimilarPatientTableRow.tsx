'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/shadcn/button';
import { TableCell, TableRow } from '@/src/components/shadcn/table';
import { SimilarPatientCase } from '../../api/similar-patients.types';
import {
    IdCard,
    Percent,
    User,
    ChartLine,
    TrendingDown,
    CheckCircle,
    XCircle,
    Clock,
    TriangleAlert,
    Eye,
} from 'lucide-react';

interface SimilarPatientTableRowProps {
    case: SimilarPatientCase;
}

export function SimilarPatientTableRow({ case: patientCase }: SimilarPatientTableRowProps) {
    const router = useRouter();

    const handleView = () => {
        router.push(`/doctor/similar-patients/${patientCase.caseId}`);
    };

    const similarityScore = (patientCase.similarityScore * 100).toFixed(1);
    const clinicalSimilarity = (patientCase.clinicalSimilarity * 100).toFixed(0);
    const comorbiditySimilarity = (patientCase.comorbiditySimilarity * 100).toFixed(0);

    const outcome = patientCase.outcome;
    const hba1cReduction = outcome ? outcome.hba1cReduction : null;
    const hba1cFollowup = outcome ? outcome.hba1cFollowup : null;
    const hasAdverseEvents =
        !!outcome?.adverseEvents &&
        outcome.adverseEvents.trim() !== '' &&
        outcome.adverseEvents.toLowerCase() !== 'none';

    const getSimilarityStyle = (score: number) => {
        if (score >= 0.8) return 'text-emerald-400';
        if (score >= 0.6) return 'text-info';
        return 'text-orange-400';
    };

    return (
        <TableRow
            onClick={handleView}
            className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer group relative"
        >
            {/* Hover accent */}
            <TableCell className="p-0 w-0 relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary opacity-0 group-hover:opacity-80 transition-opacity" />
            </TableCell>

            {/* Case ID */}
            <TableCell className="py-3.5 align-middle">
                <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-xs font-semibold text-foreground/90 max-w-full">
                    <IdCard className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                    <span className="truncate">{patientCase.caseId}</span>
                </div>
            </TableCell>

            {/* Similarity */}
            <TableCell className="py-3.5 align-middle">
                <div className="flex flex-col gap-1">
                    <div className={`flex items-center gap-1.5 text-md font-bold ${getSimilarityStyle(patientCase.similarityScore)}`}>
                        <Percent className="h-3 w-3" />
                        {similarityScore}%
                    </div>
                    <div className="text-xs text-muted-foreground/50 font-medium">
                        C: {clinicalSimilarity}% • Co: {comorbiditySimilarity}%
                    </div>
                </div>
            </TableCell>

            {/* Profile */}
            <TableCell className="py-3.5 align-middle">
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm text-foreground/70 truncate">
                        <User className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                        {patientCase.profile.age} yrs • {patientCase.profile.gender} • {patientCase.profile.ethnicity}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-foreground/70 truncate">
                        <ChartLine className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                        HbA1c: {patientCase.profile.hba1cBaseline}% • BMI: {patientCase.profile.bmi}
                    </div>
                </div>
            </TableCell>

            {/* Treatment */}
            <TableCell className="py-3.5 align-middle">
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-primary truncate">{patientCase.treatmentGiven}</span>
                    <span className="text-xs text-primary/60 truncate">({patientCase.drugClass})</span>
                </div>
            </TableCell>

            {/* Outcome */}
            <TableCell className="py-3.5 align-middle">
                <div className="flex flex-col gap-1.5 min-w-0">
                    {outcome ? (
                        <>
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                                <TrendingDown className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                    {hba1cReduction !== null ? `${hba1cReduction.toFixed(2)}%` : '—'} reduction
                                    {hba1cFollowup !== null && ` • ${hba1cFollowup.toFixed(1)}% follow-up`}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${outcome.success ? 'bg-primary/[0.12] text-primary' : 'bg-red-500/[0.12] text-red-400'}`}>
                                    {outcome.success ? <CheckCircle className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                                    {outcome.outcomeCategory || (outcome.success ? 'Success' : 'Failed')}
                                </div>
                                {outcome.timeToTarget && outcome.timeToTarget.toLowerCase() !== 'unknown' && (
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-white/[0.06] text-muted-foreground/70">
                                        <Clock className="h-2.5 w-2.5" />
                                        {outcome.timeToTarget}
                                    </div>
                                )}
                                {hasAdverseEvents && (
                                    <div
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-orange-500/[0.12] text-orange-400 max-w-[140px]"
                                        title={outcome.adverseEvents}
                                    >
                                        <TriangleAlert className="h-2.5 w-2.5 flex-shrink-0" />
                                        <span className="truncate">{outcome.adverseEvents}</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <span className="text-xs text-muted-foreground/50 italic">Outcome not recorded</span>
                    )}
                </div>
            </TableCell>

            {/* Actions */}
            <TableCell className="py-3.5 align-middle text-right">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleView();
                    }}
                    className="h-8 w-8 rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted-foreground/40 hover:bg-info/[0.12] hover:border-info/30 hover:text-info"
                >
                    <Eye className="h-3.5 w-3.5" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
