'use client';

/**
 * Narrative interpretation, broken out per-topic so each card lives next to
 * the chart it explains. Replaces the monolithic InterpretationPanel that
 * dumped all four insights in a single 290-line block at the bottom of the
 * page (out of view of the data being interpreted).
 *
 * Each card reuses the same `useBanditInsights` hook so the math stays in
 * one place.
 */

import { useMemo } from 'react';
import {
    Activity,
    AlertTriangle,
    Brain,
    CheckCircle,
    Crosshair,
    Target,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

import { Card } from '@/src/components/shadcn/card';
import { HistoryEntry, Treatment } from '../types';

export interface InsightInputs {
    step: number;
    treatments: Treatment[];
    treatmentCounts: number[];
    cumulativeReward: number;
    cumulativeRegret: number;
    runningAccuracy: number;
    history: HistoryEntry[];
    bestTreatmentIdx: number;
}

interface Insights {
    accuracyPct: number;
    meanReward: number;
    meanRegret: number;
    convergencePoint: number | null;
    bestPct: number;
    performingWell: boolean;
    exploreCount: number;
    explorePct: number;
}

function useInsights(props: InsightInputs): Insights | null {
    const {
        step,
        treatmentCounts,
        cumulativeReward,
        cumulativeRegret,
        runningAccuracy,
        history,
        bestTreatmentIdx,
    } = props;

    return useMemo(() => {
        if (step < 5) return null;
        const totalSelections = treatmentCounts.reduce((a, b) => a + b, 0) || 1;
        const accuracyPct = runningAccuracy * 100;
        const meanReward = cumulativeReward / step;
        const meanRegret = cumulativeRegret / step;

        // Convergence: best treatment dominated >50% of the last 50 selections
        let convergencePoint: number | null = null;
        for (let i = 50; i <= history.length; i++) {
            const window = history.slice(i - 50, i);
            const bestCount = window.filter(
                (h) => h.selectedIdx === bestTreatmentIdx,
            ).length;
            if (bestCount >= 25) {
                convergencePoint = history[i - 1].step;
                break;
            }
        }

        const bestPct = (treatmentCounts[bestTreatmentIdx] / totalSelections) * 100;
        const performingWell = accuracyPct > 60;
        const exploreCount = history.filter((h) => h.explored).length;
        const explorePct = (exploreCount / totalSelections) * 100;

        return {
            accuracyPct,
            meanReward,
            meanRegret,
            convergencePoint,
            bestPct,
            performingWell,
            exploreCount,
            explorePct,
        };
    }, [
        step,
        treatmentCounts,
        cumulativeReward,
        cumulativeRegret,
        runningAccuracy,
        history,
        bestTreatmentIdx,
    ]);
}

// ─── Shared placeholder ──────────────────────────────────────────────────

function PendingCard({ message }: { message: string }) {
    return (
        <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2.5">
                <Brain className="h-4 w-4 text-primary/70" />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </Card>
    );
}

// ─── 1. Summary banner — sets the headline ───────────────────────────────

export function SummaryBanner(props: InsightInputs) {
    const insights = useInsights(props);
    const { step, treatments, bestTreatmentIdx } = props;
    if (!insights) {
        return (
            <PendingCard message="Run the simulation to see interpretation results…" />
        );
    }
    const bestTreatment = treatments[bestTreatmentIdx];

    return (
        <Card
            className={`rounded-lg p-4 border ${
                insights.performingWell
                    ? 'bg-emerald-500/[0.06] border-emerald-500/15'
                    : 'bg-warning/[0.06] border-warning/15'
            }`}
        >
            <div className="flex items-start gap-3">
                {insights.performingWell ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-1" />
                ) : (
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-1" />
                )}
                <p className="text-sm text-foreground/90 leading-relaxed">
                    After <span className="font-bold">{step}</span> patients, the bandit{' '}
                    {insights.performingWell ? (
                        <>
                            is matching the oracle{' '}
                            <span className="font-bold text-emerald-400">
                                {insights.accuracyPct.toFixed(1)}%
                            </span>{' '}
                            of the time, favouring{' '}
                            <span className="font-bold text-emerald-400">
                                {bestTreatment?.name}
                            </span>
                            {insights.convergencePoint ? (
                                <>
                                    , converging after ~
                                    <span className="font-bold">
                                        {insights.convergencePoint}
                                    </span>{' '}
                                    patients
                                </>
                            ) : null}
                            .
                        </>
                    ) : (
                        <>
                            is still learning. Match rate{' '}
                            <span className="font-bold text-warning">
                                {insights.accuracyPct.toFixed(1)}%
                            </span>
                            . Current best estimate{' '}
                            <span className="font-bold text-warning">
                                {bestTreatment?.name}
                            </span>
                            .
                        </>
                    )}
                </p>
            </div>
        </Card>
    );
}

