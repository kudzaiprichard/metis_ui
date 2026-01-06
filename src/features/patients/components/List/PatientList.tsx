/**
 * PatientList Component
 * Main container for patient management UI with grid/table views
 */

'use client';

import { useState, useCallback } from 'react';
import { usePatients } from '../../hooks/usePatients';
import { PatientCard } from './PatientCard';
import { PatientTableRow } from './PatientTableRow';
import { CreatePatientModal } from '../modals/CreatePatientModal';
import { DeletePatientDialog } from './DeletePatientDialog';
import { Patient } from '../../api/patients.types';

type ViewMode = 'grid' | 'table';

export function PatientList() {
    // Pagination and filters
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [searchInput, setSearchInput] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

    // Fetch patients
    const { data, isLoading, error } = usePatients({
        page,
        per_page: perPage,
        search: activeSearch || undefined,
    });

    // Handlers
    const handleAddPatient = () => {
        setIsCreateModalOpen(true);
    };

    const handleDeletePatient = (patient: Patient) => {
        setPatientToDelete(patient);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setPatientToDelete(null);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleItemsPerPageChange = (value: number) => {
        setPerPage(value);
        setPage(1);
    };

    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
    }, []);

    const handleSearchClick = () => {
        setActiveSearch(searchInput);
        setPage(1);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    const handleRefresh = () => {
        setSearchInput('');
        setActiveSearch('');
        setPage(1);
    };

    const handleViewToggle = (mode: ViewMode) => {
        setViewMode(mode);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        if (!data?.pagination) return [];

        const pages = [];
        const totalPages = data.pagination.total_pages;
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(page - 1);
                pages.push(page);
                pages.push(page + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    // Sort patients by created_at (newest first)
    const sortedPatients = data?.patients ? [...data.patients].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }) : [];

    // Calculate total patients
    const totalPatients = data?.pagination?.total || 0;

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="loading-spinner">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Loading patients...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="error-message">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>Error loading patients</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Patients</h1>
                    <p className="page-subtitle">Manage and monitor your diabetes patients</p>
                </div>
                <div className="header-actions">
                    <button className="action-btn">
                        <i className="fa-solid fa-download"></i>
                        Export
                    </button>
                    <button className="action-btn primary" onClick={handleAddPatient}>
                        <i className="fa-solid fa-plus"></i>
                        New Patient
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="divider"></div>

            {/* Summary Bar */}
            <div className="summary-bar">
                <div className="summary-item">
                    <i className="fa-solid fa-users"></i>
                    <span className="summary-label">Total Patients:</span>
                    <span className="summary-value">{totalPatients}</span>
                </div>
            </div>

            {/* Controls Section */}
            <div className="controls-section">
                <div className="items-per-page">
                    <label>Show:</label>
                    <select
                        value={perPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <div className="search-wrapper">
                    <div className="search-box">
                        <i className="fa-solid fa-search search-icon"></i>
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchInput}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                        />
                    </div>
                    <button
                        className="search-btn"
                        onClick={handleSearchClick}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                <span>Searching...</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-search"></i>
                                <span>Search</span>
                            </>
                        )}
                    </button>
                    <button
                        className="refresh-btn"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        title="Clear search and refresh"
                    >
                        <i className="fa-solid fa-rotate-right"></i>
                    </button>
                </div>
                <div className="view-toggle">
                    <button
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => handleViewToggle('grid')}
                        title="Grid view"
                    >
                        <i className="fa-solid fa-grip"></i>
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => handleViewToggle('table')}
                        title="Table view"
                    >
                        <i className="fa-solid fa-table"></i>
                    </button>
                </div>
            </div>

            {/* Patients Section */}
            <div className="patients-section">
                <div className={`content-container ${isLoading ? 'loading' : ''}`}>
                    {sortedPatients && sortedPatients.length > 0 ? (
                        <>
                            {/* Grid View */}
                            {viewMode === 'grid' && (
                                <div className="patients-grid">
                                    {sortedPatients.map((patient) => (
                                        <PatientCard
                                            key={patient.id}
                                            patient={patient}
                                            onDelete={handleDeletePatient}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Table View */}
                            {viewMode === 'table' && (
                                <div className="patients-table">
                                    <div className="table-header">
                                        <div className="table-cell">Patient</div>
                                        <div className="table-cell">Email</div>
                                        <div className="table-cell">Mobile</div>
                                        <div className="table-cell">Created</div>
                                        <div className="table-cell">Actions</div>
                                    </div>

                                    {sortedPatients.map((patient) => (
                                        <PatientTableRow
                                            key={patient.id}
                                            patient={patient}
                                            onDelete={handleDeletePatient}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {data?.pagination && (
                                <div className="pagination">
                                    <div className="pagination-info">
                                        Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, data.pagination.total)} of {data.pagination.total} patients
                                    </div>

                                    <div className="pagination-controls">
                                        <button
                                            className="pagination-btn"
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                        >
                                            <i className="fa-solid fa-chevron-left"></i>
                                        </button>

                                        {getPageNumbers().map((pageNum, index) => (
                                            pageNum === '...' ? (
                                                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                                            ) : (
                                                <button
                                                    key={pageNum}
                                                    className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(pageNum as number)}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        ))}

                                        <button
                                            className="pagination-btn"
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === data.pagination.total_pages}
                                        >
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fa-solid fa-users-slash"></i>
                            </div>
                            <h3 className="empty-title">No patients found</h3>
                            <p className="empty-subtitle">
                                {activeSearch ? 'Try adjusting your search criteria' : 'Get started by adding your first patient to the system'}
                            </p>
                            {!activeSearch && (
                                <button className="empty-btn" onClick={handleAddPatient}>
                                    <i className="fa-solid fa-plus"></i>
                                    Add First Patient
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <CreatePatientModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
            />

            <DeletePatientDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                patient={patientToDelete}
            />

            <style jsx>{`
                .loading-spinner,
                .error-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    color: #ffffff;
                    font-size: 16px;
                }

                .loading-spinner i,
                .error-message i {
                    font-size: 32px;
                    color: #10b981;
                }

                .error-message i {
                    color: #ef4444;
                }

                .page-header {
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 20px;
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

                .header-actions {
                    display: flex;
                    gap: 12px;
                }

                .action-btn {
                    padding: 11px 22px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }

                .action-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .action-btn.primary {
                    background: linear-gradient(135deg, #047857, #10b981);
                    border-color: rgba(16, 185, 129, 0.3);
                }

                .action-btn.primary:hover {
                    background: linear-gradient(135deg, #059669, #34d399);
                }

                .action-btn:active {
                    transform: translateY(0);
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
                    margin-bottom: 20px;
                }

                .summary-bar {
                    display: flex;
                    align-items: center;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    margin-bottom: 20px;
                }

                .summary-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 14px;
                }

                .summary-item i {
                    color: #34d399;
                    font-size: 16px;
                }

                .summary-label {
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 500;
                }

                .summary-value {
                    color: #ffffff;
                    font-weight: 700;
                    font-size: 18px;
                    letter-spacing: -0.3px;
                }

                .controls-section {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 16px 0;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .items-per-page {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                }

                .items-per-page label {
                    font-weight: 500;
                }

                .items-per-page select {
                    padding: 8px 12px;
                    background: linear-gradient(135deg, rgba(4, 120, 87, 0.15), rgba(16, 185, 129, 0.15));
                    border: 1px solid rgba(52, 211, 153, 0.2);
                    border-radius: 8px;
                    color: #34d399;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    outline: none;
                    transition: all 0.2s ease;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2334d399' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    padding-right: 30px;
                }

                .items-per-page select:hover {
                    background: linear-gradient(135deg, rgba(4, 120, 87, 0.2), rgba(16, 185, 129, 0.2));
                    border-color: rgba(52, 211, 153, 0.25);
                }

                .items-per-page select:focus {
                    background: linear-gradient(135deg, rgba(4, 120, 87, 0.2), rgba(16, 185, 129, 0.2));
                    border-color: rgba(52, 211, 153, 0.3);
                    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.1);
                }

                .search-wrapper {
                    display: flex;
                    align-items: stretch;
                    gap: 0;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 9px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                    height: 38px;
                    flex: 1;
                    max-width: 500px;
                }

                .search-wrapper:focus-within {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
                }

                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 14px;
                    flex: 1;
                    min-width: 180px;
                }

                .search-icon {
                    color: rgba(255, 255, 255, 0.35);
                    font-size: 13px;
                    transition: color 0.2s ease;
                }

                .search-wrapper:focus-within .search-icon {
                    color: rgba(255, 255, 255, 0.6);
                }

                .search-box input {
                    background: transparent;
                    border: none;
                    outline: none;
                    color: white;
                    font-size: 13px;
                    flex: 1;
                    font-weight: 400;
                }

                .search-box input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .search-btn {
                    padding: 0 18px;
                    background: linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.15));
                    border: none;
                    border-left: 1px solid rgba(255, 255, 255, 0.08);
                    color: #34d399;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    letter-spacing: 0.2px;
                }

                .search-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.2));
                    color: #6ee7b7;
                }

                .search-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .refresh-btn {
                    padding: 0 14px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(124, 58, 237, 0.12));
                    border: none;
                    border-left: 1px solid rgba(255, 255, 255, 0.08);
                    color: #a78bfa;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .refresh-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(124, 58, 237, 0.18));
                    color: #c4b5fd;
                }

                .refresh-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .refresh-btn i {
                    transition: transform 0.3s ease;
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

                .patients-section {
                    margin-bottom: 100px;
                }

                .content-container {
                    position: relative;
                    transition: opacity 0.2s ease;
                }

                .content-container.loading {
                    opacity: 0.6;
                }

                .patients-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                }

                .patients-table {
                    overflow-x: auto;
                }

                .table-header {
                    display: grid;
                    grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr;
                    gap: 16px;
                    padding: 14px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    margin-bottom: 4px;
                }

                .table-header .table-cell {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }

                .pagination {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 32px;
                    padding-top: 0;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .pagination-info {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 500;
                }

                .pagination-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pagination-btn {
                    min-width: 36px;
                    height: 36px;
                    padding: 0 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .pagination-btn:hover:not(:disabled):not(.active) {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.12);
                    color: rgba(255, 255, 255, 0.8);
                }

                .pagination-btn.active {
                    background: rgba(52, 211, 153, 0.15);
                    border-color: rgba(52, 211, 153, 0.3);
                    color: #34d399;
                    font-weight: 600;
                }

                .pagination-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .pagination-ellipsis {
                    padding: 0 8px;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 14px;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 20px;
                    text-align: center;
                }

                .empty-icon {
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

                .empty-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 8px;
                }

                .empty-subtitle {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 28px;
                    max-width: 400px;
                }

                .empty-btn {
                    padding: 11px 24px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 10px;
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                }

                .empty-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                @media (max-width: 768px) {
                    .page-title {
                        font-size: 26px;
                    }

                    .header-actions {
                        width: 100%;
                    }

                    .action-btn {
                        flex: 1;
                        justify-content: center;
                    }

                    .controls-section {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .search-wrapper {
                        max-width: none;
                        width: 100%;
                    }

                    .search-box {
                        min-width: auto;
                    }

                    .items-per-page {
                        justify-content: space-between;
                    }

                    .view-toggle {
                        align-self: flex-end;
                    }

                    .patients-grid {
                        grid-template-columns: 1fr;
                    }

                    .table-header {
                        display: none;
                    }

                    .pagination {
                        flex-direction: column;
                        align-items: center;
                    }

                    .pagination-info {
                        order: 2;
                    }

                    .pagination-controls {
                        order: 1;
                    }
                }
            `}</style>
        </>
    );
}