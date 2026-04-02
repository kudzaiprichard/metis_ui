/**
 * SimulationStepsView — per-step drill-down for a single completed simulation.
 *
 * Spec §6 "Simulation Endpoints Reference":
 *   GET /simulations/{id}         — top-panel summary (status + aggregates + config)
 *   GET /simulations/{id}/steps   — paginated per-step records (up to pageSize=100)
 *
 * The SSE stream carries lean payloads during a live run; this view renders the
 * full SimulationStepResponse pulled from the DB after completion. Expandable
 * rows surface the patient features, oracle rewards, and decision posterior
 * so auditors can trace any individual decision end-to-end.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    CircleAlert,
    FlaskConical,
    Loader2,
    XCircle,
} from 'lucide-react';

import { Button } from '@/src/components/shadcn/button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/src/components/shadcn/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/src/components/shadcn/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/src/components/shadcn/table';

import { useSimulation, useSimulationSteps } from '../../hooks';
import type { SimulationResponse, SimulationStepResponse } from '../../types';
import { SimulationStatusBadge } from './SimulationStatusBadge';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_CHOICES = [10, 20, 50, 100];

interface SimulationStepsViewProps {
    simulationId: string;
}

export function SimulationStepsView({ simulationId }: SimulationStepsViewProps) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);

    const {
        data: simulation,
        isLoading: isLoadingSim,
        error: simError,
    } = useSimulation(simulationId);

    const {
        data: stepsData,
        isLoading: isLoadingSteps,
        isFetching: isFetchingSteps,
        error: stepsError,
    } = useSimulationSteps(simulationId, { page, pageSize: perPage });

    if (isLoadingSim && !simulation) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span>Loading simulation…</span>
            </div>
        );
    }

    if (simError || !simulation) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <CircleAlert className="h-7 w-7 text-rose-500" />
                <span>{simError?.getMessage() ?? 'Simulation not found.'}</span>
                <Link href="/ml-engineer/bandit-demo/history">
                    <Button
                        variant="ghost"
                        className="rounded-lg border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground text-sm"
                    >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                        Back to history
                    </Button>
                </Link>
            </div>
        );
    }

    const steps = stepsData?.steps ?? [];
    const total = stepsData?.pagination.total ?? 0;
    const totalPages = stepsData?.pagination.totalPages ?? 1;
    const startIndex = total === 0 ? 0 : (page - 1) * perPage + 1;
    const endIndex = Math.min(page * perPage, total);
    const pageNumbers = buildPageList(page, totalPages);

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value));
        setPage(1);
    };

    return (
        <div className="pb-24 space-y-5">
            <div>
                <Link
                    href="/ml-engineer/bandit-demo/history"
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-3"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to simulation history
                </Link>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                            <FlaskConical className="h-6 w-6 text-primary" />
                            {simulation.config.datasetFilename}
                        </h1>
                        <p className="text-sm text-muted-foreground/70 mt-1 font-mono">
                            {simulation.id}
                        </p>
                    </div>
                    <SimulationStatusBadge status={simulation.status} />
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <SummaryPanel simulation={simulation} />

            <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Per-step decisions
                </h2>

                {isLoadingSteps && !stepsData ? (
                    <div className="flex items-center gap-2 text-base text-muted-foreground py-10 justify-center border border-white/10 rounded-lg bg-card/30">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Loading steps…
                    </div>
                ) : stepsError ? (
                    <div className="flex items-center gap-2 text-base text-rose-300 py-10 justify-center border border-rose-500/20 rounded-lg bg-rose-500/[0.06]">
                        <CircleAlert className="h-4 w-4" />
                        {stepsError.getMessage()}
                    </div>
                ) : steps.length === 0 ? (
                    <div className="text-center text-base text-muted-foreground py-10 border border-white/10 rounded-lg bg-card/30">
                        No step records are available for this simulation yet.
                    </div>
                ) : (
                    <div className={`transition-opacity duration-200 ${isFetchingSteps ? 'opacity-60' : ''}`}>
                        <div className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b border-white/10">
                                        <TableHead className="w-[60px]"></TableHead>
                                        <TableHead className="w-[70px]">Step</TableHead>
                                        <TableHead>Selection</TableHead>
                                        <TableHead className="w-[120px]">Confidence</TableHead>
                                        <TableHead className="w-[130px]">Safety</TableHead>
                                        <TableHead className="w-[100px] text-right">Reward</TableHead>
                                        <TableHead className="w-[100px] text-right">Regret</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {steps.map((step) => (
                                        <StepRow key={step.step} step={step} />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Show</span>
                                    <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                                        <SelectTrigger className="w-[70px] h-8 text-sm rounded-lg border-white/10 bg-card/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-white/10 bg-card">
                                            {PAGE_SIZE_CHOICES.map((size) => (
                                                <SelectItem key={size} value={String(size)}>
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-muted-foreground">
                                        {startIndex}-{endIndex} of {total}
                                    </span>
                                </div>

                                <Pagination className="w-auto mx-0">
                                    <PaginationContent className="gap-1">
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (page > 1) setPage(page - 1);
                                                }}
                                                className={`h-8 rounded-lg border-white/10 text-sm ${
                                                    page === 1 ? 'pointer-events-none opacity-50' : ''
                                                }`}
                                            />
                                        </PaginationItem>
                                        {pageNumbers.map((p, idx) =>
                                            p === 'ellipsis' ? (
                                                <PaginationItem key={`ellipsis-${idx}`}>
                                                    <PaginationEllipsis className="h-8 w-8" />
                                                </PaginationItem>
                                            ) : (
                                                <PaginationItem key={p}>
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setPage(p);
                                                        }}
                                                        isActive={page === p}
                                                        className="h-8 w-8 rounded-lg text-sm border-white/10"
                                                    >
                                                        {p}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ),
                                        )}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (page < totalPages) setPage(page + 1);
                                                }}
                                                className={`h-8 rounded-lg border-white/10 text-sm ${
                                                    page === totalPages ? 'pointer-events-none opacity-50' : ''
                                                }`}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Summary panel — surfaces config + final aggregates from GET /simulations/{id}
// ---------------------------------------------------------------------------

function SummaryPanel({ simulation }: { simulation: SimulationResponse }) {
    const { config, aggregates, currentStep, errorMessage } = simulation;

    const stats: { label: string; value: string }[] = [
        {
            label: 'Rows processed',
            value: `${currentStep.toLocaleString()} / ${config.datasetRowCount.toLocaleString()}`,
        },
        {
            label: 'Final accuracy',
            value: aggregates.finalAccuracy != null
                ? `${(aggregates.finalAccuracy * 100).toFixed(1)}%`
                : '—',
        },
        {
            label: 'Mean reward',
            value: aggregates.meanReward != null ? aggregates.meanReward.toFixed(3) : '—',
        },
        {
            label: 'Mean regret',
            value: aggregates.meanRegret != null ? aggregates.meanRegret.toFixed(3) : '—',
        },
        {
            label: 'Exploration rate',
            value: aggregates.thompsonExplorationRate != null
                ? `${(aggregates.thompsonExplorationRate * 100).toFixed(1)}%`
                : '—',
        },
        {
            label: 'Seed',
            value: String(config.randomSeed),
        },
    ];

    return (
        <div className="border border-white/10 bg-card/30 rounded-lg p-4 space-y-3 backdrop-blur-sm">
            {errorMessage && (
                <div className="p-3 border border-rose-500/20 bg-rose-500/[0.08] text-sm text-rose-200/90 rounded-lg">
                    <span className="font-semibold text-rose-300">Failed:</span> {errorMessage}
                </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-3">
                {stats.map((s) => (
                    <div key={s.label}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {s.label}
                        </p>
                        <p className="text-md font-bold text-foreground tabular-nums">{s.value}</p>
                    </div>
                ))}
            </div>
            <div className="pt-2 text-xs text-muted-foreground border-t border-white/10">
                ε₀ {config.initialEpsilon} · decay {config.epsilonDecay} · ε_min {config.minEpsilon} · reset posterior{' '}
                {config.resetPosterior ? 'yes' : 'no'}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Step row — collapsible detail with full SimulationStepResponse fields
// ---------------------------------------------------------------------------

const CONFIDENCE_STYLES: Record<
    'HIGH' | 'MODERATE' | 'LOW',
    { tone: string; label: string }
> = {
    HIGH: { tone: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300', label: 'HIGH' },
    MODERATE: { tone: 'bg-warning/10 border-warning/30 text-warning', label: 'MODERATE' },
    LOW: { tone: 'bg-rose-500/10 border-rose-400/30 text-rose-300', label: 'LOW' },
};

const SAFETY_STYLES: Record<
    'CLEAR' | 'WARNING' | 'CONTRAINDICATION_FOUND',
    { tone: string; label: string }
> = {
    CLEAR: { tone: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300', label: 'CLEAR' },
    WARNING: { tone: 'bg-warning/10 border-warning/30 text-warning', label: 'WARNING' },
    CONTRAINDICATION_FOUND: {
        tone: 'bg-rose-500/10 border-rose-400/30 text-rose-300',
        label: 'CONTRAINDICATION',
    },
};

function StepRow({ step }: { step: SimulationStepResponse }) {
    const [expanded, setExpanded] = useState(false);

    const { decision, oracle, outcome, safety, exploration, patient, aggregates, epsilon } = step;
    const confidence = CONFIDENCE_STYLES[decision.confidenceLabel];
    const safetyChip = SAFETY_STYLES[safety.status];
    const matched = outcome.matchedOracle;

    return (
        <>
            <TableRow
                onClick={() => setExpanded(!expanded)}
                className="border-b border-white/10 hover:bg-white/[0.02] cursor-pointer"
            >
                <TableCell>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-lg text-muted-foreground hover:bg-transparent hover:text-foreground"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        aria-label={expanded ? 'Collapse step detail' : 'Expand step detail'}
                    >
                        {expanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                        )}
                    </Button>
                </TableCell>
                <TableCell className="font-mono text-sm text-foreground tabular-nums">
                    #{step.step}
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                        {matched ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                        )}
                        <span className="font-semibold text-foreground">{decision.selectedTreatment}</span>
                        {!matched && (
                            <span className="text-muted-foreground">
                                (optimal: <span className="text-foreground">{oracle.optimalTreatment}</span>)
                            </span>
                        )}
                    </div>
                </TableCell>
                <TableCell>
                    <span
                        className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${confidence.tone}`}
                    >
                        {confidence.label} · {decision.confidencePct.toFixed(0)}%
                    </span>
                </TableCell>
                <TableCell>
                    <span
                        className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${safetyChip.tone}`}
                    >
                        {safetyChip.label}
                    </span>
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-foreground tabular-nums">
                    {outcome.observedReward.toFixed(3)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums">
                    <span className={outcome.instantaneousRegret > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                        {outcome.instantaneousRegret.toFixed(3)}
                    </span>
                </TableCell>
            </TableRow>

            {expanded && (
                <TableRow className="border-b border-white/10 bg-white/[0.02]">
                    <TableCell colSpan={7} className="p-0">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <DetailBlock title="Patient features">
                                <KV label="Age" value={patient.age} />
                                <KV label="BMI" value={patient.bmi} />
                                <KV label="HbA1c" value={patient.hba1c_baseline} />
                                <KV label="eGFR" value={patient.egfr} />
                                <KV label="Duration (y)" value={patient.diabetes_duration} />
                                <KV label="Fasting glucose" value={patient.fasting_glucose} />
                                <KV label="C-peptide" value={patient.c_peptide} />
                                <KV label="BP systolic" value={patient.bp_systolic} />
                                <KV label="LDL / HDL" value={`${patient.ldl} / ${patient.hdl}`} />
                                <KV label="Triglycerides" value={patient.triglycerides} />
                                <KV label="ALT" value={patient.alt} />
                                <KV
                                    label="Conditions"
                                    value={[
                                        patient.cvd && 'CVD',
                                        patient.ckd && 'CKD',
                                        patient.nafld && 'NAFLD',
                                        patient.hypertension && 'HTN',
                                    ]
                                        .filter(Boolean)
                                        .join(', ') || 'None'}
                                />
                            </DetailBlock>

                            <DetailBlock title="Oracle rewards">
                                {Object.entries(oracle.rewards).map(([name, r]) => (
                                    <KV
                                        key={name}
                                        label={name}
                                        value={r.toFixed(3)}
                                        emphasize={name === oracle.optimalTreatment}
                                    />
                                ))}
                            </DetailBlock>

                            <DetailBlock title="Posterior means">
                                {Object.entries(decision.posteriorMeans).map(([name, mean]) => (
                                    <KV
                                        key={name}
                                        label={name}
                                        value={mean.toFixed(3)}
                                        emphasize={name === decision.selectedTreatment}
                                    />
                                ))}
                                <KV label="Mean gap" value={decision.meanGap.toFixed(3)} />
                                <KV
                                    label="Runner-up"
                                    value={`${decision.runnerUp} (${(decision.runnerUpWinrate * 100).toFixed(1)}%)`}
                                />
                            </DetailBlock>

                            <DetailBlock title="Exploration & safety">
                                <KV
                                    label="Explored"
                                    value={
                                        exploration.thompsonExplored
                                            ? 'Thompson'
                                            : exploration.epsilonExplored
                                              ? 'ε-greedy'
                                              : 'Exploited'
                                    }
                                />
                                <KV label="Posterior best" value={exploration.posteriorMeanBest} />
                                <KV label="Epsilon" value={epsilon.toFixed(4)} />
                                {safety.contraindications.length > 0 && (
                                    <KV
                                        label="Contraindications"
                                        value={safety.contraindications.join(', ')}
                                    />
                                )}
                                {safety.warnings.length > 0 && (
                                    <KV label="Warnings" value={safety.warnings.join(', ')} />
                                )}
                                <KV
                                    label="Running accuracy"
                                    value={`${(aggregates.runningAccuracy * 100).toFixed(1)}%`}
                                />
                                <KV
                                    label="Cumulative reward"
                                    value={aggregates.cumulativeReward.toFixed(2)}
                                />
                                <KV
                                    label="Cumulative regret"
                                    value={aggregates.cumulativeRegret.toFixed(2)}
                                />
                            </DetailBlock>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

function DetailBlock({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {title}
            </p>
            <div className="space-y-1">{children}</div>
        </div>
    );
}

function KV({
    label,
    value,
    emphasize,
}: {
    label: string;
    value: string | number;
    emphasize?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span
                className={`tabular-nums font-mono ${emphasize ? 'text-primary font-semibold' : 'text-foreground'}`}
            >
                {value}
            </span>
        </div>
    );
}

function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];
    if (total <= 5) {
        for (let i = 1; i <= total; i++) pages.push(i);
        return pages;
    }
    pages.push(1);
    if (current > 3) pages.push('ellipsis');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('ellipsis');
    pages.push(total);
    return pages;
}
