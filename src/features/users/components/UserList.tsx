/**
 * UserList Component
 * Main container for user management UI
 */

'use client';

import { useState, useCallback } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { UserRow } from './UserRow';
import { UserModal } from './UserModal';
import { DeleteUserDialog } from './DeleteUserDialog';
import { User } from '../api/users.types';
import { UserRole } from '@/src/lib/constants';

export function UserList() {
    const { user: currentUser } = useAuth();

    // Pagination and filters
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);
    const [searchInput, setSearchInput] = useState(''); // User's input
    const [activeSearch, setActiveSearch] = useState(''); // Actual search query sent to API

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Fetch users
    const { data, isLoading, error } = useUsers({
        page,
        per_page: perPage,
        search: activeSearch || undefined,
        role: undefined,
    });

    // Handlers
    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
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

    // Sort users by created_at (newest first)
    const sortedUsers = data?.users ? [...data.users].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }) : [];

    // Calculate stats
    const totalUsers = data?.pagination?.total || 0;
    const activeUsers = sortedUsers.length || 0;
    const doctorCount = sortedUsers.filter(u => u.role.toUpperCase() === 'DOCTOR').length || 0;
    const mlEngineerCount = sortedUsers.filter(u => u.role.toUpperCase() === 'ML_ENGINEER').length || 0;

    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="loading-spinner">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Loading users...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="error-message">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>Error loading users</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">Manage system users and their roles</p>
                </div>
                <button className="add-user-btn" onClick={handleAddUser}>
                    <i className="fa-solid fa-plus"></i>
                    Add User
                </button>
            </div>

            {/* Divider */}
            <div className="divider"></div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Users</p>
                        <p className="stat-value">{totalUsers}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon active">
                        <i className="fa-solid fa-user-check"></i>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Active</p>
                        <p className="stat-value">{activeUsers}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon doctors">
                        <i className="fa-solid fa-user-doctor"></i>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Doctors</p>
                        <p className="stat-value">{doctorCount}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon engineers">
                        <i className="fa-solid fa-brain"></i>
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">ML Engineers</p>
                        <p className="stat-value">{mlEngineerCount}</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="users-section">
                <div className="section-header">
                    <h2 className="section-title">All Users</h2>
                    <div className="header-controls">
                        <div className="items-per-page">
                            <label>Show:</label>
                            <select
                                value={perPage}
                                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                            </select>
                        </div>
                        <div className="search-wrapper">
                            <div className="search-box">
                                <i className="fa-solid fa-search search-icon"></i>
                                <input
                                    type="text"
                                    placeholder="Search users..."
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
                    </div>
                </div>

                <div className={`table-container ${isLoading ? 'loading' : ''}`}>
                    {sortedUsers && sortedUsers.length > 0 ? (
                        <>
                            <div className="users-table">
                                <div className="table-header">
                                    <div className="table-cell">User</div>
                                    <div className="table-cell">Email</div>
                                    <div className="table-cell">Role</div>
                                    <div className="table-cell">Status</div>
                                    <div className="table-cell">Created</div>
                                    <div className="table-cell">Actions</div>
                                </div>

                                {sortedUsers.map((user) => (
                                    <UserRow
                                        key={user.id}
                                        user={user}
                                        onEdit={handleEditUser}
                                        onDelete={handleDeleteUser}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {data?.pagination && (
                                <div className="pagination">
                                    <div className="pagination-info">
                                        Showing {((page - 1) * perPage) + 1} to {Math.min(page * perPage, data.pagination.total)} of {data.pagination.total} users
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
                            <h3 className="empty-title">No users found</h3>
                            <p className="empty-subtitle">
                                {activeSearch ? 'Try adjusting your search criteria' : 'Get started by adding your first user to the system'}
                            </p>
                            {!activeSearch && (
                                <button className="empty-btn" onClick={handleAddUser}>
                                    <i className="fa-solid fa-plus"></i>
                                    Add First User
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <UserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={selectedUser}
            />

            <DeleteUserDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                user={userToDelete}
                action="delete"
                currentUserId={currentUser?.id}
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

                .add-user-btn {
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
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .add-user-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.25);
                    transform: translateY(-1px);
                }

                .add-user-btn:active {
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
                    margin-bottom: 40px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 20px;
                    margin-bottom: 48px;
                }

                .stat-card {
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .stat-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.12);
                    transform: translateY(-2px);
                }

                .stat-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    color: rgba(255, 255, 255, 0.6);
                    background: rgba(255, 255, 255, 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .stat-card:hover .stat-icon {
                    transform: scale(1.05);
                }

                .stat-icon.active {
                    color: #34d399;
                    background: rgba(52, 211, 153, 0.1);
                }

                .stat-icon.doctors {
                    color: #a78bfa;
                    background: rgba(167, 139, 250, 0.1);
                }

                .stat-icon.engineers {
                    color: #f472b6;
                    background: rgba(244, 114, 182, 0.1);
                }

                .stat-content {
                    flex: 1;
                }

                .stat-label {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 500;
                    margin-bottom: 6px;
                    letter-spacing: 0.3px;
                }

                .stat-value {
                    font-size: 32px;
                    color: #ffffff;
                    font-weight: 700;
                    letter-spacing: -1px;
                    line-height: 1;
                }

                .users-section {
                    margin-bottom: 100px;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 28px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .section-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #ffffff;
                    letter-spacing: -0.3px;
                }

                .header-controls {
                    display: flex;
                    align-items: center;
                    gap: 16px;
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
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2334d399' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    padding-right: 30px;
                }

                .items-per-page select option {
                    background-color: #0a1f1a !important;
                    background: #0a1f1a !important;
                    color: #34d399 !important;
                    padding: 10px !important;
                }

                .items-per-page select option:hover {
                    background-color: #13342a !important;
                    background: #13342a !important;
                    color: #6ee7b7 !important;
                }

                .items-per-page select option:focus {
                    background-color: #13342a !important;
                    background: #13342a !important;
                    color: #6ee7b7 !important;
                }

                .items-per-page select option:active {
                    background-color: #13342a !important;
                    background: #13342a !important;
                    color: #6ee7b7 !important;
                }

                .items-per-page select option:checked {
                    background-color: #13342a !important;
                    background: #13342a !important;
                    color: #6ee7b7 !important;
                }

                .items-per-page select option[selected] {
                    background-color: #13342a !important;
                    background: #13342a !important;
                    color: #6ee7b7 !important;
                }

                .items-per-page select:hover {
                    background: linear-gradient(135deg, rgba(4, 120, 87, 0.25), rgba(16, 185, 129, 0.25));
                    border-color: rgba(52, 211, 153, 0.3);
                }

                .items-per-page select:focus {
                    background: linear-gradient(135deg, rgba(4, 120, 87, 0.2), rgba(16, 185, 129, 0.2));
                    border-color: rgba(52, 211, 153, 0.4);
                    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
                }

                .search-wrapper {
                    display: flex;
                    align-items: stretch;
                    gap: 0;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 9px;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    height: 38px;
                }

                .search-wrapper:focus-within {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
                }

                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 14px;
                    flex: 1;
                    min-width: 220px;
                }

                .search-icon {
                    color: rgba(255, 255, 255, 0.35);
                    font-size: 13px;
                    transition: color 0.3s ease;
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
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    letter-spacing: 0.2px;
                }

                .search-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, rgba(52, 211, 153, 0.25), rgba(16, 185, 129, 0.25));
                    color: #6ee7b7;
                }

                .search-btn:active:not(:disabled) {
                    background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.2));
                }

                .search-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .search-btn i {
                    font-size: 12px;
                }

                .refresh-btn {
                    padding: 0 14px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(124, 58, 237, 0.12));
                    border: none;
                    border-left: 1px solid rgba(255, 255, 255, 0.08);
                    color: #a78bfa;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .refresh-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2));
                    color: #c4b5fd;
                }

                .refresh-btn:hover:not(:disabled) i {
                    transform: rotate(180deg);
                }

                .refresh-btn:active:not(:disabled) {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.15));
                }

                .refresh-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .refresh-btn i {
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .table-container {
                    position: relative;
                    transition: opacity 0.2s ease;
                }

                .table-container.loading {
                    opacity: 0.6;
                }

                .users-table {
                    overflow-x: auto;
                }

                .table-header {
                    display: grid;
                    grid-template-columns: 2fr 2fr 1.5fr 1fr 1.5fr 1fr;
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
                    padding-top: 24px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
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
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .pagination-btn:hover:not(:disabled):not(.active) {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.12);
                    color: rgba(255, 255, 255, 0.8);
                    transform: translateY(-1px);
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
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .empty-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.25);
                    transform: translateY(-1px);
                }

                @media (max-width: 1024px) {
                    .table-header {
                        grid-template-columns: 1.5fr 1.5fr 1fr 0.8fr 1fr 0.8fr;
                    }
                }

                @media (max-width: 768px) {
                    .page-title {
                        font-size: 26px;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .header-controls {
                        width: 100%;
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .search-wrapper {
                        width: 100%;
                    }

                    .search-box {
                        min-width: auto;
                    }

                    .items-per-page {
                        justify-content: space-between;
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