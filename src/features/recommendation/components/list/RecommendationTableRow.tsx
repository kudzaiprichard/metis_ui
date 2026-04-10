'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/shadcn/button';
import { TableCell, TableRow } from '@/src/components/shadcn/table';
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
        router.push(`/doctor/recommendations/${prediction.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(prediction);
    };

    return (
        <TableRow
            onClick={handleView}
            className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer group relative"
        >
            <TableCell className="p-0 w-0 relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary opacity-0 group-hover:opacity-80 transition-opacity" />
            </TableCell>

            {/* Prediction id */}
            <TableCell className="py-3.5 align-middle">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                        Rx
                    </div>
                    <div className="flex flex-col gap-px min-w-0">
                        <p className="text-base font-mono text-foreground truncate">
                            {prediction.id}
                        </p>
                        <p className="text-xs text-muted-foreground/50">
                            {prediction.confidenceLabel}
                        </p>
                    </div>
                </div>
            </TableCell>

            {/* Treatment */}
            <TableCell className="py-3.5 align-middle">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/[0.12] border border-primary/20 rounded-lg text-sm font-semibold text-primary max-w-full">
                    <Pill className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{prediction.recommendedTreatment}</span>
                </div>
            </TableCell>

            {/* Mean gap */}
            <TableCell className="py-3.5 align-middle">
                <div className="flex items-center gap-1.5 text-base font-semibold text-primary">
                    <TrendingDown className="h-3 w-3" />
                    {prediction.meanGap.toFixed(2)}
                </div>
            </TableCell>

            {/* Confidence */}
            <TableCell className="py-3.5 align-middle">
                <ConfidenceBadge score={prediction.confidencePct} showLabel={false} />
            </TableCell>

            {/* Date */}
            <TableCell className="py-3.5 align-middle text-sm text-muted-foreground/60">
                {formatDate(prediction.createdAt)}
            </TableCell>

            {/* Actions */}
            <TableCell className="py-3.5 align-middle text-right">
                <div className="flex gap-2 justify-end">
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
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            className="h-8 w-8 rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted-foreground/40 hover:bg-red-500/[0.12] hover:border-red-500/30 hover:text-red-500"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
