'use client';

import { ShieldCheck } from 'lucide-react';

interface ConfidenceBadgeProps {
    score: number;
    showLabel?: boolean;
}

export function ConfidenceBadge({ score, showLabel = true }: ConfidenceBadgeProps) {
    const getLevel = () => {
        if (score >= 90) return { label: 'high', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' };
        if (score >= 75) return { label: 'medium', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/20' };
        return { label: 'low', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/20' };
    };

    const { label, color, bg, border } = getLevel();

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-none border text-[12px] font-semibold ${bg} ${border}`}>
            <ShieldCheck className={`h-3 w-3 ${color}`} />
            <span className={`font-bold ${color}`}>{score.toFixed(1)}%</span>
            {showLabel && (
                <span className={`uppercase tracking-wider text-[10px] opacity-80 ${color}`}>{label}</span>
            )}
        </div>
    );
}