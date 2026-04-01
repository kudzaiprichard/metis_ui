'use client';

import { Card } from '@/src/components/shadcn/card';
import { Lightbulb, Search, Scale, Target } from 'lucide-react';

const phases = [
    {
        title: 'Early Phase (0–100 patients)',
        description:
            "The NeuralThompson bandit starts with wide posterior uncertainty. It samples broadly across all 5 treatments, gathering reward signals to update its Bayesian beliefs about which treatment works best for each patient profile.",
        icon: Search,
        color: 'text-info',
        border: 'border-l-blue-400',
        bg: 'bg-info/[0.06]',
    },
    {
        title: 'Middle Phase (100–250 patients)',
        description:
            'Posterior estimates sharpen as more data arrives. The bandit begins favoring treatments with higher posterior means while still exploring when Thompson samples pull a less-favored treatment to the top.',
        icon: Scale,
        color: 'text-warning',
        border: 'border-l-amber-400',
        bg: 'bg-warning/[0.06]',
    },
    {
        title: 'Late Phase (250+ patients)',
        description:
            'The posterior has converged. The bandit exploits the best treatment most of the time, with Thompson exploration becoming rare as uncertainty collapses. Oracle match accuracy plateaus near its ceiling.',
        icon: Target,
        color: 'text-emerald-400',
        border: 'border-l-emerald-400',
        bg: 'bg-emerald-400/[0.06]',
    },
];

export function ExplanationSection() {
    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-5 mb-5">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2.5 mb-1.5">
                    <Lightbulb className="h-4.5 w-4.5 text-primary" />
                    What You're Seeing
                </h2>
                <p className="text-base text-muted-foreground">
                    How the NeuralThompson bandit learns over time
                </p>
            </div>

            <div className="flex flex-col gap-3.5">
                {phases.map((phase) => (
                    <div
                        key={phase.title}
                        className={`p-4 rounded-lg border-l-[3px] ${phase.border} ${phase.bg}`}
                    >
                        <div className={`flex items-center gap-2 text-base font-semibold mb-1.5 ${phase.color}`}>
                            <phase.icon className="h-3.5 w-3.5" />
                            {phase.title}
                        </div>
                        <p className="text-base text-foreground/80 leading-relaxed">
                            {phase.description}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}
