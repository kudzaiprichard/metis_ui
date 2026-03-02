'use client';

import { useState, useMemo } from 'react';
import {
    useSearchSimilarPatients,
    useSearchSimilarPatientsGraph,
    useAutoSearchSimilarPatients,
    useAutoSearchSimilarPatientsGraph,
} from '../../hooks/useSimilarPatients';
import { FindSimilarPatientsRequest } from '../../api/similar-patients.types';
import { SearchFilters } from './SearchFilters';
import { SimilarPatientsList } from '../list/SimilarPatientsList';
import { SimilarPatientsGraph } from '../graph/SimilarPatientsGraph';
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

type ViewType = 'cards' | 'table' | 'graph';

export function SimilarPatientsSearch({ defaultPatientId, defaultMedicalDataId, autoSearch = false }: SimilarPatientsSearchProps) {
    const [patientId, setPatientId] = useState(defaultPatientId || '');
    const [medicalDataId, setMedicalDataId] = useState(defaultMedicalDataId || '');
    const [limit, setLimit] = useState(5);
    const [treatmentFilter, setTreatmentFilter] = useState('');
    const [minSimilarity, setMinSimilarity] = useState(0.5);
    const [viewMode, setViewMode] = useState<ViewType>('cards');

    // Stable params for auto-search queries (only from defaults, doesn't change with user input)
    const autoSearchParams = useMemo<FindSimilarPatientsRequest>(() => {
        const params: FindSimilarPatientsRequest = {
            limit: 5,
            min_similarity: 0.5,
        };
        if (defaultMedicalDataId?.trim()) {
            params.medical_data_id = defaultMedicalDataId.trim();
        } else if (defaultPatientId?.trim()) {
            params.patient_id = defaultPatientId.trim();
        }
        return params;
    }, [defaultPatientId, defaultMedicalDataId]);

    // Auto-search queries — enabled only when autoSearch is true and we have an ID
    const autoTabular = useAutoSearchSimilarPatients(
        autoSearch ? autoSearchParams : {}
    );
    const autoGraph = useAutoSearchSimilarPatientsGraph(
        autoSearch && viewMode === 'graph' ? autoSearchParams : {}
    );

    // Manual search mutations — for user-initiated searches
    const searchMutation = useSearchSimilarPatients();
    const searchGraphMutation = useSearchSimilarPatientsGraph();

    const buildSearchParams = (): FindSimilarPatientsRequest => {
        const params: FindSimilarPatientsRequest = {
            limit,
            treatment_filter: treatmentFilter || undefined,
            min_similarity: minSimilarity,
        };
        if (medicalDataId.trim()) {
            params.medical_data_id = medicalDataId.trim();
        } else if (patientId.trim()) {
            params.patient_id = patientId.trim();
        }
        return params;
    };

    const canSearch = !!(patientId.trim() || medicalDataId.trim());

    const handleSearch = () => {
        if (!canSearch) return;
        const params = buildSearchParams();
        if (viewMode === 'graph') searchGraphMutation.mutate(params);
        else searchMutation.mutate(params);
    };

    const handleReset = () => {
        setPatientId(defaultPatientId || '');
        setMedicalDataId(defaultMedicalDataId || '');
        setLimit(5);
        setTreatmentFilter('');
        setMinSimilarity(0.5);
        searchMutation.reset();
        searchGraphMutation.reset();
    };

    const handleViewModeChange = (mode: ViewType) => {
        setViewMode(mode);
        if (canSearch && (mode === 'graph' || viewMode === 'graph')) {
            const params = buildSearchParams();
            if (mode === 'graph') searchGraphMutation.mutate(params);
            else searchMutation.mutate(params);
        }
    };

    // Resolve data: manual search takes priority over auto-search
    const tabularData = searchMutation.data ?? autoTabular.data;
    const graphData = searchGraphMutation.data ?? autoGraph.data;
    const tabularError = searchMutation.isError || autoTabular.isError;
    const graphError = searchGraphMutation.isError || autoGraph.isError;
    const isLoading = searchMutation.isPending || searchGraphMutation.isPending || autoTabular.isLoading || autoGraph.isLoading;
    const hasSearched = !!(tabularData || graphData || tabularError || graphError);

    const resultsCount = viewMode === 'graph'
        ? graphData?.metadata.results_found
        : tabularData?.total_found;

    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-[28px] font-bold text-foreground tracking-tight">Similar Patients</h1>
                <p className="text-[13px] text-muted-foreground/50 mt-1">Find similar historical cases to inform treatment decisions</p>
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

            {/* Loading state for auto-search */}
            {isLoading && !tabularData && !graphData && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 className="h-7 w-7 animate-spin text-primary mb-3" />
                    <h3 className="text-[16px] font-semibold text-foreground/70 mb-1.5">Searching...</h3>
                    <p className="text-[13px] text-muted-foreground/50">Finding similar historical cases</p>
                </div>
            )}

            {/* Results */}
            {hasSearched && !isLoading && (
                <>
                    {(tabularError || graphError) && !tabularData && !graphData && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-none bg-red-500/10 border border-red-500/15 flex items-center justify-center mb-4">
                                <TriangleAlert className="h-7 w-7 text-red-500/50" />
                            </div>
                            <h3 className="text-[16px] font-semibold text-foreground/70 mb-1.5">Search Failed</h3>
                            <p className="text-[13px] text-muted-foreground/50">Unable to find similar patients. Please try again.</p>
                        </div>
                    )}

                    {(tabularData || graphData) && (
                        <>
                            {/* Results Header */}
                            <div className="flex justify-between items-center mt-8 mb-5 pb-4 border-b border-white/[0.08]">
                                <div>
                                    <h2 className="text-[18px] font-semibold text-foreground mb-0.5">Search Results</h2>
                                    <p className="text-[12px] text-muted-foreground/50">
                                        Found {resultsCount} similar case{resultsCount !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                {/* View Toggle */}
                                <div className="flex gap-1 bg-white/[0.08] border border-white/15 rounded-none p-1">
                                    {([['cards', LayoutGrid], ['table', Table], ['graph', GitFork]] as const).map(([mode, Icon]) => (
                                        <button
                                            key={mode}
                                            onClick={() => handleViewModeChange(mode)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-none transition-colors ${viewMode === mode ? 'bg-primary/20 text-primary' : 'text-muted-foreground/60 hover:text-foreground/90 hover:bg-white/[0.05]'}`}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Results Display */}
                            {viewMode === 'graph' ? (
                                graphData && (
                                    <SimilarPatientsGraph graphData={graphData} />
                                )
                            ) : (
                                tabularData && (
                                    tabularData.similar_cases.length > 0 ? (
                                        <SimilarPatientsList cases={tabularData.similar_cases} viewMode={viewMode} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 rounded-none bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                                                <UsersRound className="h-7 w-7 text-muted-foreground/30" />
                                            </div>
                                            <h3 className="text-[16px] font-semibold text-foreground/70 mb-1.5">No Similar Cases Found</h3>
                                            <p className="text-[13px] text-muted-foreground/50">Try adjusting your filters or lowering the minimum similarity threshold.</p>
                                        </div>
                                    )
                                )
                            )}
                        </>
                    )}
                </>
            )}

            {/* Initial State — only show when no auto-search and no manual search */}
            {!hasSearched && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-none bg-primary/10 border border-primary/15 flex items-center justify-center mb-4">
                        <Search className="h-7 w-7 text-primary/50" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-foreground/70 mb-1.5">Ready to Search</h3>
                    <p className="text-[13px] text-muted-foreground/50">Enter a patient ID or medical record ID and click search to find similar historical cases</p>
                </div>
            )}
        </div>
    );
}