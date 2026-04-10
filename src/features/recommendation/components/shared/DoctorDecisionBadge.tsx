/**
 * DoctorDecisionBadge — surface the `doctorDecision` field on a stored
 * prediction per spec §5 "Module: Predictions" (PENDING / ACCEPTED /
 * OVERRIDDEN).
 */

'use client';

import { Clock, CheckCircle2, Edit3 } from 'lucide-react';
import { DoctorDecision } from '../../api/recommendations.types';

interface DoctorDecisionBadgeProps {
    decision: DoctorDecision;
    variant?: 'default' | 'compact';
}

const STYLES: Record<DoctorDecision, { label: string; icon: React.ElementType; tone: string }> = {
    PENDING: {
        label: 'Pending decision',
        icon: Clock,
        tone: 'bg-warning/10 border-warning/30 text-warning',
    },
    ACCEPTED: {
        label: 'Accepted',
        icon: CheckCircle2,
        tone: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300',
    },
    OVERRIDDEN: {
        label: 'Overridden',
        icon: Edit3,
        tone: 'bg-sky-500/10 border-sky-400/30 text-sky-300',
    },
};

export function DoctorDecisionBadge({ decision, variant = 'default' }: DoctorDecisionBadgeProps) {
    const { label, icon: Icon, tone } = STYLES[decision];
    const size =
        variant === 'compact'
            ? 'px-2 py-0.5 text-xs gap-1'
            : 'px-2.5 py-1 text-xs gap-1.5';
    const iconSize = variant === 'compact' ? 'h-3 w-3' : 'h-3.5 w-3.5';

    return (
        <span
            className={`inline-flex items-center rounded-lg border font-semibold uppercase tracking-wider ${tone} ${size}`}
        >
            <Icon className={iconSize} />
            {label}
        </span>
    );
}
