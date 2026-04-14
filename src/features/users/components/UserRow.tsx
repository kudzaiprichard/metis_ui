'use client';

import { Button } from '@/src/components/shadcn/button';
import { TableCell, TableRow } from '@/src/components/shadcn/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/src/components/shadcn/tooltip';
import { User } from '../api/users.types';
import { Pencil, Trash2 } from 'lucide-react';

interface UserRowProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

export function UserRow({ user, onEdit, onDelete }: UserRowProps) {
    const getInitials = () =>
        `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const roleUpper = user.role.toUpperCase();
    const isAdmin = roleUpper === 'ADMIN';
    const getRoleDisplay = () => (isAdmin ? 'Admin' : 'Doctor');

    return (
        <TableRow className="hover:bg-white/[0.03] border-b border-white/5">
            {/* User */}
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center text-base font-semibold text-foreground flex-shrink-0">
                        {getInitials()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-semibold text-foreground truncate">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            @{user.username}
                        </p>
                    </div>
                </div>
            </TableCell>

            {/* Email */}
            <TableCell className="text-base text-muted-foreground truncate max-w-[200px]">
                {user.email}
            </TableCell>

            {/* Role */}
            <TableCell>
                <span
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg border ${
                        isAdmin
                            ? 'bg-pink-500/[0.1] text-pink-400 border-pink-500/20'
                            : 'bg-violet-500/[0.1] text-violet-400 border-violet-500/20'
                    }`}
                >
                    {getRoleDisplay()}
                </span>
            </TableCell>

            {/* Status — reflects the live isActive flag (spec §5 UserResponse.isActive) */}
            <TableCell>
                {user.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/[0.1] text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-red-500/[0.1] text-red-400 border border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Inactive
                    </span>
                )}
            </TableCell>

            {/* Created */}
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(user.createdAt)}
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
                <TooltipProvider>
                    <div className="flex items-center justify-end gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-info hover:bg-info/10"
                                    onClick={() => onEdit(user)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Edit</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => onDelete(user)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Delete</p></TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            </TableCell>
        </TableRow>
    );
}