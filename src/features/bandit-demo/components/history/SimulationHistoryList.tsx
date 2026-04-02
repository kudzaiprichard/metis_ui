/**
 * SimulationHistoryList — paginated list of past simulations.
 *
 * Spec §6 "Simulation Endpoints Reference" → GET /simulations.
 * Pairs with:
 *   • SimulationStatusBadge (status chip)
 *   • DeleteSimulationDialog (delete flow with cancel-first orchestration)
 *
 * Rows link to the per-step drill-down route. Newest first is a spec guarantee
 * from the backend, so we don't re-sort client-side.
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    Activity,
    ChartLine,
    CircleAlert,
    Database,
    FlaskConical,
    Loader2,
    Plus,
    Trash2,
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

import { useSimulations } from '../../hooks';
import type { SimulationResponse } from '../../types';
import { DeleteSimulationDialog } from './DeleteSimulationDialog';
import { SimulationStatusBadge } from './SimulationStatusBadge';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_CHOICES = [10, 20, 30, 50];

export function SimulationHistoryList() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
    const [toDelete, setToDelete] = useState<SimulationResponse | null>(null);

    const { data, isLoading, isFetching, error } = useSimulations({
        page,
        pageSize: perPage,
    });

    const simulations = data?.simulations ?? [];
    const total = data?.pagination.total ?? 0;
    const totalPages = data?.pagination.totalPages ?? 1;
    const startIndex = total === 0 ? 0 : (page - 1) * perPage + 1;
    const endIndex = Math.min(page * perPage, total);

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value));
        setPage(1);
    };

    const pageNumbers = buildPageList(page, totalPages);

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span>Loading simulation history...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <CircleAlert className="h-7 w-7 text-rose-500" />
                <span>{error.getMessage()}</span>
            </div>
        );
    }

    return (
        <div className="pb-24 space-y-5">
            <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <FlaskConical className="h-7 w-7 text-primary" />
                        Simulation History
                    </h1>
                    <p className="text-base text-muted-foreground/70 mt-1">
                        Past bandit runs — drill into per-step decisions or delete finished simulations.
                    </p>
                </div>
                <Link href="/ml-engineer/bandit-demo">
                    <Button
                        className="rounded-lg h-9 px-4 text-base font-semibold bg-primary hover:bg-primary/80 text-primary-foreground border-0"
                    >
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        New Simulation
                    </Button>
                </Link>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="flex items-center gap-3 px-4 py-3 bg-card/30 border border-white/10 rounded-lg backdrop-blur-sm">
                <Database className="h-4 w-4 text-primary" />
                <span className="text-base text-muted-foreground font-medium">Total runs:</span>
                <span className="text-lg font-bold text-foreground tracking-tight">{total}</span>
            </div>

            {simulations.length > 0 ? (
                <div className={`transition-opacity duration-200 ${isFetching ? 'opacity-60' : ''}`}>
                    <div className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-white/10">
                                    <TableHead className="w-[130px]">Status</TableHead>
                                    <TableHead>Dataset</TableHead>
                                    <TableHead className="w-[130px]">Progress</TableHead>
                                    <TableHead className="w-[150px]">Accuracy</TableHead>
                                    <TableHead className="w-[170px]">Created</TableHead>
                                    <TableHead className="w-[140px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {simulations.map((sim) => (
                                    <SimulationRow
                                        key={sim.id}
                                        simulation={sim}
                                        onDelete={() => setToDelete(sim)}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Show</span>
                                <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                                    <SelectTrigger className="w-[65px] h-8 text-sm rounded-lg border-white/10 bg-card/30">
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
            ) : (
                <EmptyState />
            )}

            <DeleteSimulationDialog
                isOpen={!!toDelete}
                onClose={() => setToDelete(null)}
                simulation={toDelete}
            />
        </div>
    );
}

function SimulationRow({
    simulation,
    onDelete,
}: {
    simulation: SimulationResponse;
    onDelete: () => void;
}) {
    const { id, status, currentStep, config, aggregates, createdAt } = simulation;
    const total = config.datasetRowCount;
    const completion = total > 0 ? Math.min(100, Math.round((currentStep / total) * 100)) : 0;
    const accuracyDisplay =
        aggregates.finalAccuracy != null
            ? `${(aggregates.finalAccuracy * 100).toFixed(1)}%`
            : status === 'RUNNING' || status === 'PENDING'
              ? '—'
              : 'N/A';

    return (
        <TableRow className="border-b border-white/10 hover:bg-white/[0.02]">
            <TableCell>
                <SimulationStatusBadge status={status} variant="compact" />
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-0.5">
                    <span className="text-base font-medium text-foreground truncate max-w-[320px]">
                        {config.datasetFilename}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {total.toLocaleString()} rows · seed {config.randomSeed}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-mono text-foreground tabular-nums">
                        {currentStep.toLocaleString()} / {total.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">{completion}%</span>
                </div>
            </TableCell>
            <TableCell>
                <span className="text-base font-mono text-foreground tabular-nums">
                    {accuracyDisplay}
                </span>
            </TableCell>
            <TableCell>
                <span className="text-sm text-muted-foreground">
                    {formatTimestamp(createdAt)}
                </span>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <Link href={`/ml-engineer/bandit-demo/history/${id}`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-lg border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground text-xs font-semibold"
                        >
                            <ChartLine className="h-3 w-3 mr-1" />
                            Steps
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.04] text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                        aria-label="Delete simulation"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-white/10 rounded-lg bg-card/30">
            <div className="w-16 h-16 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                <Activity className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No simulations yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Upload a patient CSV to run your first bandit simulation.
            </p>
            <Link href="/ml-engineer/bandit-demo" className="mt-5">
                <Button
                    variant="ghost"
                    className="rounded-lg h-9 px-4 text-base font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                >
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Start Simulation
                </Button>
            </Link>
        </div>
    );
}

function formatTimestamp(iso: string): string {
    try {
        return new Date(iso).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return iso;
    }
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
