// src/features/similar-patients/components/search/SimilarPatientsSearch.tsx

'use client';

import { useState } from 'react';
import { useSearchSimilarPatients, useSearchSimilarPatientsGraph } from '../../hooks/useSimilarPatients';
import { SearchFilters } from './SearchFilters';
import { SimilarPatientsList } from '../list/SimilarPatientsList';
import { SimilarPatientsGraph } from '../graph/SimilarPatientsGraph';

interface SimilarPatientsSearchProps {
    defaultPatientId?: string;
}

type ViewType = 'cards' | 'table' | 'graph';

export function SimilarPatientsSearch({ defaultPatientId }: SimilarPatientsSearchProps) {
    const [patientId, setPatientId] = useState(defaultPatientId || '');
    const [limit, setLimit] = useState(5);
    const [treatmentFilter, setTreatmentFilter] = useState('');
    const [minSimilarity, setMinSimilarity] = useState(0.5);
    const [viewMode, setViewMode] = useState<ViewType>('cards');

    const searchMutation = useSearchSimilarPatients();
    const searchGraphMutation = useSearchSimilarPatientsGraph();

    const handleSearch = () => {
        if (!patientId.trim()) {
            return;
        }

        const searchParams = {
            patient_id: patientId,
            limit,
            treatment_filter: treatmentFilter || undefined,
            min_similarity: minSimilarity,
        };

        // Search based on current view mode
        if (viewMode === 'graph') {
            searchGraphMutation.mutate(searchParams);
        } else {
            searchMutation.mutate(searchParams);
        }
    };

    const handleReset = () => {
        setPatientId(defaultPatientId || '');
        setLimit(5);
        setTreatmentFilter('');
        setMinSimilarity(0.5);
        searchMutation.reset();
        searchGraphMutation.reset();
    };

    const handleViewModeChange = (mode: ViewType) => {
        setViewMode(mode);
        // If switching to/from graph and we have search params, re-search
        if (patientId.trim() && (mode === 'graph' || viewMode === 'graph')) {
            const searchParams = {
                patient_id: patientId,
                limit,
                treatment_filter: treatmentFilter || undefined,
                min_similarity: minSimilarity,
            };

            if (mode === 'graph') {
                searchGraphMutation.mutate(searchParams);
            } else {
                searchMutation.mutate(searchParams);
            }
        }
    };

    const hasSearched = searchMutation.data || searchMutation.isError || searchGraphMutation.data || searchGraphMutation.isError;
    const isLoading = searchMutation.isPending || searchGraphMutation.isPending;

    return (
        <>
            <div className="search-container">
                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Similar Patients</h1>
                        <p className="page-subtitle">Find similar historical cases to inform treatment decisions</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="divider"></div>

                {/* Search Filters */}
                <SearchFilters
                    patientId={patientId}
                    onPatientIdChange={setPatientId}
                    limit={limit}
                    onLimitChange={setLimit}
                    treatmentFilter={treatmentFilter}
                    onTreatmentFilterChange={setTreatmentFilter}
                    minSimilarity={minSimilarity}
                    onMinSimilarityChange={setMinSimilarity}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    isLoading={isLoading}
                    disabled={!patientId.trim()}
                />

                {/* Results Section */}
                {hasSearched && (
                    <>
                        {(searchMutation.isError || searchGraphMutation.isError) && (
                            <div className="error-state">
                                <div className="error-icon">
                                    <i className="fa-solid fa-exclamation-triangle"></i>
                                </div>
                                <h3 className="error-title">Search Failed</h3>
                                <p className="error-subtitle">
                                    Unable to find similar patients. Please try again.
                                </p>
                            </div>
                        )}

                        {(searchMutation.data || searchGraphMutation.data) && (
                            <>
                                {/* Results Header */}
                                <div className="results-header">
                                    <div className="results-info">
                                        <h2 className="results-title">Search Results</h2>
                                        <p className="results-count">
                                            Found {viewMode === 'graph'
                                            ? searchGraphMutation.data?.metadata.results_found
                                            : searchMutation.data?.total_found} similar case{(viewMode === 'graph'
                                            ? searchGraphMutation.data?.metadata.results_found
                                            : searchMutation.data?.total_found) !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    {/* View Toggle */}
                                    <div className="view-toggle">
                                        <button
                                            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                                            onClick={() => handleViewModeChange('cards')}
                                            title="Card view"
                                        >
                                            <i className="fa-solid fa-grip"></i>
                                        </button>
                                        <button
                                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                                            onClick={() => handleViewModeChange('table')}
                                            title="Table view"
                                        >
                                            <i className="fa-solid fa-table"></i>
                                        </button>
                                        <button
                                            className={`view-btn ${viewMode === 'graph' ? 'active' : ''}`}
                                            onClick={() => handleViewModeChange('graph')}
                                            title="Graph view"
                                        >
                                            <i className="fa-solid fa-project-diagram"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Results Display */}
                                {viewMode === 'graph' ? (
                                    // Graph View
                                    searchGraphMutation.data && (
                                        <SimilarPatientsGraph graphData={searchGraphMutation.data} />
                                    )
                                ) : (
                                    // List/Table View
                                    searchMutation.data && (
                                        searchMutation.data.similar_cases.length > 0 ? (
                                            <SimilarPatientsList
                                                cases={searchMutation.data.similar_cases}
                                                viewMode={viewMode}
                                            />
                                        ) : (
                                            <div className="empty-state">
                                                <div className="empty-icon">
                                                    <i className="fa-solid fa-users-slash"></i>
                                                </div>
                                                <h3 className="empty-title">No Similar Cases Found</h3>
                                                <p className="empty-subtitle">
                                                    Try adjusting your filters or lowering the minimum similarity threshold.
                                                </p>
                                            </div>
                                        )
                                    )
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Initial State */}
                {!hasSearched && (
                    <div className="initial-state">
                        <div className="initial-icon">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </div>
                        <h3 className="initial-title">Ready to Search</h3>
                        <p className="initial-subtitle">
                            Enter a patient ID and click search to find similar historical cases
                        </p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .search-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 24px;
                }

                .page-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: #ffffff;
                    letter-spacing: -0.8px;
                }

                .page-subtitle {
                    font-size: 15px;
                    color: rgba(255, 255, 255, 0.5);
                    margin-top: 6px;
                    font-weight: 400;
                }

                .divider {
                    height: 1px;
                    background: linear-gradient(
                            to right,
                            transparent,
                            rgba(255, 255, 255, 0.1) 20%,
                            rgba(255, 255, 255, 0.1) 80%,
                            transparent
                    );
                    margin-bottom: 24px;
                }

                .results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 32px 0 20px 0;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .results-info {
                    flex: 1;
                }

                .results-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 4px;
                }

                .results-count {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.5);
                    margin: 0;
                }

                .view-toggle {
                    display: flex;
                    gap: 4px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 8px;
                    padding: 4px;
                }

                .view-btn {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: none;
                    border-radius: 6px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .view-btn:hover {
                    color: rgba(255, 255, 255, 0.9);
                    background: rgba(255, 255, 255, 0.05);
                }

                .view-btn.active {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                }

                .error-state,
                .empty-state,
                .initial-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 20px;
                    text-align: center;
                }

                .error-icon,
                .empty-icon,
                .initial-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    font-size: 32px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .error-icon {
                    background: rgba(239, 68, 68, 0.1);
                    color: rgba(239, 68, 68, 0.5);
                }

                .initial-icon {
                    background: rgba(16, 185, 129, 0.1);
                    color: rgba(16, 185, 129, 0.5);
                }

                .error-title,
                .empty-title,
                .initial-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 8px;
                }

                .error-subtitle,
                .empty-subtitle,
                .initial-subtitle {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                    max-width: 400px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .page-title {
                        font-size: 26px;
                    }

                    .results-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .view-toggle {
                        align-self: flex-end;
                    }
                }
            `}</style>
        </>
    );
}