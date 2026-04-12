'use client';

import {
    CheckCircle2,
    ChartLine,
    Clock,
    ShieldAlert,
    ShieldCheck,
    Target,
} from 'lucide-react';

import type { Outcome } from '../../../api/similar-patients.types';

interface OutcomeStoryColumnProps {
    outcome: Outcome | null;
}

/** "Outcome" act of the three-act case grid — facts that don't fit on the trajectory chart. */
export function OutcomeStoryColumn({ outcome }: OutcomeStoryColumnProps) {
    return (
        <section
            aria-label="Outcome details"
            className="flex flex-col rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm overflow-hidden h-full"
        >
            <header className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
                        <ChartLine className="h-3 w-3 text-primary" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Outcome
                    </h3>
                </div>
            </header>

            {outcome ? (
                <div className="px-5 py-4 flex flex-col gap-3 flex-1">
                    <FactTile
                        icon={Clock}
                        label="Time to target"
                        value={outcome.timeToTarget}
                        tone="bg-info/12 border-info/25 text-info"
                    />
                    <FactTile
                        icon={Target}
                        label="Therapeutic goal"
                        value={outcome.success ? 'Met' : 'Not met'}
                        tone={
                            outcome.success
                                ? 'bg-primary/12 border-primary/25 text-primary'
                                : 'bg-warning/12 border-warning/25 text-warning'
                        }
                        valueTone={outcome.success ? 'text-primary' : 'text-warning'}
                    />
                    <AdverseEvents value={outcome.adverseEvents} />
                </div>
            ) : (
                <div className="px-5 py-6 text-sm text-muted-foreground/70 flex-1 flex items-center justify-center">
                    No outcome recorded.
                </div>
            )}
        </section>
    );
}

function FactTile({
    icon: Icon,
    label,
    value,
    tone,
    valueTone,
}: {
    icon: typeof Clock;
    label: string;
    value: string;
    tone: string;
    valueTone?: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-md border flex items-center justify-center flex-shrink-0 ${tone}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {label}
                </div>
                <div className={`text-sm font-bold truncate ${valueTone ?? 'text-foreground'}`}>
                    {value}
                </div>
            </div>
        </div>
    );
}

function AdverseEvents({ value }: { value: string }) {
    const has = value.trim() !== '' && value.toLowerCase() !== 'none';
    return (
        <div
            className={`flex flex-col gap-1.5 px-3 py-2.5 rounded-md border ${
                has
                    ? 'bg-warning/[0.08] border-warning/20'
                    : 'bg-primary/[0.06] border-primary/15'
            }`}
        >
            <div className="flex items-center gap-2">
                {has ? (
                    <ShieldAlert className="h-3 w-3 text-warning" />
                ) : (
                    <ShieldCheck className="h-3 w-3 text-primary" />
                )}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/85">
                    Adverse events
                </span>
            </div>
            <p className="text-xs leading-relaxed text-foreground/80">
                {has ? value : (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground/75">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                        None reported
                    </span>
                )}
            </p>
        </div>
    );
}
