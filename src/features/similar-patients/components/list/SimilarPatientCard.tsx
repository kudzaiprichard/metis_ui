'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import { SimilarPatientCase } from '../../api/similar-patients.types';
import {
    IdCard,
    Percent,
    User,
    Globe,
    ChartLine,
    Weight,
    Pill,
    TrendingDown,
    CheckCircle,
    XCircle,
    Eye,
} from 'lucide-react';

interface SimilarPatientCardProps {
    case: SimilarPatientCase;
}

export function SimilarPatientCard({ case: patientCase }: SimilarPatientCardProps) {
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/doctor/similar-patients/${patientCase.case_id}`);
    };

    const similarityScore = (patientCase.similarity_score * 100).toFixed(1);
    const clinicalSimilarity = (patientCase.clinical_similarity * 100).toFixed(0);
    const comorbiditySimilarity = (patientCase.comorbidity_similarity * 100).toFixed(0);
    const hba1cReduction = parseFloat(patientCase.outcome.hba1c_reduction);

    const getSimilarityStyle = (score: number) => {
        if (score >= 0.8) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25';
        if (score >= 0.6) return 'text-blue-400 bg-blue-500/15 border-blue-500/25';
        return 'text-orange-400 bg-orange-500/15 border-orange-500/25';
    };

    return (
        <Card
            className="border-white/10 bg-white/[0.04] rounded-none overflow-hidden p-4 cursor-pointer hover:bg-white/[0.06] hover:border-white/15 transition-all"
            onClick={handleViewDetails}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground/90">
                    <IdCard className="h-3 w-3 text-muted-foreground/50" />
                    <span className="truncate">{patientCase.case_id}</span>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-none border text-[12px] font-bold ${getSimilarityStyle(patientCase.similarity_score)}`}>
                    <Percent className="h-3 w-3" />
                    {similarityScore}%
                </div>
            </div>

            {/* Profile */}
            <div className="bg-white/[0.02] border border-white/5 rounded-none p-3 mb-3">
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { icon: User, text: `${patientCase.profile.age} yrs • ${patientCase.profile.gender}` },
                        { icon: Globe, text: patientCase.profile.ethnicity },
                        { icon: ChartLine, text: `HbA1c: ${patientCase.profile.hba1c_baseline}%` },
                        { icon: Weight, text: `BMI: ${patientCase.profile.bmi}` },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/70">
                            <item.icon className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />
                            <span className="truncate">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Similarity Breakdown */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
                {[
                    { label: 'Clinical', value: `${clinicalSimilarity}%` },
                    { label: 'Comorbidity', value: `${comorbiditySimilarity}%` },
                ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center p-2 bg-white/[0.02] rounded-none">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{item.label}</span>
                        <span className="text-[12px] font-bold text-primary">{item.value}</span>
                    </div>
                ))}
            </div>

            {/* Comorbidities */}
            {patientCase.comorbidities.length > 0 && (
                <div className="mb-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Comorbidities</p>
                    <div className="flex flex-wrap gap-1.5">
                        {patientCase.comorbidities.slice(0, 3).map((c, i) => (
                            <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-none text-[10px] font-semibold text-red-400">
                                {c}
                            </span>
                        ))}
                        {patientCase.comorbidities.length > 3 && (
                            <span className="px-2 py-1 bg-white/[0.05] border border-white/10 rounded-none text-[10px] font-semibold text-muted-foreground/60">
                                +{patientCase.comorbidities.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Treatment */}
            <div className="mb-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Treatment Given</p>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-primary/[0.08] border border-primary/15 rounded-none text-[12px] font-semibold text-primary">
                    <Pill className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{patientCase.treatment_given}</span>
                    <span className="text-[10px] font-medium text-primary/60 whitespace-nowrap">({patientCase.drug_class})</span>
                </div>
            </div>

            {/* Outcome */}
            <div className="flex justify-between items-center p-2.5 bg-white/[0.02] border border-white/5 rounded-none mb-3">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-primary">
                    <TrendingDown className="h-3 w-3" />
                    HbA1c: <strong>{hba1cReduction.toFixed(2)}%</strong>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-none text-[10px] font-semibold ${patientCase.outcome.success ? 'bg-primary/[0.12] text-primary' : 'bg-red-500/[0.12] text-red-400'}`}>
                    {patientCase.outcome.success ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {patientCase.outcome.outcome_category}
                </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/[0.08]">
                <Button
                    variant="ghost"
                    onClick={handleViewDetails}
                    className="w-full rounded-none h-9 text-[12px] font-semibold text-primary border border-primary/20 bg-primary/[0.08] hover:bg-primary/15"
                >
                    <Eye className="h-3 w-3 mr-1.5" />
                    View Details
                </Button>
            </div>
        </Card>
    );
}