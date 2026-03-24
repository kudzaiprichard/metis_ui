'use client';

import {
    Activity,
    Brain,
    HeartPulse,
    LineChart,
    ShieldCheck,
    Sparkles,
    Stethoscope,
} from 'lucide-react';

const HIGHLIGHTS: Array<{
    icon: typeof Brain;
    title: string;
    body: string;
}> = [
    {
        icon: Brain,
        title: 'NeuralThompson recommendations',
        body: 'Bandit-driven treatment ranking with safety, fairness, and a written rationale per decision.',
    },
    {
        icon: ShieldCheck,
        title: 'Safety-first by design',
        body: 'Contraindications and warnings are flagged before a recommendation reaches the chart.',
    },
    {
        icon: LineChart,
        title: 'Outcome-aware analytics',
        body: 'Compare candidate treatments on win rate, posterior reward, and historical similar cases.',
    },
];

export function BrandShowcase() {
    return (
        <section
            aria-labelledby="brand-headline"
            className="relative hidden lg:flex flex-col justify-between p-10 xl:p-12 overflow-hidden"
        >
            {/* Soft brand glow */}
            <div
                aria-hidden="true"
                className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-[100px]"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-24 -right-32 h-80 w-80 rounded-full bg-emerald-400/10 blur-[110px]"
            />

            {/* Top — wordmark */}
            <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-[0_8px_24px_rgba(16,185,129,0.35)]">
                    <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                    <h1 id="brand-headline" className="text-xl font-bold tracking-tight text-foreground">
                        Metis
                    </h1>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Diabetes Treatment Optimization
                    </p>
                </div>
            </div>

            {/* Middle — pitch */}
            <div className="relative space-y-7 max-w-md">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary/25 bg-primary/10 text-xs font-semibold text-primary uppercase tracking-wider">
                        <Sparkles className="h-3 w-3" />
                        AI-assisted clinical care
                    </span>
                    <h2 className="mt-4 text-3xl xl:text-4xl font-bold tracking-tight text-foreground leading-[1.15]">
                        Better treatment decisions,{' '}
                        <span className="text-primary">grounded in evidence.</span>
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-sm">
                        Metis pairs every diabetes patient with the strongest treatment option in
                        the model&apos;s evidence base — explained, audited, and yours to override.
                    </p>
                </div>

                <ul className="space-y-3.5">
                    {HIGHLIGHTS.map((h) => {
                        const Icon = h.icon;
                        return (
                            <li key={h.title} className="flex items-start gap-3">
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">
                                        {h.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {h.body}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Bottom — trust strip */}
            <div className="relative flex items-center gap-5 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Stethoscope className="h-3.5 w-3.5 text-primary/80" />
                    <span>For clinicians</span>
                </div>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HeartPulse className="h-3.5 w-3.5 text-primary/80" />
                    <span>HIPAA-aware design</span>
                </div>
            </div>
        </section>
    );
}
