'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import { Prediction } from '../../api/recommendations.types';
import { TreatmentBadge } from '../shared/TreatmentBadge';
import {
    Trash2,
    ShieldCheck,
    TrendingUp,
    Pill,
    Clock,
    Eye,
} from 'lucide-react';

interface RecommendationCardProps {
    prediction: Prediction;
    onDelete?: (prediction: Prediction) => void;
}

export function RecommendationCard({ prediction, onDelete }: RecommendationCardProps) {
    const router = useRouter();

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const handleViewDetails = () => {
        router.push(`/doctor/recommendations/${prediction.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(prediction);
    };

    return (
        <Card
            className="border-white/10 bg-white/[0.04] backdrop-blur-sm rounded-lg overflow-hidden p-4 cursor-pointer hover:bg-white/[0.06] hover:border-white/15 active:scale-[0.98] active:opacity-90 transition-all"
            onClick={handleViewDetails}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3.5 pb-3 border-b border-white/[0.08]">
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Prediction
                    </p>
                    <p className="text-base font-mono text-foreground truncate">
                        {prediction.id}
                    </p>
                </div>
                {onDelete && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="h-8 w-8 rounded-lg border border-white/10 bg-transparent text-muted-foreground/50 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 flex-shrink-0"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {/* Treatment */}
            <div className="bg-primary/[0.08] border border-primary/15 rounded-lg p-3 mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                    Recommended Treatment
                </p>
                <TreatmentBadge treatment={prediction.recommendedTreatment} variant="compact" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
                <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] rounded-lg">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <div className="flex flex-col gap-px min-w-0">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Confidence
                        </span>
                        <span className="font-semibold truncate text-base text-primary">
                            {prediction.confidencePct.toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] rounded-lg">
                    <TrendingUp className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <div className="flex flex-col gap-px min-w-0">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Mean Gap
                        </span>
                        <span className="font-semibold truncate text-base text-foreground">
                            {prediction.meanGap.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] rounded-lg">
                    <Pill className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <div className="flex flex-col gap-px min-w-0">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Runner-up
                        </span>
                        <span className="font-semibold truncate text-base text-foreground">
                            {prediction.runnerUp}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] rounded-lg">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <div className="flex flex-col gap-px min-w-0">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Tier
                        </span>
                        <span className="font-semibold truncate text-base text-foreground">
                            {prediction.confidenceLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
                    <Clock className="h-3 w-3" />
                    {formatDate(prediction.createdAt)}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewDetails}
                    className="rounded-lg text-sm font-semibold text-primary hover:bg-primary/10 h-7 px-2.5 border border-primary/20 bg-primary/[0.08]"
                >
                    <Eye className="h-3 w-3 mr-1.5" />
                    View Details
                </Button>
            </div>
        </Card>
    );
}