// ─── 2. Accuracy — sits in the cockpit rail ──────────────────────────────

export function AccuracyCard(props: InsightInputs) {
    const insights = useInsights(props);
    if (!insights) {
        return (
            <NarrativeCard accent="purple" icon={Crosshair} title="Oracle accuracy">
                Awaiting first 5 steps before insights appear.
            </NarrativeCard>
        );
    }
    return (
        <NarrativeCard accent="purple" icon={Crosshair} title="Oracle accuracy">
            The bandit matches the oracle&apos;s optimal treatment{' '}
            <strong>{insights.accuracyPct.toFixed(1)}%</strong> of the time, with a
            mean reward of <strong>{insights.meanReward.toFixed(2)}</strong> per
            patient.
        </NarrativeCard>
    );
}

// ─── 3. Convergence — paired with TreatmentDistribution ──────────────────

export function ConvergenceCard(props: InsightInputs) {
    const insights = useInsights(props);
    const { treatments, bestTreatmentIdx } = props;
    if (!insights) {
        return (
            <NarrativeCard accent="blue" icon={Target} title="Convergence">
                Not enough data yet — keep running.
            </NarrativeCard>
        );
    }
    const best = treatments[bestTreatmentIdx];
    return (
        <NarrativeCard accent="blue" icon={Target} title="Convergence">
            {insights.convergencePoint ? (
                <>
                    Converged on <strong>{best?.name}</strong> after{' '}
                    <strong>{insights.convergencePoint}</strong> patients. Now
                    selected{' '}
                    <strong>{insights.bestPct.toFixed(1)}%</strong> of the time
                    vs ~{(100 / treatments.length).toFixed(0)}% for a uniform
                    random policy.
                </>
            ) : (
                <>
                    Not yet converged on a dominant treatment — still in the
                    exploration phase, updating its posterior.
                </>
            )}
        </NarrativeCard>
    );
}

// ─── 4. Regret — paired with CumulativeRegretChart ───────────────────────

export function RegretCard(props: InsightInputs) {
    const insights = useInsights(props);
    const { cumulativeRegret } = props;
    if (!insights) {
        return (
            <NarrativeCard accent="amber" icon={TrendingDown} title="Regret analysis">
                Regret only becomes meaningful after the first few decisions.
            </NarrativeCard>
        );
    }
    return (
        <NarrativeCard accent="amber" icon={TrendingDown} title="Regret analysis">
            Cumulative regret <strong>{cumulativeRegret.toFixed(2)}</strong>{' '}
            (mean <strong>{insights.meanRegret.toFixed(3)}</strong>/patient) —
            the opportunity cost of suboptimal choices during learning.{' '}
            {insights.meanRegret < 0.5
                ? 'Low regret — efficient learning.'
                : insights.meanRegret < 1.5
                  ? 'Moderate regret — still balancing exploration and exploitation.'
                  : 'High regret — heavy exploration phase. Will fall as the posterior tightens.'}
        </NarrativeCard>
    );
}

// ─── 5. Exploration vs exploitation — paired with EpsilonDecayChart ──────

export function ExplorationCard(props: InsightInputs) {
    const insights = useInsights(props);
    const { step } = props;
    if (!insights) {
        return (
            <NarrativeCard accent="emerald" icon={Activity} title="Explore vs exploit">
                Decision split appears once enough samples accumulate.
            </NarrativeCard>
        );
    }
    return (
        <NarrativeCard accent="emerald" icon={Activity} title="Explore vs exploit">
            Of <strong>{step}</strong> decisions,{' '}
            <strong>{insights.exploreCount}</strong> (
            {insights.explorePct.toFixed(1)}%) were Thompson explorations
            (sampling deviated from the posterior mean) and{' '}
            <strong>{step - insights.exploreCount}</strong> (
            {(100 - insights.explorePct).toFixed(1)}%) exploited the current
            best estimate.
        </NarrativeCard>
    );
}

