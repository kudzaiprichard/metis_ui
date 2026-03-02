'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/src/components/shadcn/card';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/src/components/shadcn/select';
import { useRecommendations } from '../../hooks/useRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { RecommendationTableRow } from './RecommendationTableRow';
import { DeleteRecommendationDialog } from './DeleteRecommendationDialog';
import { PredictionSkeleton } from '../shared/PredictionSkeleton';
import { PageLoader } from '@/src/components/shared/ui/page-loader';
import { Prediction } from '../../api/recommendations.types';
import {
    Brain,
    ChartLine,
    Filter,
    Download,
    Search,
    RotateCw,
    LayoutGrid,
    Table,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from 'lucide-react';

type ViewMode = 'grid' | 'table';

interface RecommendationsListProps {
    patientId?: string;
}

export function RecommendationsList({ patientId }: RecommendationsListProps = {}) {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [searchInput, setSearchInput] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [deleteTarget, setDeleteTarget] = useState<Prediction | null>(null);

    const { data, isLoading, error } = useRecommendations({
        page,
        per_page: perPage,
        patient_id: patientId,
    });

    const handleSearchClick = () => { setActiveSearch(searchInput); setPage(1); };
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearchClick(); };
    const handleRefresh = () => { setSearchInput(''); setActiveSearch(''); setPage(1); };

    const getPageNumbers = () => {
        if (!data?.pagination) return [];
        const pages: (number | string)[] = [];
        const total = data.pagination.total_pages;
        if (total <= 5) { for (let i = 1; i <= total; i++) pages.push(i); }
        else if (page <= 3) { for (let i = 1; i <= 4; i++) pages.push(i); pages.push('...', total); }
        else if (page >= total - 2) { pages.push(1, '...'); for (let i = total - 3; i <= total; i++) pages.push(i); }
        else { pages.push(1, '...', page - 1, page, page + 1, '...', total); }
        return pages;
    };

    const sorted = data?.predictions ? [...data.predictions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];
    const totalPredictions = data?.pagination?.total || 0;
    const avgConfidence = sorted.length > 0 ? sorted.reduce((s, p) => s + parseFloat(p.confidence_score), 0) / sorted.length : 0;

    const pageTitle = patientId ? 'Patient Predictions' : 'AI Predictions';
    const pageSubtitle = patientId ? 'Treatment recommendations for this patient' : 'Treatment recommendations powered by machine learning';

    if (isLoading && !data) {
        return (
            <PageLoader
                isLoading={true}
                fullPage={false}
                size="medium"
                loadingText="Loading predictions..."
                subText="Please wait while we fetch your data"
            />
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-[14px]">
                <div className="h-7 w-7 text-red-500"><Brain className="h-7 w-7" /></div>
                <span>Error loading predictions</span>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-5 mb-6">
                <div>
                    <h1 className="text-[28px] font-bold text-foreground tracking-tight">{pageTitle}</h1>
                    <p className="text-[13px] text-muted-foreground/50 mt-1">{pageSubtitle}</p>
                </div>
                <div className="flex gap-2.5">
                    <Button variant="ghost" className="rounded-none h-9 px-4 text-[12px] font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">
                        <Filter className="h-3 w-3 mr-1.5" /> Filter
                    </Button>
                    <Button variant="ghost" className="rounded-none h-9 px-4 text-[12px] font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground">
                        <Download className="h-3 w-3 mr-1.5" /> Export
                    </Button>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="border-white/[0.08] bg-white/[0.03] rounded-none p-5 flex items-center gap-4 hover:bg-white/[0.05] hover:border-primary/20 transition-all">
                    <div className="w-12 h-12 rounded-none bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Predictions</p>
                        <p className="text-[24px] font-bold text-foreground tracking-tight">{totalPredictions}</p>
                    </div>
                </Card>
                {totalPredictions > 0 && (
                    <Card className="border-white/[0.08] bg-white/[0.03] rounded-none p-5 flex items-center gap-4 hover:bg-white/[0.05] hover:border-blue-500/20 transition-all">
                        <div className="w-12 h-12 rounded-none bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <ChartLine className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Avg Confidence</p>
                            <p className="text-[24px] font-bold text-foreground tracking-tight">{avgConfidence.toFixed(1)}%</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3 flex-1 flex-wrap">
                    {/* Per Page */}
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <span className="font-medium">Show:</span>
                        <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-[70px] h-9 rounded-none border-white/10 bg-white/[0.03] text-[12px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-white/10 bg-card">
                                {[10, 20, 30, 50].map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search */}
                    <div className="flex items-stretch h-9 border border-white/[0.12] bg-white/[0.04] rounded-none overflow-hidden flex-1 max-w-[420px] focus-within:border-white/20 focus-within:bg-white/[0.06] transition-colors">
                        <div className="flex items-center gap-2.5 px-3 flex-1">
                            <Search className="h-3 w-3 text-muted-foreground/35 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by patient name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleSearchKeyPress}
                                className="bg-transparent border-none outline-none text-[12px] text-foreground placeholder:text-muted-foreground/30 flex-1 min-w-0"
                            />
                        </div>
                        <button
                            onClick={handleSearchClick}
                            disabled={isLoading}
                            className="px-4 bg-primary/15 border-l border-white/[0.08] text-primary text-[12px] font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                            <span>Search</span>
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="px-3 bg-purple-500/[0.12] border-l border-white/[0.08] text-purple-400 hover:bg-purple-500/[0.18] transition-colors disabled:opacity-40 flex items-center"
                        >
                            <RotateCw className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex gap-1 bg-white/[0.08] border border-white/15 rounded-none p-1">
                    {([['grid', LayoutGrid], ['table', Table]] as const).map(([mode, Icon]) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`w-8 h-8 flex items-center justify-center rounded-none transition-colors ${viewMode === mode ? 'bg-primary/20 text-primary' : 'text-muted-foreground/60 hover:text-foreground/90 hover:bg-white/[0.05]'}`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className={`mb-24 ${isLoading ? 'opacity-60' : ''} transition-opacity`}>
                {sorted.length > 0 ? (
                    <>
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {sorted.map((p) => (
                                    <RecommendationCard key={p.id} prediction={p} onDelete={setDeleteTarget} />
                                ))}
                            </div>
                        )}

                        {viewMode === 'table' && (
                            <div className="overflow-x-auto">
                                {/* Table Header */}
                                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1.5fr_1fr] gap-4 py-3 border-b border-white/[0.08] mb-1">
                                    {['Patient', 'Treatment', 'Reduction', 'Confidence', 'Created', 'Actions'].map((h, i) => (
                                        <span
                                            key={h}
                                            className={`text-[10px] text-muted-foreground/50 font-semibold uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}
                                        >
                                            {h}
                                        </span>
                                    ))}
                                </div>
                                {sorted.map((p) => (
                                    <RecommendationTableRow key={p.id} prediction={p} onDelete={setDeleteTarget} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {data?.pagination && (
                            <div className="flex justify-between items-center mt-8 flex-wrap gap-4">
                                <p className="text-[12px] text-muted-foreground/60 font-medium">
                                    Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, data.pagination.total)} of {data.pagination.total} predictions
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="h-8 w-8 rounded-none border border-white/[0.08] bg-white/[0.03] text-muted-foreground/60 hover:bg-white/[0.06] disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    {getPageNumbers().map((pn, i) =>
                                        pn === '...' ? (
                                            <span key={`e-${i}`} className="px-2 text-[12px] text-muted-foreground/40">...</span>
                                        ) : (
                                            <Button
                                                key={pn}
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setPage(pn as number)}
                                                className={`h-8 w-8 rounded-none border text-[12px] font-medium ${page === pn ? 'bg-primary/15 border-primary/30 text-primary font-semibold' : 'border-white/[0.08] bg-white/[0.03] text-muted-foreground/60 hover:bg-white/[0.06]'}`}
                                            >
                                                {pn}
                                            </Button>
                                        )
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === data.pagination.total_pages}
                                        className="h-8 w-8 rounded-none border border-white/[0.08] bg-white/[0.03] text-muted-foreground/60 hover:bg-white/[0.06] disabled:opacity-30"
                                    >
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-none bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                            <Brain className="h-7 w-7 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-[16px] font-semibold text-foreground/70 mb-1.5">No predictions found</h3>
                        <p className="text-[13px] text-muted-foreground/50">
                            {activeSearch ? 'Try adjusting your search criteria' : 'Generate your first AI prediction to get started'}
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <DeleteRecommendationDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                prediction={deleteTarget}
            />
        </>
    );
}