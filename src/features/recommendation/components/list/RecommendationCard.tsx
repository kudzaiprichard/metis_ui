'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import { Prediction } from '../../api/recommendations.types';
import { ConfidenceBadge } from '../shared/ConfidenceBadge';
import { TreatmentBadge } from '../shared/TreatmentBadge';
import {
    Trash2,
    ChartNoAxesCombined,
    ShieldCheck,
    TrendingUp,
    Cpu,
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
        router.push(`/doctor/predictions/${prediction.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(prediction);
    };

    const confidenceScore = parseFloat(prediction.confidence_score);
    const predictedReduction = parseFloat(prediction.predicted_reduction);
    const confidenceMargin = parseFloat(prediction.confidence_margin);

    return (
        <Card
            className="border-white/10 bg-white/[0.04] backdrop-blur-sm rounded-none overflow-hidden p-4 cursor-pointer hover:bg-white/[0.06] hover:border-white/15 transition-all"
            onClick={handleViewDetails}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-3.5 pb-3 border-b border-white/[0.08]">
                <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-foreground truncate mb-1">
                        {prediction.patient.first_name} {prediction.patient.last_name}
                    </p>
                    <p className="text-[12px] text-muted-foreground/50 font-medium">
                        {prediction.patient.age} yrs • {prediction.patient.gender}
                    </p>
                </div>
                {onDelete && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        className="h-8 w-8 rounded-none border border-white/10 bg-transparent text-muted-foreground/50 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 flex-shrink-0"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {/* Treatment */}
            <div className="bg-primary/[0.08] border border-primary/15 rounded-none p-3 mb-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
                    Recommended Treatment
                </p>
                <TreatmentBadge treatment={prediction.recommended_treatment} variant="compact" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
                {[
                    { icon: ChartNoAxesCombined, label: 'Reduction', value: `${predictedReduction.toFixed(2)}%` },
                    { icon: ShieldCheck, label: 'Confidence', value: `${confidenceScore.toFixed(1)}%`, highlight: true },
                    { icon: TrendingUp, label: 'Margin', value: `${confidenceMargin.toFixed(1)}%` },
                    { icon: Cpu, label: 'Model', value: prediction.model_version, small: true },
                ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] rounded-none">
                        <stat.icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <div className="flex flex-col gap-px min-w-0">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {stat.label}
                            </span>
                            <span className={`font-semibold truncate ${stat.small ? 'text-[11px]' : 'text-[13px]'} ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
                                {stat.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/[0.08] flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
                    <Clock className="h-3 w-3" />
                    {formatDate(prediction.created_at)}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewDetails}
                    className="rounded-none text-[12px] font-semibold text-primary hover:bg-primary/10 h-7 px-2.5 border border-primary/20 bg-primary/[0.08]"
                >
                    <Eye className="h-3 w-3 mr-1.5" />
                    View Details
                </Button>
            </div>
        </Card>
    );
}