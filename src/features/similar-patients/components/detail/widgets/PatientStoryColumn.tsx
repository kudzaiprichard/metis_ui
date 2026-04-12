'use client';

import { CheckCircle2, ClipboardList, ShieldAlert, Tag, User } from 'lucide-react';

import type {
    ClinicalCategories,
    Demographics,
} from '../../../api/similar-patients.types';

interface PatientStoryColumnProps {
    demographics: Demographics;
    categories: ClinicalCategories;
    comorbidities: string[];
}

/** "Patient" act of the three-act case grid. */
export function PatientStoryColumn({
    demographics,
    categories,
    comorbidities,
}: PatientStoryColumnProps) {
    const has = comorbidities.length > 0;

    return (
        <section
            aria-label="Patient profile"
            className="flex flex-col rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm overflow-hidden h-full"
        >
            <ColumnHeader icon={User} label="Patient" />

            <div className="px-5 py-4 flex flex-col gap-3 flex-1">
                <FactRow label="Age" value={`${demographics.age} yrs`} />
                <FactRow label="Gender" value={demographics.gender} />
                <FactRow label="Ethnicity" value={demographics.ethnicity} />

                <Divider />

                <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag className="h-3 w-3 text-muted-foreground/50" />
                    <ClassChip>{categories.bmiCategory.replace(/_/g, ' ')}</ClassChip>
                    <ClassChip>{categories.hba1cSeverity.replace(/_/g, ' ')}</ClassChip>
                    <ClassChip>{categories.kidneyFunction.replace(/_/g, ' ')}</ClassChip>
                </div>

                <Divider />

                <div className="flex items-center gap-2 mb-1">
                    <ClipboardList className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Comorbidities
                    </span>
                    <span
                        className={`ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-[10px] font-bold rounded-md border ${
                            has
                                ? 'bg-destructive/10 border-destructive/25 text-destructive'
                                : 'bg-primary/10 border-primary/25 text-primary'
                        }`}
                    >
                        {comorbidities.length}
                    </span>
                </div>
                {has ? (
                    <ul className="flex flex-col gap-1.5">
                        {comorbidities.map((c) => (
                            <li
                                key={c}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-destructive/[0.06] border border-destructive/15 text-xs text-foreground/85"
                            >
                                <ShieldAlert className="h-3 w-3 text-destructive flex-shrink-0" />
                                <span className="truncate">{c}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-primary/[0.06] border border-primary/15 text-xs text-muted-foreground/80">
                        <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                        None reported
                    </div>
                )}
            </div>
        </section>
    );
}

function ColumnHeader({ icon: Icon, label }: { icon: typeof User; label: string }) {
    return (
        <header className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <Icon className="h-3 w-3 text-primary" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                </h3>
            </div>
        </header>
    );
}

function FactRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground/70">{label}</span>
            <span className="text-sm font-semibold text-foreground truncate">{value}</span>
        </div>
    );
}

function Divider() {
    return <div className="h-px bg-white/[0.06]" />;
}

function ClassChip({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-[10px] font-medium uppercase tracking-wider text-muted-foreground/85">
            {children}
        </span>
    );
}
