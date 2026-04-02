/**
 * SimulationStatusBadge — surfaces SimulationBackendStatus (spec §6
 * "SimulationResponse.status") with consistent colouring across the history
 * list, detail page, and delete dialog.
 *
 *   PENDING    — queued, background task not yet started
 *   RUNNING    — actively stepping through rows
 *   COMPLETED  — finished normally with final aggregates
 *   CANCELLED  — user cancelled; may have partial aggregates
 *   FAILED     — background task errored; errorMessage should be set
 */

'use client';

import { Clock, Activity, CheckCircle2, OctagonX, AlertCircle } from 'lucide-react';

import type { SimulationBackendStatus } from '../../types';

const STYLES: Record<
    SimulationBackendStatus,
    { icon: React.ElementType; tone: string; label: string }
> = {
    PENDING: {
        icon: Clock,
        tone: 'bg-slate-500/10 border-slate-400/30 text-slate-300',
        label: 'Pending',
    },
    RUNNING: {
        icon: Activity,
        tone: 'bg-primary/10 border-primary/30 text-primary',
        label: 'Running',
    },
    COMPLETED: {
        icon: CheckCircle2,
        tone: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300',
        label: 'Completed',
    },
    CANCELLED: {
        icon: OctagonX,
        tone: 'bg-warning/10 border-warning/30 text-warning',
        label: 'Cancelled',
    },
    FAILED: {
        icon: AlertCircle,
        tone: 'bg-rose-500/10 border-rose-400/30 text-rose-300',
        label: 'Failed',
    },
};

interface SimulationStatusBadgeProps {
    status: SimulationBackendStatus;
    variant?: 'default' | 'compact';
}

export function SimulationStatusBadge({
    status,
    variant = 'default',
}: SimulationStatusBadgeProps) {
    const { icon: Icon, tone, label } = STYLES[status];
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
