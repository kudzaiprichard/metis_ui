'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/shadcn/button';
import { Prediction } from '../../api/recommendations.types';
import { ConfidenceBadge } from '../shared/ConfidenceBadge';
import { TrendingDown, Eye, Trash2, Pill } from 'lucide-react';

interface RecommendationTableRowProps {
    prediction: Prediction;
    onDelete?: (prediction: Prediction) => void;
}

export function RecommendationTableRow({ prediction, onDelete }: RecommendationTableRowProps) {
    const router = useRouter();

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const handleView = () => {
        router.push(`/doctor/predictions/${prediction.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(prediction);
    };

    const getInitials = (first: string, last: string) =>
        `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();

    const confidenceScore = parseFloat(prediction.confidence_score);
    const predictedReduction = parseFloat(prediction.predicted_reduction);

    return (
        <div
            className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr_1fr] gap-4 py-3.5 border-b border-white/[0.04] items-center cursor-pointer hover:bg-white/[0.03] transition-colors group relative"
            onClick={handleView}
        >
            {/* Hover accent */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary opacity-0 group-hover:opacity-80 transition-opacity" />

            {/* Patient */}
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-none bg-primary/20 border border-primary/30 flex items-center justify-center text-[12px] font-semibold text-primary flex-shrink-0">
                    {getInitials(prediction.patient.first_name, prediction.patient.last_name)}
                </div>
                <div className="flex flex-col gap-px min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                        {prediction.patient.first_name} {prediction.patient.last_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground/50">
                        {prediction.patient.age} yrs • {prediction.patient.gender}
                    </p>
                </div>
            </div>

            {/* Treatment */}
            <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/[0.12] border border-primary/20 rounded-none text-[12px] font-semibold text-primary max-w-full">
                    <Pill className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{prediction.recommended_treatment}</span>
                </div>
            </div>

            {/* Reduction */}
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-primary">
                <TrendingDown className="h-3 w-3" />
                {predictedReduction.toFixed(2)}%
            </div>

            {/* Confidence */}
            <div>
                <ConfidenceBadge score={confidenceScore} showLabel={false} />
            </div>

            {/* Date */}
            <p className="text-[12px] text-muted-foreground/60">{formatDate(prediction.created_at)}</p>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleView}
                    className="h-8 w-8 rounded-none border border-white/[0.08] bg-white/[0.03] text-muted-foreground/40 hover:bg-blue-500/[0.12] hover:border-blue-500/30 hover:text-blue-400"
                >
                    <Eye className="h-3.5 w-3.5" />
                </Button>
                {onDelete && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="h-8 w-8 rounded-none border border-white/[0.08] bg-white/[0.03] text-muted-foreground/40 hover:bg-red-500/[0.12] hover:border-red-500/30 hover:text-red-500"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        </div>
    );
}