'use client';

import { Activity, Scale } from 'lucide-react';

import type { SimilarPatientDetail } from '../../../api/similar-patients.types';

interface TrajectoryRowProps {
    patientCase: SimilarPatientDetail;
}

/**
 * Twin trajectory cards — the page's centrepiece. Each card renders the
 * baseline → follow-up arc as a small SVG path and overlays a clinical
 * target threshold line so the reader can see at a glance whether the
 * post-treatment value crossed the goal.
 */
export function TrajectoryRow({ patientCase }: TrajectoryRowProps) {
    const outcome = patientCase.outcome;
    const features = patientCase.clinicalFeatures;

    if (!outcome) {
        return (
            <section
                aria-label="Trajectories"
                className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-6 text-sm text-muted-foreground/70 text-center"
            >
                No follow-up trajectory recorded for this case.
            </section>
        );
    }

    return (
        <section aria-label="Outcome trajectories" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TrajectoryCard
                title="HbA1c trajectory"
                icon={Activity}
                unit="%"
                baseline={features.hba1cBaseline}
                followup={outcome.hba1cFollowup}
                target={7.0}
                targetLabel="Goal: < 7%"
                lowerIsBetter
                yMin={5}
                yMax={Math.max(features.hba1cBaseline, outcome.hba1cFollowup) + 1}
                timeToTarget={outcome.timeToTarget}
            />
            <TrajectoryCard
                title="BMI trajectory"
                icon={Scale}
                unit=""
                baseline={features.bmi}
                followup={outcome.bmiFollowup}
                target={25}
                targetLabel="Healthy: ≤ 25"
                lowerIsBetter
                yMin={20}
                yMax={Math.max(features.bmi, outcome.bmiFollowup) + 2}
                timeToTarget={outcome.timeToTarget}
            />
        </section>
    );
}

interface TrajectoryCardProps {
    title: string;
    icon: typeof Activity;
    unit: string;
    baseline: number;
    followup: number;
    target: number;
    targetLabel: string;
    lowerIsBetter: boolean;
    yMin: number;
    yMax: number;
    timeToTarget: string;
}

function TrajectoryCard({
    title,
    icon: Icon,
    unit,
    baseline,
    followup,
    target,
    targetLabel,
    lowerIsBetter,
    yMin,
    yMax,
    timeToTarget,
}: TrajectoryCardProps) {
    const W = 320;
    const H = 110;
    const PAD_X = 36;
    const PAD_Y = 18;
    const innerW = W - PAD_X * 2;
    const innerH = H - PAD_Y * 2;

    const yScale = (v: number) =>
        PAD_Y + (1 - (v - yMin) / Math.max(0.01, yMax - yMin)) * innerH;

    const xBaseline = PAD_X;
    const xFollowup = W - PAD_X;
    const yBaseline = yScale(baseline);
    const yFollowup = yScale(followup);
    const yTarget = yScale(target);

    // Cubic ease curve so the line reads as a smooth trajectory.
    const ctrlX1 = xBaseline + innerW * 0.45;
    const ctrlX2 = xBaseline + innerW * 0.55;
    const path = `M ${xBaseline} ${yBaseline} C ${ctrlX1} ${yBaseline}, ${ctrlX2} ${yFollowup}, ${xFollowup} ${yFollowup}`;

    const delta = followup - baseline;
    const improved = lowerIsBetter ? delta < 0 : delta > 0;
    // Push line/endpoint colors onto a Tailwind className so the SVG inherits
    // theme tokens via `currentColor` instead of hard-coded CSS variables.
    // Keeps semantic green-vs-orange duality (no chart token would do this).
    const trendClass = improved ? 'text-primary' : 'text-warning';
    const goalMet = lowerIsBetter ? followup <= target : followup >= target;

    return (
        <article className="flex flex-col rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm overflow-hidden">
            <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                </div>
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-bold tabular-nums ${
                        improved
                            ? 'bg-primary/12 border-primary/25 text-primary'
                            : 'bg-warning/12 border-warning/25 text-warning'
                    }`}
                >
                    {delta > 0 ? '+' : ''}
                    {delta.toFixed(1)}
                    {unit}
                </span>
            </header>

            <div className="px-5 py-3">
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="w-full h-[120px]"
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    aria-label={`${title} from ${baseline}${unit} to ${followup}${unit}`}
                >
                    {/* Subtle grid */}
                    <line
                        x1={PAD_X}
                        x2={W - PAD_X}
                        y1={H / 2}
                        y2={H / 2}
                        stroke="currentColor"
                        className="text-white/[0.04]"
                    />
                    {/* Target reference line */}
                    <line
                        x1={PAD_X}
                        x2={W - PAD_X}
                        y1={yTarget}
                        y2={yTarget}
                        stroke="currentColor"
                        className="text-info/45"
                        strokeDasharray="3 3"
                    />
                    <text
                        x={W - PAD_X}
                        y={yTarget - 4}
                        textAnchor="end"
                        className="fill-info/70 text-[9px] font-medium"
                        style={{ fontFamily: 'var(--font-mono, monospace)' }}
                    >
                        {targetLabel}
                    </text>

                    {/* Trajectory path + follow-up endpoint share the trend
                        color via `currentColor` on this <g>. */}
                    <g className={trendClass}>
                        <path
                            d={path}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                        />
                        <circle cx={xFollowup} cy={yFollowup} r={6} fill="currentColor" />
                    </g>

                    {/* Baseline endpoint — neutral, hollow ring on card bg. */}
                    <circle
                        cx={xBaseline}
                        cy={yBaseline}
                        r={5}
                        className="fill-card text-muted-foreground"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    />

                    {/* Value labels — anchored away from the line */}
                    <text
                        x={xBaseline}
                        y={yBaseline + (yBaseline > H / 2 ? -10 : 18)}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[11px] font-semibold tabular-nums"
                    >
                        {baseline.toFixed(1)}
                        {unit}
                    </text>
                    <text
                        x={xFollowup}
                        y={yFollowup + (yFollowup > H / 2 ? -10 : 18)}
                        textAnchor="middle"
                        className="fill-foreground text-[12px] font-bold tabular-nums"
                    >
                        {followup.toFixed(1)}
                        {unit}
                    </text>

                    {/* X-axis tick labels */}
                    <text
                        x={xBaseline}
                        y={H - 4}
                        textAnchor="middle"
                        className="fill-muted-foreground/50 text-[9px] uppercase tracking-wider"
                    >
                        Baseline
                    </text>
                    <text
                        x={xFollowup}
                        y={H - 4}
                        textAnchor="middle"
                        className="fill-muted-foreground/50 text-[9px] uppercase tracking-wider"
                    >
                        Follow-up
                    </text>
                </svg>
            </div>

            <footer className="flex items-center justify-between gap-3 px-5 py-2.5 border-t border-white/10 bg-white/[0.02]">
                <span className="text-xs text-muted-foreground/70">{timeToTarget}</span>
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                        goalMet
                            ? 'bg-primary/12 text-primary border border-primary/25'
                            : 'bg-warning/12 text-warning border border-warning/25'
                    }`}
                >
                    {goalMet ? 'Goal met' : 'Above goal'}
                </span>
            </footer>
        </article>
    );
}
