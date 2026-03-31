'use client';

/**
 * Dashboard layout — sticky cockpit on the left, scrolling analytics stream
 * on the right. Each chart in the right column is paired with a small
 * narrative card directly beneath it, so the explanation lives next to the
 * data it explains instead of being dumped at the bottom of the page.
 */

import { UseSimulationStreamReturn } from '../hooks/useSimulationStream';
import { AggregateMetricsStrip } from './AggregateMetricsStrip';
import { ControlsBar } from './ControlsBar';
import { CumulativeRegretChart } from './CumulativeRegretChart';
import { EpsilonDecayChart } from './EpsilonDecayChart';
import {
    AccuracyCard,
    ConvergenceCard,
    ExplorationCard,
    RegretCard,
    SelectionShiftCard,
    SummaryBanner,
} from './InterpretationCards';
import { LiveDecisionIndicator } from './LiveDecisionIndicator';
import { OutcomesSummaryPanel } from './OutcomesSummaryPanel';
import { SelectionShiftChart } from './SelectionShiftChart';
import { StatusCards } from './StatusCards';
import { TreatmentDistribution } from './TreatmentDistribution';

interface BanditSimulationProps {
    simulation: UseSimulationStreamReturn;
}

export function BanditSimulation({ simulation }: BanditSimulationProps) {
    const {
        status,
        step,
        totalSteps,
        history,
        treatmentCounts,
        runningEstimates,
        cumulativeReward,
        cumulativeRegret,
        runningAccuracy,
        phase,
        bestTreatmentIdx,
        treatments,
        minEpsilon,
        finalAggregates,
        simulationAggregates,
        connect,
        disconnect,
        cancel,
        reset,
    } = simulation;

    // Bundled once, fed to every narrative card.
    const insightProps = {
        step,
        treatments,
        treatmentCounts,
        cumulativeReward,
        cumulativeRegret,
        runningAccuracy,
        history,
        bestTreatmentIdx,
    };

    return (
        <div className="space-y-4">
            {/* Top — controls span the full width */}
            <ControlsBar
                status={status}
                step={step}
                totalSteps={totalSteps}
                onConnect={connect}
                onDisconnect={disconnect}
                onCancel={cancel}
                onReset={reset}
            />

            {/* 2-col dashboard. Cockpit on the left stays put while the
                analytics stream on the right scrolls. */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* ── Left rail — sticky cockpit ── */}
                <aside className="lg:col-span-5 lg:sticky lg:top-4 self-start space-y-4">
                    <StatusCards
                        step={step}
                        cumulativeReward={cumulativeReward}
                        runningAccuracy={runningAccuracy}
                        phase={phase}
                        bestTreatmentIdx={bestTreatmentIdx}
                        treatments={treatments}
                    />
                    <LiveDecisionIndicator
                        history={history}
                        treatments={treatments}
                        step={step}
                    />
                    <AccuracyCard {...insightProps} />
                </aside>

                {/* ── Right column — analytics stream ── */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Headline summary first — sets the user's expectation
                        for what the rest of the column will detail. */}
                    <SummaryBanner {...insightProps} />

                    <AggregateMetricsStrip
                        step={step}
                        cumulativeReward={cumulativeReward}
                        cumulativeRegret={cumulativeRegret}
                        history={history}
                        finalAggregates={finalAggregates}
                        simulationAggregates={simulationAggregates}
                    />

                    {/* Per-treatment breakdown + the convergence narrative.
                        TreatmentDistribution is the visual answer to "which
                        treatment is the bandit picking?" — ConvergenceCard
                        explains it in one sentence. */}
                    <ChartGroup>
                        <TreatmentDistribution
                            treatments={treatments}
                            treatmentCounts={treatmentCounts}
                            runningEstimates={runningEstimates}
                            bestTreatmentIdx={bestTreatmentIdx}
                            step={step}
                        />
                        <ConvergenceCard {...insightProps} />
                    </ChartGroup>

                    {/* Cumulative regret + analysis */}
                    <ChartGroup>
                        <CumulativeRegretChart history={history} />
                        <RegretCard {...insightProps} />
                    </ChartGroup>

                    {/* Epsilon decay + explore-vs-exploit narrative */}
                    <ChartGroup>
                        <EpsilonDecayChart
                            history={history}
                            minEpsilon={minEpsilon}
                        />
                        <ExplorationCard {...insightProps} />
                    </ChartGroup>

                    {/* Outcomes summary closes out the right column — the
                        selection-shift chart pops out below as a full-width
                        hero row. */}
                    <OutcomesSummaryPanel
                        finalAggregates={finalAggregates}
                        simulationAggregates={simulationAggregates}
                    />
                </div>
            </div>

            {/* Hero block — both elements span the full page width.
                Selection-shift gets the entire canvas to read the timeline,
                with its narrative sitting full-width directly beneath. */}
            <div className="space-y-4">
                <SelectionShiftChart
                    history={history}
                    treatments={treatments}
                    height={420}
                />
                <SelectionShiftCard {...insightProps} />
            </div>
        </div>
    );
}

/**
 * Small layout helper — groups a chart with its narrative card so they
 * stay flush vertically, with no extra spacing creep introduced by
 * children that already render their own margin classes.
 */
function ChartGroup({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-2.5">{children}</div>;
}
