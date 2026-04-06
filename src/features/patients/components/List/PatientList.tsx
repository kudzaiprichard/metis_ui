'use client';

import { useMemo, useState } from 'react';
import {
    ArrowDownUp,
    CircleAlert,
    Download,
    Filter,
    Loader2,
    Plus,
    Search,
    UserX,
    Users,
    X,
} from 'lucide-react';

import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
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
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/src/components/shadcn/pagination';
import { useToast } from '@/src/components/shared/ui/toast';

import { patientsApi } from '../../api/patients.api';
import { Patient } from '../../api/patients.types';
import { usePatients } from '../../hooks/usePatients';
import {
    buildPatientsCsv,
    buildPatientsExportFilename,
    downloadCsv,
} from '../../lib/export-csv';
import { CreatePatientModal } from './modals/CreatePatientModal';
import { DeletePatientDialog } from './DeletePatientDialog';
import { PatientTableRow } from './PatientTableRow';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 50] as const;
const DEFAULT_PAGE_SIZE = 20;

type GenderFilter = 'all' | 'male' | 'female' | 'other';
type ContactFilter =
    | 'all'
    | 'with-email'
    | 'without-email'
    | 'with-phone'
    | 'without-phone';
type SortMode = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

export function PatientList() {
    const { showToast } = useToast();

    // Server-side pagination state
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState<number>(DEFAULT_PAGE_SIZE);

    // Client-side filters (apply against the loaded page — the backend
    // doesn't accept search/filter params per spec §5).
    const [searchInput, setSearchInput] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
    const [contactFilter, setContactFilter] = useState<ContactFilter>('all');
    const [sort, setSort] = useState<SortMode>('newest');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

    const [isExporting, setIsExporting] = useState(false);

    const { data, isLoading, error } = usePatients({ page, pageSize: perPage });

    const handleDeletePatient = (patient: Patient) => {
        setPatientToDelete(patient);
        setIsDeleteDialogOpen(true);
    };

    const handleSearchClick = () => {
        setActiveSearch(searchInput.trim());
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearchClick();
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setActiveSearch('');
    };

    const handlePageSizeChange = (value: string) => {
        setPerPage(Number(value));
        setPage(1);
    };

    const handleResetFilters = () => {
        setActiveSearch('');
        setSearchInput('');
        setGenderFilter('all');
        setContactFilter('all');
        setSort('newest');
    };

    /**
     * Filter + sort the loaded page client-side. The API only supports
     * pagination, so search / gender / contact filters are applied locally
     * to whatever the current page returned.
     */
    const visiblePatients = useMemo(() => {
        const list = data?.patients ? [...data.patients] : [];
        const q = activeSearch.toLowerCase();

        const filtered = list.filter((p) => {
            if (genderFilter !== 'all' && (p.gender ?? '').toLowerCase() !== genderFilter) {
                return false;
            }
            if (contactFilter === 'with-email' && !p.email) return false;
            if (contactFilter === 'without-email' && p.email) return false;
            if (contactFilter === 'with-phone' && !p.phone) return false;
            if (contactFilter === 'without-phone' && p.phone) return false;
            if (q) {
                const haystack = `${p.firstName ?? ''} ${p.lastName ?? ''} ${p.email ?? ''}`
                    .toLowerCase();
                if (!haystack.includes(q)) return false;
            }
            return true;
        });

        filtered.sort((a, b) => {
            switch (sort) {
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'name-asc':
                    return `${a.firstName} ${a.lastName}`.localeCompare(
                        `${b.firstName} ${b.lastName}`,
                    );
                case 'name-desc':
                    return `${b.firstName} ${b.lastName}`.localeCompare(
                        `${a.firstName} ${a.lastName}`,
                    );
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        return filtered;
    }, [data?.patients, activeSearch, genderFilter, contactFilter, sort]);

    const totalPatients = data?.pagination?.total ?? 0;
    const totalPages = Math.max(1, data?.pagination?.totalPages ?? 1);
    const startIndex = totalPatients === 0 ? 0 : (page - 1) * perPage + 1;
    const endIndex = Math.min(page * perPage, totalPatients);
    const hasActiveSearch = activeSearch !== '';
    const hasActiveFilters =
        hasActiveSearch ||
        genderFilter !== 'all' ||
        contactFilter !== 'all' ||
        sort !== 'newest';

    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push('ellipsis');
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (page < totalPages - 2) pages.push('ellipsis');
            pages.push(totalPages);
        }
        return pages;
    };

    /**
     * Walk every page of the patient list and build a CSV. Pulls from the
     * API directly (rather than the React Query cache) so the export
     * always reflects the full server-side dataset, regardless of which
     * page is currently loaded or what filters the user has set.
     */
    const handleExport = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            const all: Patient[] = [];
            const exportPageSize = 100;
            const first = await patientsApi.list({ page: 1, pageSize: exportPageSize });
            all.push(...first.patients);
            const totalPagesToFetch = Math.max(1, first.pagination.totalPages);
            for (let p = 2; p <= totalPagesToFetch; p++) {
                const next = await patientsApi.list({ page: p, pageSize: exportPageSize });
                all.push(...next.patients);
            }

            if (all.length === 0) {
                showToast(
                    'Nothing to export',
                    'There are no patients in the system yet.',
                    'info',
                );
                return;
            }

            downloadCsv(buildPatientsCsv(all), buildPatientsExportFilename());
            showToast(
                'Export ready',
                `Downloaded ${all.length} patient${all.length === 1 ? '' : 's'} as CSV.`,
                'success',
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to export patients.';
            showToast('Export failed', message, 'error');
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span>Loading patients...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <CircleAlert className="h-7 w-7 text-destructive" />
                <span>Error loading patients</span>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Page Header */}
            <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Patients</h1>
                    <p className="text-base text-muted-foreground mt-1">
                        Manage and monitor your diabetes patients
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={handleExport}
                        disabled={isExporting || totalPatients === 0}
                        className="rounded-lg h-9 px-4 text-base font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground disabled:opacity-50"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                Exporting…
                            </>
                        ) : (
                            <>
                                <Download className="h-3.5 w-3.5 mr-2" />
                                Export CSV
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="rounded-lg h-9 px-4 text-base font-semibold bg-primary hover:bg-primary/80 text-primary-foreground border-0"
                    >
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        New Patient
                    </Button>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Summary Strip */}
            <div className="flex items-center gap-3 px-4 py-3 bg-card/30 border border-white/10 rounded-lg backdrop-blur-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-base text-muted-foreground font-medium">
                    Total Patients:
                </span>
                <span className="text-lg font-bold text-foreground tracking-tight">
                    {totalPatients}
                </span>
                {hasActiveFilters && (
                    <span className="text-sm text-muted-foreground/70 ml-auto">
                        {visiblePatients.length} of {data?.patients.length ?? 0} on this page after
                        filters
                    </span>
                )}
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                {/* Left — Search */}
                <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email…"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyPress}
                            className="pl-9 h-9 rounded-lg border-white/10 bg-card/30 text-base"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSearchClick}
                        disabled={isLoading}
                        className="h-9 px-3.5 rounded-lg text-sm font-semibold border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
                    >
                        {isLoading ? (
                            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        ) : (
                            <Search className="h-3 w-3 mr-1.5" />
                        )}
                        Search
                    </Button>
                    {hasActiveSearch && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSearch}
                            className="h-9 text-sm rounded-lg"
                        >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* Right — Filters + Sort */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Filter className="h-3 w-3" />
                        <span>Gender:</span>
                        <Select
                            value={genderFilter}
                            onValueChange={(v) => setGenderFilter(v as GenderFilter)}
                        >
                            <SelectTrigger className="w-[110px] h-8 rounded-lg bg-white/5 border-white/10 text-xs text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg bg-card border-white/10">
                                <SelectItem value="all" className="text-xs rounded-lg">
                                    All
                                </SelectItem>
                                <SelectItem value="male" className="text-xs rounded-lg">
                                    Male
                                </SelectItem>
                                <SelectItem value="female" className="text-xs rounded-lg">
                                    Female
                                </SelectItem>
                                <SelectItem value="other" className="text-xs rounded-lg">
                                    Other
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>Contact:</span>
                        <Select
                            value={contactFilter}
                            onValueChange={(v) => setContactFilter(v as ContactFilter)}
                        >
                            <SelectTrigger className="w-[150px] h-8 rounded-lg bg-white/5 border-white/10 text-xs text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg bg-card border-white/10">
                                <SelectItem value="all" className="text-xs rounded-lg">
                                    All
                                </SelectItem>
                                <SelectItem value="with-email" className="text-xs rounded-lg">
                                    With email
                                </SelectItem>
                                <SelectItem value="without-email" className="text-xs rounded-lg">
                                    Without email
                                </SelectItem>
                                <SelectItem value="with-phone" className="text-xs rounded-lg">
                                    With phone
                                </SelectItem>
                                <SelectItem value="without-phone" className="text-xs rounded-lg">
                                    Without phone
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ArrowDownUp className="h-3 w-3" />
                        <span>Sort:</span>
                        <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
                            <SelectTrigger className="w-[140px] h-8 rounded-lg bg-white/5 border-white/10 text-xs text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg bg-card border-white/10">
                                <SelectItem value="newest" className="text-xs rounded-lg">
                                    Newest first
                                </SelectItem>
                                <SelectItem value="oldest" className="text-xs rounded-lg">
                                    Oldest first
                                </SelectItem>
                                <SelectItem value="name-asc" className="text-xs rounded-lg">
                                    Name A → Z
                                </SelectItem>
                                <SelectItem value="name-desc" className="text-xs rounded-lg">
                                    Name Z → A
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="h-8 text-xs rounded-lg text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-60' : ''}`}>
                {visiblePatients.length > 0 ? (
                    <>
                        <div className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b border-white/10">
                                        <TableHead className="w-[260px]">Patient</TableHead>
                                        <TableHead className="w-[120px]">Gender</TableHead>
                                        <TableHead className="w-[220px]">Email</TableHead>
                                        <TableHead className="w-[160px]">Mobile</TableHead>
                                        <TableHead className="w-[140px]">Created</TableHead>
                                        <TableHead className="w-[110px] text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visiblePatients.map((patient) => (
                                        <PatientTableRow
                                            key={patient.id}
                                            patient={patient}
                                            onDelete={handleDeletePatient}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination footer */}
                        {data?.pagination && (
                            <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Show</span>
                                    <Select
                                        value={String(perPage)}
                                        onValueChange={handlePageSizeChange}
                                    >
                                        <SelectTrigger className="w-[70px] h-8 text-sm rounded-lg border-white/10 bg-card/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg border-white/10 bg-card">
                                            {PAGE_SIZE_OPTIONS.map((size) => (
                                                <SelectItem key={size} value={String(size)}>
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-muted-foreground tabular-nums">
                                        {startIndex}-{endIndex} of {totalPatients}
                                    </span>
                                </div>

                                {totalPages > 1 && (
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
                                                        page === 1
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }`}
                                                />
                                            </PaginationItem>

                                            {getPageNumbers().map((p, idx) =>
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
                                                        page === totalPages
                                                            ? 'pointer-events-none opacity-50'
                                                            : ''
                                                    }`}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-white/10 rounded-lg bg-card/30">
                        <div className="w-16 h-16 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                            <UserX className="h-7 w-7 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            {hasActiveFilters
                                ? 'No patients match the current filters'
                                : 'No patients found'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            {hasActiveFilters
                                ? 'Try clearing the search and filters, or check the next page.'
                                : 'Get started by adding your first patient to the system'}
                        </p>
                        {hasActiveFilters ? (
                            <Button
                                variant="ghost"
                                onClick={handleResetFilters}
                                className="mt-5 rounded-lg h-9 px-4 text-sm font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5 mr-2" />
                                Reset filters
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                className="mt-5 rounded-lg h-9 px-4 text-base font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <Plus className="h-3.5 w-3.5 mr-2" />
                                Add First Patient
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreatePatientModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
            <DeletePatientDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setPatientToDelete(null);
                }}
                patient={patientToDelete}
            />
        </div>
    );
}

