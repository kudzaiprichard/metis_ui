'use client';

import { Info } from 'lucide-react';

const TREATMENTS = ['Metformin', 'GLP-1', 'SGLT-2', 'DPP-4', 'Insulin'];

const CONFIDENCE_TIERS: Array<{ tier: 'HIGH' | 'MODERATE' | 'LOW'; range: string; tone: string }> = [
    { tier: 'HIGH', range: '≥ 85%', tone: 'text-primary' },
    { tier: 'MODERATE', range: '60 – 84%', tone: 'text-info' },
    { tier: 'LOW', range: '< 60%', tone: 'text-warning' },
];

export function ReferenceCard() {
    return (
        <aside className="flex flex-col gap-3 rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-4">
            <header className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quick reference
                </h3>
            </header>

            <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                    Treatment options
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {TREATMENTS.map((t) => (
                        <span
                            key={t}
                            className="px-2 py-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-foreground/80"
                        >
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-1 border-t border-white/[0.06]">
                <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider pt-2">
                    Confidence tiers
                </p>
                <ul className="flex flex-col gap-1">
                    {CONFIDENCE_TIERS.map(({ tier, range, tone }) => (
                        <li
                            key={tier}
                            className="flex items-center justify-between text-xs"
                        >
                            <span className={`font-semibold ${tone}`}>{tier}</span>
                            <span className="text-muted-foreground/70 tabular-nums">{range}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <p className="text-xs text-muted-foreground/50 leading-relaxed pt-2 border-t border-white/[0.06]">
                Stateless inference: nothing is persisted. Use the Predictions module to record a
                decision against a patient.
            </p>
        </aside>
    );
}