// ─── 6. Selection shift — paired with SelectionShiftChart ───────────────

export function SelectionShiftCard(props: InsightInputs) {
    const { history, treatments } = props;

    const summary = useMemo(() => {
        if (history.length < 50) return null;
        const earlyN = Math.min(50, Math.floor(history.length / 4));
        const lateN = Math.min(50, Math.floor(history.length / 4));
        const early = history.slice(0, earlyN);
        const late = history.slice(history.length - lateN);

        const tally = (slice: typeof history) => {
            const counts = new Array(treatments.length).fill(0);
            slice.forEach((h) => counts[h.selectedIdx]++);
            return counts.map((c) => (c / slice.length) * 100);
        };

        const earlyShares = tally(early);
        const lateShares = tally(late);

        // Treatment with biggest growth in share between early and late.
        let topGrower = 0;
        let topGrowth = -Infinity;
        for (let i = 0; i < treatments.length; i++) {
            const delta = lateShares[i] - earlyShares[i];
            if (delta > topGrowth) {
                topGrowth = delta;
                topGrower = i;
            }
        }
        // How many treatments have effectively dropped out late (< 5%).
        const droppedCount = lateShares.filter((s) => s < 5).length;
        return { topGrower, topGrowth, lateShares, earlyShares, droppedCount };
    }, [history, treatments]);

    if (!summary) {
        return (
            <NarrativeCard accent="blue" icon={TrendingUp} title="Selection shift">
                Need at least ~50 decisions before the early-vs-late comparison
                becomes meaningful.
            </NarrativeCard>
        );
    }

    const grower = treatments[summary.topGrower];
    const growerEarly = summary.earlyShares[summary.topGrower].toFixed(0);
    const growerLate = summary.lateShares[summary.topGrower].toFixed(0);

    return (
        <NarrativeCard accent="blue" icon={TrendingUp} title="Selection shift">
            <strong>{grower?.name}</strong>&apos;s share of decisions grew from{' '}
            <strong>{growerEarly}%</strong> early to{' '}
            <strong>{growerLate}%</strong> late, a{' '}
            <strong>+{summary.topGrowth.toFixed(0)}pp</strong> swing.{' '}
            {summary.droppedCount > 0 ? (
                <>
                    <strong>{summary.droppedCount}</strong>{' '}
                    {summary.droppedCount === 1 ? 'treatment has' : 'treatments have'}{' '}
                    fallen below 5% of late selections — exploitation is
                    crowding out exploration of weaker arms.
                </>
            ) : (
                <>The bandit is still spreading attention across multiple arms — exploration is active.</>
            )}
        </NarrativeCard>
    );
}

// ─── Shared narrative-card shell ─────────────────────────────────────────

const ACCENT: Record<
    'blue' | 'purple' | 'amber' | 'emerald',
    { ring: string; icon: string; bg: string }
> = {
    blue: {
        ring: 'border-l-blue-400',
        icon: 'text-info',
        bg: 'bg-info/[0.06]',
    },
    purple: {
        ring: 'border-l-purple-400',
        icon: 'text-info',
        bg: 'bg-info/[0.06]',
    },
    amber: {
        ring: 'border-l-amber-400',
        icon: 'text-warning',
        bg: 'bg-warning/[0.06]',
    },
    emerald: {
        ring: 'border-l-emerald-400',
        icon: 'text-emerald-400',
        bg: 'bg-emerald-400/[0.06]',
    },
};

function NarrativeCard({
    accent,
    icon: Icon,
    title,
    children,
}: {
    accent: keyof typeof ACCENT;
    icon: typeof Target;
    title: string;
    children: React.ReactNode;
}) {
    const a = ACCENT[accent];
    return (
        <div
            className={`p-3.5 rounded-lg border-l-[3px] ${a.ring} ${a.bg} border border-white/[0.04]`}
        >
            <div
                className={`flex items-center gap-2 text-sm font-semibold mb-1.5 ${a.icon}`}
            >
                <Icon className="h-3.5 w-3.5" />
                {title}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>
        </div>
    );
}
