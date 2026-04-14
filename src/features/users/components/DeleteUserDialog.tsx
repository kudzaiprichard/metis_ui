'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/src/components/shadcn/dialog';
import { Button } from '@/src/components/shadcn/button';
import { User } from '../api/users.types';
import { useDeleteUser } from '../hooks/useUsers';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { Trash2, RotateCcw, Loader2, CircleAlert } from 'lucide-react';

interface DeleteUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    action: 'delete' | 'restore';
    currentUserId?: string;
}

export function DeleteUserDialog({ isOpen, onClose, user, action, currentUserId }: DeleteUserDialogProps) {
    const deleteUser = useDeleteUser();
    const { showToast } = useToast();

    if (!user) return null;

    const isDelete = action === 'delete';
    const isSelf = currentUserId === user.id;
    const isPending = deleteUser.isPending;

    const handleConfirm = () => {
        if (isSelf && isDelete) {
            showToast('Cannot Delete', 'You cannot delete your own account', 'error');
            return;
        }

        if (!isDelete) {
            // Spec §5: DELETE is permanent. No restore endpoint exists.
            showToast('Not supported', 'User deletion is permanent — no restore endpoint is available.', 'error');
            return;
        }

        deleteUser.mutate(user.id, {
            onSuccess: () => {
                showToast(
                    isDelete ? 'User Deleted' : 'User Restored',
                    `${user.firstName} ${user.lastName} has been ${isDelete ? 'deleted' : 'restored'} successfully`,
                    'success'
                );
                onClose();
            },
            onError: (error: ApiError) => {
                showToast(
                    isDelete ? 'Delete Failed' : 'Restore Failed',
                    error.getMessage(),
                    'error'
                );
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-lg border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl max-w-[420px] p-0 gap-0">
                <DialogHeader className="p-5 pb-4 border-b border-white/10">
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        {isDelete ? 'Delete User?' : 'Restore User?'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {isDelete ? 'This action can be reversed later' : 'Reactivate this user account'}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-5">
                    {isSelf && isDelete ? (
                        <div className="flex gap-3 p-3.5 bg-red-500/[0.08] border border-red-500/20 rounded-lg">
                            <CircleAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
                            <div>
                                <p className="text-md font-medium text-foreground mb-1">
                                    Cannot delete your own account
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Please ask another administrator to perform this action if needed.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className={`flex gap-3 p-3.5 rounded-lg border ${isDelete ? 'bg-red-500/[0.08] border-red-500/20' : 'bg-emerald-500/[0.08] border-emerald-500/20'}`}>
                            {isDelete ? (
                                <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
                            ) : (
                                <RotateCcw className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <p className="text-md font-medium text-foreground mb-1">
                                    {isDelete ? 'Delete' : 'Restore'}{' '}
                                    <span className={`font-semibold ${isDelete ? 'text-red-500' : 'text-emerald-400'}`}>
                                        {user.firstName} {user.lastName}
                                    </span>
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {isDelete
                                        ? 'This user will be deactivated and can be restored later from the archive.'
                                        : 'This user will be reactivated and can access the system again.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-5 pt-4 border-t border-white/10 flex gap-2.5 sm:flex-row">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-10 text-base font-semibold"
                    >
                        Cancel
                    </Button>
                    {!(isSelf && isDelete) && (
                        <Button
                            onClick={handleConfirm}
                            disabled={isPending}
                            className={`flex-1 rounded-lg border-0 h-10 text-base font-semibold text-white ${
                                isDelete
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    {isDelete ? 'Deleting...' : 'Restoring...'}
                                </>
                            ) : (
                                <>
                                    {isDelete ? (
                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                    ) : (
                                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                    )}
                                    {isDelete ? 'Delete User' : 'Restore User'}
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}