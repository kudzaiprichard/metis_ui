'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAutoSearchSimilarPatients } from '../../hooks/useSimilarPatients';
import { FindSimilarPatientsRequest } from '../../api/similar-patients.types';
import { SearchFilters } from './SearchFilters';
import { SimilarPatientsList } from '../list/SimilarPatientsList';
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
    LayoutGrid,
    Table,
    GitFork,
    TriangleAlert,
    UsersRound,
    Search,
    Loader2,
} from 'lucide-react';

interface SimilarPatientsSearchProps {
    defaultPatientId?: string;
    defaultMedicalDataId?: string;
    autoSearch?: boolean;
}

type ViewType = 'cards' | 'table';

const PAGE_SIZE = 10;

function buildInitialCommitted(
    autoSearch: boolean,
    defaultPatientId?: string,
    defaultMedicalDataId?: string,
): FindSimilarPatientsRequest | null {
    if (!autoSearch) return null;
    if (defaultMedicalDataId?.trim()) {
        return { limit: 20, min_similarity: 0.5, medical_record_id: defaultMedicalDataId.trim() };
    }
    if (defaultPatientId?.trim()) {
        return { limit: 20, min_similarity: 0.5, patient_id: defaultPatientId.trim() };
    }
    return null;
}

export function SimilarPatientsSearch({ defaultPatientId, defaultMedicalDataId, autoSearch = false }: SimilarPatientsSearchProps) {
    const router = useRouter();
    const [patientId, setPatientId] = useState(defaultPatientId || '');
    const [medicalDataId, setMedicalDataId] = useState(defaultMedicalDataId || '');
    const [limit, setLimit] = useState(20);
    // Multi-select: empty array means "all treatments".
    const [treatmentFilter, setTreatmentFilter] = useState<string[]>([]);
    const [minSimilarity, setMinSimilarity] = useState(0.5);
    const [viewMode, setViewMode] = useState<ViewType>('cards');

    const [page, setPage] = useState(1);

    // "Committed" params drive the query. Setting this to a non-null value is
    // what actually triggers a search (initial mount for auto-search, or the
    // Search button click).
    const [committedParams, setCommittedParams] = useState<FindSimilarPatientsRequest | null>(() =>
        buildInitialCommitted(autoSearch, defaultPatientId, defaultMedicalDataId),
    );

    const tabularQuery = useAutoSearchSimilarPatients(
        committedParams ?? {},
        { page, pageSize: PAGE_SIZE },
    );

    const buildBody = (): FindSimilarPatientsRequest => {
        const body: FindSimilarPatientsRequest = {
            limit,
            treatment_filter: treatmentFilter.length > 0 ? treatmentFilter : undefined,
            min_similarity: minSimilarity,
        };
        if (medicalDataId.trim()) {
            body.medical_record_id = medicalDataId.trim();
        } else if (patientId.trim()) {
            body.patient_id = patientId.trim();
        }
        return body;
    };

    const canSearch = !!(patientId.trim() || medicalDataId.trim());

    const handleSearch = () => {
        if (!canSearch) return;
        setCommittedParams(buildBody());
        setPage(1);
    };

    const handleReset = () => {
        setPatientId(defaultPatientId || '');
        setMedicalDataId(defaultMedicalDataId || '');
        setLimit(20);
        setTreatmentFilter([]);
        setMinSimilarity(0.5);
        setCommittedParams(null);
        setPage(1);
    };

    const handleViewModeChange = (mode: ViewType) => {
        setViewMode(mode);
    };

    const handleOpenGraphView = () => {
        // Forward the full search context — patient/record id AND the active
        // filters (limit, min_similarity, treatment_filter). Without this,
        // the graph view falls back to its own defaults (limit 20, no
        // treatment filter) and the cohort displayed there won't match the
        // table the user just looked at.
        const params = new URLSearchParams();
        if (medicalDataId.trim()) params.set('medicalDataId', medicalDataId.trim());
        else if (patientId.trim()) params.set('patientId', patientId.trim());
        params.set('limit', String(limit));
        params.set('minSimilarity', String(minSimilarity));
        // Multi-value: each treatment becomes its own `treatmentFilter` entry
        // so the graph page can read them via `searchParams.getAll(...)`.
        treatmentFilter.forEach(t => params.append('treatmentFilter', t));
        router.push(`/doctor/graph-view?${params.toString()}`);
    };

    const tabularData = tabularQuery.data;
    const tabularError = tabularQuery.isError;
    const isLoading = tabularQuery.isFetching;
    const hasSearched = !!committedParams;

    const resultsCount = tabularData?.pagination.total;

    const totalPages = tabularData?.pagination.totalPages ?? 0;

    const getPageNumbers = (): (number | string)[] => {
        if (!totalPages) return [];
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (page <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push('...');
            pages.push(totalPages);
        } else if (page >= totalPages - 2) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            pages.push(page - 1);
            pages.push(page);
            pages.push(page + 1);
            pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Similar Patients</h1>
                <p className="text-base text-muted-foreground/50 mt-1">Find similar historical cases to inform treatment decisions</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

            {/* Filters */}
            <SearchFilters
                patientId={patientId}
                onPatientIdChange={setPatientId}
                medicalDataId={medicalDataId}
                onMedicalDataIdChange={setMedicalDataId}
                limit={limit}
                onLimitChange={setLimit}
                treatmentFilter={treatmentFilter}
                onTreatmentFilterChange={setTreatmentFilter}
                minSimilarity={minSimilarity}
                onMinSimilarityChange={setMinSimilarity}
                onSearch={handleSearch}
                onReset={handleReset}
                isLoading={isLoading}
                disabled={!canSearch}
            />

            {/* Loading state for first fetch */}
            {isLoading && !tabularData && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="h-7 w-7 animate-spin text-primary mb-3" />
                    <h3 className="text-lg font-semibold text-foreground/70 mb-1.5">Searching...</h3>
                    <p className="text-base text-muted-foreground/50">Finding similar historical cases</p>
                </div>
            )}

            {/* Results */}
            {hasSearched && !isLoading && (
                <>
                    {tabularError && !tabularData && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center mb-4">
                                <TriangleAlert className="h-7 w-7 text-red-500/50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground/70 mb-1.5">Search Failed</h3>
                            <p className="text-base text-muted-foreground/50">Unable to find similar patients. Please try again.</p>
                        </div>
                    )}

                    {tabularData && (
                        <>
                            {/* Results Header */}
                            <div className="flex justify-between items-center mt-8 mb-5 pb-4 border-b border-white/[0.08]">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground mb-0.5">Search Results</h2>
                                    <p className="text-sm text-muted-foreground/50">
                                        Found {resultsCount} similar case{resultsCount !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* View Toggle */}
                                    <div className="flex gap-1 bg-white/[0.08] border border-white/15 rounded-lg p-1">
                                        {([['cards', LayoutGrid], ['table', Table]] as const).map(([mode, Icon]) => (
                                            <button
                                                key={mode}
                                                onClick={() => handleViewModeChange(mode)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${viewMode === mode ? 'bg-primary/20 text-primary' : 'text-muted-foreground/60 hover:text-foreground/90 hover:bg-white/[0.05]'}`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Graph View opens dedicated full-screen page */}
                                    <button
                                        onClick={handleOpenGraphView}
                                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary/15 text-primary border border-primary/25 hover:bg-primary/20 transition-colors text-xs font-medium"
                                    >
                                        <GitFork className="h-3.5 w-3.5" />
                                        Graph View
                                    </button>
                                </div>
                            </div>

                            {/* Results Display */}
                            {tabularData.cases.length > 0 ? (
                                <>
                                    <SimilarPatientsList cases={tabularData.cases} viewMode={viewMode} />

                                    {/* Pagination — spec §5 returns PaginatedResponse[SimilarPatientCaseResponse] */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center mt-6 mb-24">
                                            <Pagination className="w-auto mx-0">
                                                <PaginationContent className="gap-1.5">
                                                    <PaginationItem>
                                                        <PaginationPrevious
                                                            onClick={() => page > 1 && setPage(page - 1)}
                                                            className={
                                                                page === 1 ? 'pointer-events-none opacity-30' : 'cursor-pointer'
                                                            }
                                                        />
                                                    </PaginationItem>
                                                    {getPageNumbers().map((p, i) => (
                                                        <PaginationItem key={`page-${i}`}>
                                                            {p === '...' ? (
                                                                <PaginationEllipsis className="text-muted-foreground/50" />
                                                            ) : (
                                                                <PaginationLink
                                                                    onClick={() => setPage(p as number)}
                                                                    isActive={p === page}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {p}
                                                                </PaginationLink>
                                                            )}
                                                        </PaginationItem>
                                                    ))}
                                                    <PaginationItem>
                                                        <PaginationNext
                                                            onClick={() => page < totalPages && setPage(page + 1)}
                                                            className={
                                                                page === totalPages ? 'pointer-events-none opacity-30' : 'cursor-pointer'
                                                            }
                                                        />
                                                    </PaginationItem>
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                                        <UsersRound className="h-7 w-7 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground/70 mb-1.5">No Similar Cases Found</h3>
                                    <p className="text-base text-muted-foreground/50">Try adjusting your filters or lowering the minimum similarity threshold.</p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Initial State — only show when no auto-search and no manual search */}
            {!hasSearched && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center mb-4">
                        <Search className="h-7 w-7 text-primary/50" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground/70 mb-1.5">Ready to Search</h3>
                    <p className="text-base text-muted-foreground/50">Enter a patient ID or medical record ID and click search to find similar historical cases</p>
                </div>
            )}
        </div>
    );
}
