'use client';

import { useMemo, useState } from 'react';
import {
    ArrowDownUp,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    LayoutGrid,
    Sparkles,
    Table2,
} from 'lucide-react';

import { Card, CardContent } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
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
    TableHead,
    TableHeader,
    TableRow,
} from '@/src/components/shadcn/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/src/components/shadcn/tooltip';
import { PatientDetail, MedicalRecord } from '../../../api/patients.types';
import type { PredictionResponse } from '@/src/features/recommendation/api/recommendations.types';
import { MedicalRecordCard } from '../cards/MedicalRecordCard';
import { MedicalRecordRow } from '../rows/MedicalRecordRow';
import { MedicalRecordDetail } from './MedicalRecordDetail';

interface MedicalRecordsListProps {
    patient: PatientDetail;
    predictionsByRecordId: Map<string, PredictionResponse>;
}

type ViewMode = 'card' | 'table';
type SortMode = 'newest' | 'oldest';
type FilterMode = 'all' | 'with-prediction' | 'no-prediction';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

export function MedicalRecordsList({
    patient,
    predictionsByRecordId,
}: MedicalRecordsListProps) {
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [viewMode, setViewMode] = useState<ViewMode>('card');
    const [sort, setSort] = useState<SortMode>('newest');
    const [filter, setFilter] = useState<FilterMode>('all');
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
    const [page, setPage] = useState(1);

    const baseRecords = patient.medicalRecords;

    // Sorted + filtered view of the records.
    const visible = useMemo(() => {
        let list = [...baseRecords];
        list.sort((a, b) => {
            const ad = new Date(a.createdAt).getTime();
            const bd = new Date(b.createdAt).getTime();
            return sort === 'newest' ? bd - ad : ad - bd;
        });
        if (filter === 'with-prediction') {
            list = list.filter((r) => predictionsByRecordId.has(r.id));
        } else if (filter === 'no-prediction') {
            list = list.filter((r) => !predictionsByRecordId.has(r.id));
        }
        return list;
    }, [baseRecords, sort, filter, predictionsByRecordId]);

    const total = baseRecords.length;
    const filteredCount = visible.length;
    const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, filteredCount);
    const pageRecords = visible.slice(startIdx, endIdx);

    // Patient-level rollup stats — drives the section header subtitle.
    const stats = useMemo(() => {
        const withPrediction = baseRecords.filter((r) =>
            predictionsByRecordId.has(r.id),
        ).length;
        const last = baseRecords.length
            ? [...baseRecords].sort(
                  (a, b) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
              )[0]
            : null;
        return { total: baseRecords.length, withPrediction, last };
    }, [baseRecords, predictionsByRecordId]);

    const handleView = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setIsDetailOpen(true);
    };

    const handleFilterChange = (value: FilterMode) => {
        setFilter(value);
        setPage(1);
    };

    const handlePageSizeChange = (value: string) => {
        setPageSize(Number(value));
        setPage(1);
    };

    return (
        <>
            <Card className="border-white/10 bg-card/30 backdrop-blur-sm rounded-lg overflow-hidden p-0">
                {/* Section Header */}
                <div className="flex justify-between items-start px-5 py-4 border-b border-white/5 gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <FolderOpen className="h-4 w-4 text-primary" />
                        <div>
                            <h2 className="text-md font-semibold text-foreground mb-0.5">
                                Medical Records
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {stats.total} visit{stats.total !== 1 ? 's' : ''} ·{' '}
                                {stats.withPrediction} with AI prediction
                                {stats.last && (
                                    <>
                                        {' '}
                                        · last on{' '}
                                        {new Date(stats.last.createdAt).toLocaleDateString(
                                            'en-US',
                                            {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            },
                                        )}
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {total > 0 && (
                        <TooltipProvider>
                            <div className="flex items-center border border-white/10 rounded-lg bg-card/30 p-0.5">
                                {(
                                    [
                                        {
                                            mode: 'card' as ViewMode,
                                            icon: LayoutGrid,
                                            label: 'Card view',
                                        },
                                        {
                                            mode: 'table' as ViewMode,
                                            icon: Table2,
                                            label: 'Table view',
                                        },
                                    ] as const
                                ).map(({ mode, icon: Icon, label }) => (
                                    <Tooltip key={mode}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-pressed={viewMode === mode}
                                                aria-label={label}
                                                onClick={() => setViewMode(mode)}
                                                className={`h-7 w-7 rounded-lg transition-colors ${
                                                    viewMode === mode
                                                        ? 'bg-white/10 text-foreground'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                                }`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">{label}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    )}
                </div>

                {/* Toolbar — sort, filter, page size */}
                {total > 0 && (
                    <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3 border-b border-white/5 text-sm">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <ArrowDownUp className="h-3 w-3" />
                                <span>Sort:</span>
                                <Select
                                    value={sort}
                                    onValueChange={(v) => setSort(v as SortMode)}
                                >
                                    <SelectTrigger className="w-[110px] h-8 rounded-lg bg-white/5 border-white/10 text-xs text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg bg-card border-white/10">
                                        <SelectItem
                                            value="newest"
                                            className="text-xs rounded-lg"
                                        >
                                            Newest first
                                        </SelectItem>
                                        <SelectItem
                                            value="oldest"
                                            className="text-xs rounded-lg"
                                        >
                                            Oldest first
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Sparkles className="h-3 w-3" />
                                <span>Filter:</span>
                                <Select
                                    value={filter}
                                    onValueChange={(v) =>
                                        handleFilterChange(v as FilterMode)
                                    }
                                >
                                    <SelectTrigger className="w-[180px] h-8 rounded-lg bg-white/5 border-white/10 text-xs text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg bg-card border-white/10">
                                        <SelectItem value="all" className="text-xs rounded-lg">
                                            All visits
                                        </SelectItem>
                                        <SelectItem
                                            value="with-prediction"
                                            className="text-xs rounded-lg"
                                        >
                                            With AI prediction
                                        </SelectItem>
                                        <SelectItem
                                            value="no-prediction"
                                            className="text-xs rounded-lg"
                                        >
                                            Without prediction
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Show:</span>
                            <Select
                                value={String(pageSize)}
                                onValueChange={handlePageSizeChange}
                            >
                                <SelectTrigger className="w-[70px] h-8 rounded-lg bg-white/5 border-white/10 text-xs text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg bg-card border-white/10">
                                    {PAGE_SIZE_OPTIONS.map((n) => (
                                        <SelectItem
                                            key={n}
                                            value={String(n)}
                                            className="text-xs rounded-lg"
                                        >
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Records */}
                {total === 0 ? (
                    <EmptyRecords variant="no-records" />
                ) : filteredCount === 0 ? (
                    <EmptyRecords variant="no-match" />
                ) : (
                    <CardContent className="p-5">
                        {viewMode === 'card' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {pageRecords.map((record, idx) => {
                                    const visitNumber =
                                        sort === 'newest'
                                            ? total - (startIdx + idx)
                                            : startIdx + idx + 1;
                                    return (
                                        <MedicalRecordCard
                                            key={record.id}
                                            record={record}
                                            index={visitNumber}
                                            prediction={predictionsByRecordId.get(record.id)}
                                            onView={() => handleView(record)}
                                            onEdit={() => {}}
                                            onDelete={() => {}}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-white/[0.08] hover:bg-transparent">
                                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                                                Visit
                                            </TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                                                HbA1c
                                            </TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                                                BMI
                                            </TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                                                eGFR
                                            </TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                                                BP Sys
                                            </TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                                                Comorb.
                                            </TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                                                AI Prediction
                                            </TableHead>
                                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pageRecords.map((record, idx) => {
                                            const visitNumber =
                                                sort === 'newest'
                                                    ? total - (startIdx + idx)
                                                    : startIdx + idx + 1;
                                            return (
                                                <MedicalRecordRow
                                                    key={record.id}
                                                    record={record}
                                                    index={visitNumber}
                                                    prediction={predictionsByRecordId.get(
                                                        record.id,
                                                    )}
                                                    onView={() => handleView(record)}
                                                />
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                )}

                {/* Pagination footer */}
                {filteredCount > 0 && totalPages > 1 && (
                    <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3 border-t border-white/5 text-xs text-muted-foreground">
                        <span>
                            Showing <span className="text-foreground">{startIdx + 1}</span>–
                            <span className="text-foreground">{endIdx}</span> of{' '}
                            <span className="text-foreground">{filteredCount}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="h-8 px-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] disabled:opacity-30"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="px-2 tabular-nums">
                                Page <span className="text-foreground">{safePage}</span> of{' '}
                                <span className="text-foreground">{totalPages}</span>
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="h-8 px-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] disabled:opacity-30"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Detail Sheet */}
            <MedicalRecordDetail
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                record={selectedRecord}
                prediction={
                    selectedRecord ? predictionsByRecordId.get(selectedRecord.id) : undefined
                }
                onEdit={() => setIsDetailOpen(false)}
                onDelete={() => setIsDetailOpen(false)}
            />
        </>
    );
}

function EmptyRecords({ variant }: { variant: 'no-records' | 'no-match' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                <FolderOpen className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/70 mb-1.5">
                {variant === 'no-records'
                    ? 'No medical records yet'
                    : 'No records match the current filter'}
            </h3>
            <p className="text-base text-muted-foreground/60">
                {variant === 'no-records'
                    ? 'Add the first visit record using the + button below.'
                    : 'Try a different filter or clear it to see all visits.'}
            </p>
        </div>
    );
}
