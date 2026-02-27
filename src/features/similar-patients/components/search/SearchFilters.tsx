/**
 * SearchFilters Component (Compact Design)
 * Compact, neat filter controls with fixed dropdown visibility
 */

'use client';

interface SearchFiltersProps {
    patientId: string;
    onPatientIdChange: (value: string) => void;
    limit: number;
    onLimitChange: (value: number) => void;
    treatmentFilter: string;
    onTreatmentFilterChange: (value: string) => void;
    minSimilarity: number;
    onMinSimilarityChange: (value: number) => void;
    onSearch: () => void;
    onReset: () => void;
    isLoading: boolean;
    disabled: boolean;
}

export function SearchFilters({
                                  patientId,
                                  onPatientIdChange,
                                  limit,
                                  onLimitChange,
                                  treatmentFilter,
                                  onTreatmentFilterChange,
                                  minSimilarity,
                                  onMinSimilarityChange,
                                  onSearch,
                                  onReset,
                                  isLoading,
                                  disabled,
                              }: SearchFiltersProps) {
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !disabled) {
            onSearch();
        }
    };

    const treatments = [
        'All Treatments',
        'Metformin',
        'GLP-1',
        'SGLT-2',
        'DPP-4',
        'Insulin',
        'Sulfonylureas',
        'TZDs',
    ];

    return (
        <>
            <div className="filters-container">
                {/* Compact Grid Layout */}
                <div className="filters-grid">
                    {/* Patient ID Input */}
                    <div className="filter-group">
                        <label className="filter-label">
                            <i className="fa-solid fa-user"></i>
                            Patient ID
                        </label>
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Enter ID..."
                            value={patientId}
                            onChange={(e) => onPatientIdChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    </div>

                    {/* Results Limit */}
                    <div className="filter-group">
                        <label className="filter-label">
                            <i className="fa-solid fa-list"></i>
                            Results
                        </label>
                        <select
                            className="filter-select"
                            value={limit}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                        >
                            <option value={5}>5 cases</option>
                            <option value={10}>10 cases</option>
                            <option value={15}>15 cases</option>
                            <option value={20}>20 cases</option>
                        </select>
                    </div>

                    {/* Treatment Filter */}
                    <div className="filter-group">
                        <label className="filter-label">
                            <i className="fa-solid fa-pills"></i>
                            Treatment
                        </label>
                        <select
                            className="filter-select"
                            value={treatmentFilter || 'All Treatments'}
                            onChange={(e) => onTreatmentFilterChange(e.target.value === 'All Treatments' ? '' : e.target.value)}
                        >
                            {treatments.map((treatment) => (
                                <option key={treatment} value={treatment}>
                                    {treatment}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Similarity Slider - Spans 2 columns */}
                    <div className="filter-group slider-group">
                        <label className="filter-label">
                            <i className="fa-solid fa-sliders"></i>
                            Similarity
                            <span className="similarity-value">{(minSimilarity * 100).toFixed(0)}%</span>
                        </label>
                        <input
                            type="range"
                            className="filter-slider"
                            min="0"
                            max="1"
                            step="0.05"
                            value={minSimilarity}
                            onChange={(e) => onMinSimilarityChange(Number(e.target.value))}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="filter-actions">
                        <button
                            className="filter-btn reset"
                            onClick={onReset}
                            disabled={isLoading}
                            title="Reset filters"
                        >
                            <i className="fa-solid fa-rotate-right"></i>
                        </button>
                        <button
                            className="filter-btn search"
                            onClick={onSearch}
                            disabled={disabled || isLoading}
                        >
                            {isLoading ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fa-solid fa-magnifying-glass"></i>
                            )}
                            <span>Search</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .filters-container {
                    background: transparent;
                    border: 1px solid rgba(52, 211, 153, 0.2);
                    border-radius: 10px;
                    padding: 16px;
                    margin-bottom: 20px;
                }

                .filters-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.5fr 2fr auto;
                    gap: 12px;
                    align-items: end;
                }

                .slider-group {
                    grid-column: span 2;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .filter-label {
                    font-size: 11px;
                    color: rgba(52, 211, 153, 0.8);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .filter-label i {
                    font-size: 10px;
                    opacity: 0.7;
                }

                .similarity-value {
                    color: #34d399;
                    font-weight: 700;
                    margin-left: auto;
                }

                .filter-input {
                    padding: 10px 12px;
                    background: transparent;
                    border: 1px solid rgba(52, 211, 153, 0.2);
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 13px;
                    outline: none;
                    transition: all 0.2s ease;
                }

                .filter-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .filter-input:hover {
                    border-color: rgba(52, 211, 153, 0.3);
                }

                .filter-input:focus {
                    border-color: rgba(52, 211, 153, 0.5);
                    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
                }

                .filter-select {
                    padding: 10px 32px 10px 12px;
                    background: transparent;
                    border: 1px solid rgba(52, 211, 153, 0.2);
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 13px;
                    cursor: pointer;
                    outline: none;
                    transition: all 0.2s ease;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%2334d399' d='M5 7L1 3h8z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                }

                .filter-select:hover {
                    border-color: rgba(52, 211, 153, 0.3);
                }

                .filter-select:focus {
                    border-color: rgba(52, 211, 153, 0.5);
                }

                .filter-select option {
                    background: #0a1f1a;
                    color: #ffffff;
                    padding: 8px;
                }

                .filter-slider {
                    width: 100%;
                    height: 5px;
                    border-radius: 3px;
                    background: rgba(52, 211, 153, 0.2);
                    outline: none;
                    -webkit-appearance: none;
                    appearance: none;
                    cursor: pointer;
                }

                .filter-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #34d399;
                    border: 2px solid #0a1f1a;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 6px rgba(52, 211, 153, 0.3);
                }

                .filter-slider::-webkit-slider-thumb:hover {
                    background: #6ee7b7;
                    transform: scale(1.15);
                    box-shadow: 0 3px 8px rgba(52, 211, 153, 0.5);
                }

                .filter-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #34d399;
                    border: 2px solid #0a1f1a;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 6px rgba(52, 211, 153, 0.3);
                }

                .filter-slider::-moz-range-thumb:hover {
                    background: #6ee7b7;
                    transform: scale(1.15);
                    box-shadow: 0 3px 8px rgba(52, 211, 153, 0.5);
                }

                .filter-actions {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .filter-btn {
                    padding: 10px 16px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: 1px solid;
                    white-space: nowrap;
                }

                .filter-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .filter-btn.reset {
                    background: transparent;
                    border-color: rgba(255, 255, 255, 0.15);
                    color: rgba(255, 255, 255, 0.7);
                    padding: 10px;
                }

                .filter-btn.reset:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.25);
                    color: rgba(255, 255, 255, 0.9);
                    transform: rotate(180deg);
                }

                .filter-btn.search {
                    background: linear-gradient(135deg, #047857, #10b981);
                    border-color: rgba(52, 211, 153, 0.3);
                    color: white;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
                }

                .filter-btn.search:hover:not(:disabled) {
                    background: linear-gradient(135deg, #059669, #34d399);
                    border-color: rgba(52, 211, 153, 0.5);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                    transform: translateY(-1px);
                }

                .filter-btn.search:active:not(:disabled) {
                    transform: translateY(0);
                }

                @media (max-width: 1200px) {
                    .filters-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }

                    .filter-group:first-child {
                        grid-column: 1 / -1;
                    }

                    .filter-actions {
                        grid-column: 1 / -1;
                        justify-content: flex-end;
                    }
                }

                @media (max-width: 768px) {
                    .filters-container {
                        padding: 12px;
                    }

                    .filters-grid {
                        grid-template-columns: 1fr;
                    }

                    .filter-actions {
                        width: 100%;
                    }

                    .filter-btn {
                        flex: 1;
                        justify-content: center;
                    }
                }
            `}</style>
        </>
    );
}