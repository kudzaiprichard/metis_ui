'use client';

import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { UserRow } from './UserRow';
import { UserModal } from './UserModal';
import { DeleteUserDialog } from './DeleteUserDialog';
import { User } from '../api/users.types';
import { USER_ROLES, UserRole } from '@/src/lib/constants';
import { Button } from '@/src/components/shadcn/button';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/src/components/shadcn/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/src/components/shadcn/select';
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
    Plus,
    Loader2,
    CircleAlert,
    Users,
    UserCheck,
    Stethoscope,
    ShieldCheck,
    UsersRound,
} from 'lucide-react';

// Spec §5: list-endpoint filter values. "ALL" is a client-only sentinel — we
// omit the query parameter entirely when it is selected.
type RoleFilter = 'ALL' | UserRole;
type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export function UserList() {
    const { user: currentUser } = useAuth();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const { data, isLoading, isFetching, error } = useUsers({
        page,
        pageSize,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        isActive:
            activeFilter === 'ALL'
                ? undefined
                : activeFilter === 'ACTIVE',
    });

    const handleAddUser = () => { setSelectedUser(null); setIsModalOpen(true); };
    const handleEditUser = (u: User) => { setSelectedUser(u); setIsModalOpen(true); };
    const handleDeleteUser = (u: User) => { setUserToDelete(u); setIsDeleteDialogOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedUser(null); };
    const handleCloseDeleteDialog = () => { setIsDeleteDialogOpen(false); setUserToDelete(null); };

    const handleItemsPerPageChange = (v: string) => { setPageSize(Number(v)); setPage(1); };
    const handleRoleFilterChange = (v: string) => { setRoleFilter(v as RoleFilter); setPage(1); };
    const handleActiveFilterChange = (v: string) => { setActiveFilter(v as ActiveFilter); setPage(1); };

    const sortedUsers = data?.users ? [...data.users].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) : [];

    const totalUsers = data?.pagination?.total ?? 0;
    const activeUsers = sortedUsers.filter((u) => u.isActive).length;
    const doctorCount = sortedUsers.filter((u) => u.role.toUpperCase() === USER_ROLES.DOCTOR).length;
    const adminCount = sortedUsers.filter((u) => u.role.toUpperCase() === USER_ROLES.ADMIN).length;

    const totalPages = data?.pagination?.totalPages ?? 0;

    const getPageNumbers = () => {
        if (!totalPages) return [];
        const pages: (number | string)[] = [];
        if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
        else if (page <= 3) { for (let i = 1; i <= 4; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
        else if (page >= totalPages - 2) { pages.push(1); pages.push('...'); for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i); }
        else { pages.push(1); pages.push('...'); pages.push(page - 1); pages.push(page); pages.push(page + 1); pages.push('...'); pages.push(totalPages); }
        return pages;
    };

    const hasActiveFilter = roleFilter !== 'ALL' || activeFilter !== 'ALL';

    if (isLoading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span>Loading users...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground text-md">
                <CircleAlert className="h-7 w-7 text-red-500" />
                <span>Error loading users</span>
            </div>
        );
    }

    return (
        <>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Users</h1>
                    <p className="text-base text-muted-foreground mt-1">Manage system users and their roles</p>
                </div>
                <Button
                    onClick={handleAddUser}
                    className="rounded-lg bg-white/[0.08] border border-white/15 text-foreground hover:bg-white/[0.12] text-base font-medium h-10 px-4"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                </Button>
            </div>

            <div className="h-px bg-white/10 mb-8" />

            {/* Stats — counts reflect the current page. `Total Users` is spec §3.2 pagination.total. */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {[
                    { label: 'Total Users', value: totalUsers, icon: Users, color: '' },
                    { label: 'Active (page)', value: activeUsers, icon: UserCheck, color: 'text-emerald-400' },
                    { label: 'Doctors (page)', value: doctorCount, icon: Stethoscope, color: 'text-violet-400' },
                    { label: 'Admins (page)', value: adminCount, icon: ShieldCheck, color: 'text-pink-400' },
                ].map((s) => (
                    <div key={s.label} className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/[0.08] rounded-lg">
                        <div className={`w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${s.color}`}>
                            <s.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                            <p className="text-xl font-bold text-foreground leading-tight">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="mb-24">
                {/* Controls */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.08] flex-wrap gap-4">
                    <h2 className="text-lg font-semibold text-foreground">All Users</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Role filter (spec §5 ?role=ADMIN|DOCTOR) */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Role:</span>
                            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                                <SelectTrigger className="w-[110px] h-8 rounded-lg bg-white/5 border-white/10 text-sm text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg bg-background/95 border-white/10">
                                    <SelectItem value="ALL" className="text-sm rounded-lg">All</SelectItem>
                                    <SelectItem value={USER_ROLES.ADMIN} className="text-sm rounded-lg">Admin</SelectItem>
                                    <SelectItem value={USER_ROLES.DOCTOR} className="text-sm rounded-lg">Doctor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* isActive filter (spec §5 ?isActive=true|false) */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Status:</span>
                            <Select value={activeFilter} onValueChange={handleActiveFilterChange}>
                                <SelectTrigger className="w-[110px] h-8 rounded-lg bg-white/5 border-white/10 text-sm text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg bg-background/95 border-white/10">
                                    <SelectItem value="ALL" className="text-sm rounded-lg">All</SelectItem>
                                    <SelectItem value="ACTIVE" className="text-sm rounded-lg">Active</SelectItem>
                                    <SelectItem value="INACTIVE" className="text-sm rounded-lg">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Page size */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Show:</span>
                            <Select value={String(pageSize)} onValueChange={handleItemsPerPageChange}>
                                <SelectTrigger className="w-[65px] h-8 rounded-lg bg-white/5 border-white/10 text-sm text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg bg-background/95 border-white/10">
                                    {[5, 10, 20, 30].map((n) => (
                                        <SelectItem key={n} value={String(n)} className="text-sm rounded-lg">
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className={`transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                    {sortedUsers.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-white/[0.08] hover:bg-transparent">
                                        <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">User</TableHead>
                                        <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email</TableHead>
                                        <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Role</TableHead>
                                        <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</TableHead>
                                        <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Created</TableHead>
                                        <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedUsers.map((u) => (
                                        <UserRow key={u.id} user={u} onEdit={handleEditUser} onDelete={handleDeleteUser} />
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination — spec §3.2 pagination envelope */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/[0.08] flex-wrap gap-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalUsers)} of {totalUsers} users
                                    </p>
                                    <Pagination className="w-auto mx-0">
                                        <PaginationContent className="gap-1.5">
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => page > 1 && setPage(page - 1)}
                                                    className={`rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] h-8 text-sm ${
                                                        page === 1 ? 'pointer-events-none opacity-30' : 'cursor-pointer'
                                                    }`}
                                                />
                                            </PaginationItem>
                                            {getPageNumbers().map((p, i) => (
                                                <PaginationItem key={`page-${i}`}>
                                                    {p === '...' ? (
                                                        <PaginationEllipsis className="text-muted-foreground/50" />
                                                    ) : (
                                                        <PaginationLink
                                                            onClick={() => setPage(p as number)}
                                                            isActive={page === p}
                                                            className={`rounded-lg h-8 min-w-8 text-sm font-medium border cursor-pointer ${
                                                                page === p
                                                                    ? 'bg-primary/[0.15] border-primary/30 text-primary hover:bg-primary/[0.2]'
                                                                    : 'border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06]'
                                                            }`}
                                                        >
                                                            {p}
                                                        </PaginationLink>
                                                    )}
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => page < totalPages && setPage(page + 1)}
                                                    className={`rounded-lg border border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] h-8 text-sm ${
                                                        page === totalPages ? 'pointer-events-none opacity-30' : 'cursor-pointer'
                                                    }`}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                                <UsersRound className="h-7 w-7 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
                            <p className="text-base text-muted-foreground mb-6 max-w-[300px]">
                                {hasActiveFilter ? 'Try adjusting the role or status filter' : 'Get started by adding your first user to the system'}
                            </p>
                            {!hasActiveFilter && (
                                <Button
                                    onClick={handleAddUser}
                                    className="rounded-lg bg-white/[0.08] border border-white/15 text-foreground hover:bg-white/[0.12] text-base font-medium h-9 px-4"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                    Add First User
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <UserModal isOpen={isModalOpen} onClose={handleCloseModal} user={selectedUser} />
            <DeleteUserDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                user={userToDelete}
                action="delete"
                currentUserId={currentUser?.id}
            />
        </>
    );
}
