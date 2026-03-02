'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/shadcn/button';
import { SimilarPatientCase } from '../../api/similar-patients.types';
import {
    IdCard,
    Percent,
    User,
    ChartLine,
    TrendingDown,
    CheckCircle,
    XCircle,
    Eye,
} from 'lucide-react';

interface SimilarPatientTableRowProps {
    case: SimilarPatientCase;
}

export function SimilarPatientTableRow({ case: patientCase }: SimilarPatientTableRowProps) {
    const router = useRouter();

    const handleView = () => {
        router.push(`/doctor/similar-patients/${patientCase.case_id}`);
    };

    const similarityScore = (patientCase.similarity_score * 100).toFixed(1);
    const clinicalSimilarity = (patientCase.clinical_similarity * 100).toFixed(0);
    const comorbiditySimilarity = (patientCase.comorbidity_similarity * 100).toFixed(0);
    const hba1cReduction = parseFloat(patientCase.outcome.hba1c_reduction);

    const getSimilarityStyle = (score: number) => {
        if (score >= 0.8) return 'text-emerald-400';
        if (score >= 0.6) return 'text-blue-400';
        return 'text-orange-400';
    };

    return (
        <div
            className="grid grid-cols-[1.2fr_1fr_1.8fr_1.5fr_1.2fr_0.8fr] gap-4 py-3.5 border-b border-white/[0.04] items-center cursor-pointer hover:bg-white/[0.03] transition-colors group relative"
            onClick={handleView}
        >
            {/* Hover accent */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary opacity-0 group-hover:opacity-80 transition-opacity" />

            {/* Case ID */}
            <div className="min-w-0">
                <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-none text-[11px] font-semibold text-foreground/90 max-w-full">
                    <IdCard className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                    <span className="truncate">{patientCase.case_id}</span>
                </div>
            </div>

            {/* Similarity */}
            <div className="flex flex-col gap-1">
                <div className={`flex items-center gap-1.5 text-[14px] font-bold ${getSimilarityStyle(patientCase.similarity_score)}`}>
                    <Percent className="h-3 w-3" />
                    {similarityScore}%
                </div>
                <div className="text-[10px] text-muted-foreground/50 font-medium">
                    C: {clinicalSimilarity}% • Co: {comorbiditySimilarity}%
                </div>
            </div>

            {/* Profile */}
            <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[12px] text-foreground/70 truncate">
                    <User className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                    {patientCase.profile.age} yrs • {patientCase.profile.gender} • {patientCase.profile.ethnicity}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-foreground/70 truncate">
                    <ChartLine className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                    HbA1c: {patientCase.profile.hba1c_baseline}% • BMI: {patientCase.profile.bmi}
                </div>
            </div>

            {/* Treatment */}
            <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[12px] font-semibold text-primary truncate">{patientCase.treatment_given}</span>
                <span className="text-[10px] text-primary/60 truncate">({patientCase.drug_class})</span>
            </div>

            {/* Outcome */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-primary">
                    <TrendingDown className="h-3 w-3" />
                    {hba1cReduction.toFixed(2)}%
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-semibold w-fit ${patientCase.outcome.success ? 'bg-primary/[0.12] text-primary' : 'bg-red-500/[0.12] text-red-400'}`}>
                    {patientCase.outcome.success ? <CheckCircle className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                    {patientCase.outcome.success ? 'Success' : 'Failed'}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleView}
                    className="h-8 w-8 rounded-none border border-white/[0.08] bg-white/[0.03] text-muted-foreground/40 hover:bg-blue-500/[0.12] hover:border-blue-500/30 hover:text-blue-400"
                >
                    <Eye className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}