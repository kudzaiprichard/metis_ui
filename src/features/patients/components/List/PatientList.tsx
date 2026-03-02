'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Badge } from '@/src/components/shadcn/badge';
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
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from '@/src/components/shadcn/pagination';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/src/components/shadcn/tooltip';
import { usePatients } from '../../hooks/usePatients';
import { PatientCard } from './PatientCard';
import { PatientTableRow } from './PatientTableRow';
import { CreatePatientModal } from './modals/CreatePatientModal';
import { DeletePatientDialog } from './DeletePatientDialog';
import { Patient } from '../../api/patients.types';
import {
    Users,
    Plus,
    Download,
    Search,
    X,
    LayoutGrid,
    Table2,
    Loader2,
    CircleAlert,
    UserX,
} from 'lucide-react';

type ViewMode = 'grid' | 'table';

export function PatientList() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [searchInput, setSearchInput] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

    const { data, isLoading, error } = usePatients({
        page,
        per_page: perPage,
        search: activeSearch || undefined,
    });

    const handleDeletePatient = (patient: Patient) => {
        setPatientToDelete(patient);
        setIsDeleteDialogOpen(true);
    };

    const handleSearchClick = () => {
        setActiveSearch(searchInput);
        setPage(1);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearchClick();
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setActiveSearch('');
        setPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setPerPage(Number(value));
        setPage(1);
    };

    const sortedPatients = data?.patients
        ? [...data.patients].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : [];

    const totalPatients = data?.pagination?.total || 0;
    const totalPages = data?.pagination?.total_pages || 1;
    const startIndex = ((page - 1) * perPage) + 1;
    const endIndex = Math.min(page * perPage, totalPatients);

    const hasActiveSearch = activeSearch !== '';

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

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-[14px]">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span>Loading patients...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-[14px]">
                <CircleAlert className="h-7 w-7 text-red-500" />
                <span>Error loading patients</span>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Page Header */}
            <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                    <h1 className="text-[28px] font-bold text-foreground tracking-tight">Patients</h1>
                    <p className="text-[13px] text-muted-foreground mt-1">Manage and monitor your diabetes patients</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        className="rounded-none h-9 px-4 text-[13px] font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                    >
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Export
                    </Button>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="rounded-none h-9 px-4 text-[13px] font-semibold bg-primary hover:bg-primary/80 text-primary-foreground border-0"
                    >
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        New Patient
                    </Button>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Summary Strip */}
            <div className="flex items-center gap-3 px-4 py-3 bg-card/30 border border-white/10 rounded-none backdrop-blur-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-[13px] text-muted-foreground font-medium">Total Patients:</span>
                <span className="text-[17px] font-bold text-foreground tracking-tight">{totalPatients}</span>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Left — Search + Per Page */}
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patients..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyPress}
                            className="pl-9 h-9 rounded-none border-white/10 bg-card/30 text-[13px]"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSearchClick}
                        disabled={isLoading}
                        className="h-9 px-3.5 rounded-none text-[12px] font-semibold border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
                    >
                        {isLoading ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Search className="h-3 w-3 mr-1.5" />}
                        Search
                    </Button>

                    {hasActiveSearch && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSearch}
                            className="h-9 text-[12px] rounded-none"
                        >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* Right — View Toggle */}
                <TooltipProvider>
                    <div className="flex items-center border border-white/10 rounded-none bg-card/30 backdrop-blur-sm p-0.5">
                        {([
                            { mode: 'grid' as ViewMode, icon: LayoutGrid, label: 'Grid View' },
                            { mode: 'table' as ViewMode, icon: Table2, label: 'Table View' },
                        ]).map(({ mode, icon: Icon, label }) => (
                            <Tooltip key={mode}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-7 w-7 rounded-none transition-colors ${
                                            viewMode === mode
                                                ? 'bg-white/10 text-foreground'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                        }`}
                                        onClick={() => setViewMode(mode)}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p className="text-xs">{label}</p></TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
            </div>

            {/* Content */}
            <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-60' : ''}`}>
                {sortedPatients.length > 0 ? (
                    <>
                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                            <div className="rounded-none border border-white/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-b border-white/10">
                                            <TableHead className="w-[250px]">Patient</TableHead>
                                            <TableHead className="w-[200px]">Email</TableHead>
                                            <TableHead className="w-[150px]">Mobile</TableHead>
                                            <TableHead className="w-[120px]">Created</TableHead>
                                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedPatients.map((patient) => (
                                            <PatientTableRow
                                                key={patient.id}
                                                patient={patient}
                                                onDelete={handleDeletePatient}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {data?.pagination && totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] text-muted-foreground">Show</span>
                                    <Select value={String(perPage)} onValueChange={handleItemsPerPageChange}>
                                        <SelectTrigger className="w-[65px] h-8 text-[12px] rounded-none border-white/10 bg-card/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none border-white/10 bg-card">
                                            {[10, 20, 30, 50].map((size) => (
                                                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-[12px] text-muted-foreground">
                                        {startIndex}-{endIndex} of {totalPatients}
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
                                                className={`h-8 rounded-none border-white/10 text-[12px] ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
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
                                                        className="h-8 w-8 rounded-none text-[12px] border-white/10"
                                                    >
                                                        {p}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (page < totalPages) setPage(page + 1);
                                                }}
                                                className={`h-8 rounded-none border-white/10 text-[12px] ${page === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-white/10 rounded-none bg-card/30">
                        <div className="w-16 h-16 rounded-none bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
                            <UserX className="h-7 w-7 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">No patients found</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            {hasActiveSearch
                                ? 'Try adjusting your search criteria'
                                : 'Get started by adding your first patient to the system'}
                        </p>
                        {!hasActiveSearch && (
                            <Button
                                variant="ghost"
                                className="mt-5 rounded-none h-9 px-4 text-[13px] font-semibold border border-white/10 bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
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
                onClose={() => { setIsDeleteDialogOpen(false); setPatientToDelete(null); }}
                patient={patientToDelete}
            />
        </div>
    );
}