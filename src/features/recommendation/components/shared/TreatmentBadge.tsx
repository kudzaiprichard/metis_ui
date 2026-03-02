'use client';

import { Pill } from 'lucide-react';

interface TreatmentBadgeProps {
    treatment: string;
    variant?: 'default' | 'large' | 'compact';
}

export function TreatmentBadge({ treatment, variant = 'default' }: TreatmentBadgeProps) {
    const styles = {
        large: 'px-4 py-2.5 text-[15px] gap-2.5',
        compact: 'px-2.5 py-1 text-[11px] gap-1.5',
        default: 'px-3 py-1.5 text-[13px] gap-2',
    };

    const iconSize = {
        large: 'h-4 w-4',
        compact: 'h-3 w-3',
        default: 'h-3.5 w-3.5',
    };

    return (
        <div className={`inline-flex items-center rounded-none border bg-primary/15 border-primary/20 font-semibold text-primary hover:bg-primary/20 hover:border-primary/30 transition-colors ${styles[variant]}`}>
            <Pill className={`${iconSize[variant]} text-primary`} />
            <span className="truncate">{treatment}</span>
        </div>
    );
}