'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/src/components/shadcn/dialog';
import { Button } from '@/src/components/shadcn/button';
import { Input } from '@/src/components/shadcn/input';
import { Label } from '@/src/components/shadcn/label';
import { Checkbox } from '@/src/components/shadcn/checkbox';
import { User, CreateUserRequest, UpdateUserRequest } from '../api/users.types';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { USER_ROLES, UserRole, ERROR_CODES } from '@/src/lib/constants';
import {
    UserCreateValues,
    UserEditValues,
    userCreateSchema,
    userEditSchema,
} from '@/src/lib/schemas/users';
import { AtSign, Plus, Check, Loader2, Eye, EyeOff, Stethoscope, ShieldCheck } from 'lucide-react';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
}

const emptyCreate: UserCreateValues = {
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: USER_ROLES.DOCTOR as UserRole,
};

const emptyEdit: UserEditValues = {
    username: '',
    firstName: '',
    lastName: '',
    role: USER_ROLES.DOCTOR as UserRole,
    isActive: true,
};

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
    const isEditMode = !!user;
    const [showPassword, setShowPassword] = useState(false);

    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const { showToast } = useToast();

    const createForm = useForm<UserCreateValues>({
        resolver: zodResolver(userCreateSchema),
        defaultValues: emptyCreate,
    });

    const editForm = useForm<UserEditValues>({
        resolver: zodResolver(userEditSchema),
        defaultValues: emptyEdit,
    });

    useEffect(() => {
        if (!isOpen) {
            createForm.reset(emptyCreate);
            editForm.reset(emptyEdit);
            setShowPassword(false);
            return;
        }
        if (isEditMode && user) {
            editForm.reset({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: (user.role.toUpperCase() as UserRole) ?? USER_ROLES.DOCTOR,
                isActive: user.isActive,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isEditMode, user]);

    const isPending = createUser.isPending || updateUser.isPending;

    const handleMutationError = (error: ApiError, defaultTitle: string) => {
        switch (error.code) {
            case ERROR_CODES.EMAIL_EXISTS:
                showToast(
                    'Email already registered',
                    'An account with this email already exists.',
                    'error',
                );
                return;
            case ERROR_CODES.USERNAME_EXISTS:
                showToast(
                    'Username taken',
                    'That username is already in use. Please choose a different one.',
                    'error',
                );
                return;
            case ERROR_CODES.USER_NOT_FOUND:
                showToast('User not found', 'This user may have been deleted.', 'error');
                return;
            default:
                showToast(defaultTitle, error.getMessage(), 'error');
        }
    };

    const onCreate = (values: UserCreateValues) => {
        const payload: CreateUserRequest = {
            email: values.email,
            username: values.username,
            first_name: values.firstName,
            last_name: values.lastName,
            password: values.password,
            role: values.role,
        };
        createUser.mutate(payload, {
            onSuccess: () => {
                showToast(
                    'User Created',
                    `${values.firstName} ${values.lastName} has been created successfully`,
                    'success',
                );
                onClose();
            },
            onError: (error: ApiError) => handleMutationError(error, 'Creation Failed'),
        });
    };

    const onEdit = (values: UserEditValues) => {
        if (!user) return;
        // Spec §5 UpdateUserRequest — only send fields that actually changed.
        const payload: UpdateUserRequest = {};
        if (values.firstName !== user.firstName) payload.first_name = values.firstName;
        if (values.lastName !== user.lastName) payload.last_name = values.lastName;
        if (values.username !== user.username) payload.username = values.username;
        if (values.role !== (user.role.toUpperCase() as UserRole)) payload.role = values.role;
        if (values.isActive !== user.isActive) payload.is_active = values.isActive;

        if (Object.keys(payload).length === 0) {
            onClose();
            return;
        }

        updateUser.mutate(
            { userId: user.id, data: payload },
            {
                onSuccess: () => {
                    showToast(
                        'User Updated',
                        `${values.firstName} ${values.lastName} has been updated successfully`,
                        'success',
                    );
                    onClose();
                },
                onError: (error: ApiError) => handleMutationError(error, 'Update Failed'),
            },
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="rounded-lg border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl max-w-[480px] p-0 gap-0">
                <DialogHeader className="p-5 pb-4 border-b border-white/10">
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        {isEditMode ? 'Edit User' : 'Add New User'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {isEditMode
                            ? 'Update user information, role, and active status'
                            : 'Create a new user account for the system'}
                    </DialogDescription>
                </DialogHeader>

                {isEditMode ? (
                    <EditFormBody
                        form={editForm}
                        user={user}
                        isPending={isPending}
                        onSubmit={onEdit}
                        onCancel={onClose}
                    />
                ) : (
                    <CreateFormBody
                        form={createForm}
                        isPending={isPending}
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword((v) => !v)}
                        onSubmit={onCreate}
                        onCancel={onClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

function RolePicker({
    value,
    disabled,
    onChange,
}: {
    value: UserRole;
    disabled: boolean;
    onChange: (role: UserRole) => void;
}) {
    return (
        <div className="grid grid-cols-2 gap-2.5">
            <button
                type="button"
                onClick={() => onChange(USER_ROLES.DOCTOR)}
                disabled={disabled}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                    value === USER_ROLES.DOCTOR
                        ? 'bg-primary/[0.12] border-primary text-foreground'
                        : 'bg-white/[0.03] border-white/10 text-muted-foreground hover:bg-white/[0.06] hover:border-white/15'
                }`}
            >
                <Stethoscope
                    className={`h-5 w-5 ${value === USER_ROLES.DOCTOR ? 'text-primary' : ''}`}
                />
                <span className="text-base font-medium">Doctor</span>
            </button>
            <button
                type="button"
                onClick={() => onChange(USER_ROLES.ADMIN)}
                disabled={disabled}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                    value === USER_ROLES.ADMIN
                        ? 'bg-primary/[0.12] border-primary text-foreground'
                        : 'bg-white/[0.03] border-white/10 text-muted-foreground hover:bg-white/[0.06] hover:border-white/15'
                }`}
            >
                <ShieldCheck
                    className={`h-5 w-5 ${value === USER_ROLES.ADMIN ? 'text-primary' : ''}`}
                />
                <span className="text-base font-medium">Admin</span>
            </button>
        </div>
    );
}

function CreateFormBody({
    form,
    isPending,
    showPassword,
    onTogglePassword,
    onSubmit,
    onCancel,
}: {
    form: UseFormReturn<UserCreateValues>;
    isPending: boolean;
    showPassword: boolean;
    onTogglePassword: () => void;
    onSubmit: (values: UserCreateValues) => void;
    onCancel: () => void;
}) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = form;

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="first_name" className="text-sm text-muted-foreground">
                            First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="first_name"
                            placeholder="John"
                            disabled={isPending}
                            aria-invalid={!!errors.firstName}
                            maxLength={100}
                            {...register('firstName')}
                            className="rounded-lg bg-white/5 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                        />
                        <FieldError message={errors.firstName?.message} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="last_name" className="text-sm text-muted-foreground">
                            Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="last_name"
                            placeholder="Smith"
                            disabled={isPending}
                            aria-invalid={!!errors.lastName}
                            maxLength={100}
                            {...register('lastName')}
                            className="rounded-lg bg-white/5 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                        />
                        <FieldError message={errors.lastName?.message} />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="username" className="text-sm text-muted-foreground">
                        Username <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="username"
                            placeholder="johnsmith"
                            disabled={isPending}
                            aria-invalid={!!errors.username}
                            maxLength={100}
                            {...register('username')}
                            className="rounded-lg bg-white/5 border-white/10 pl-8 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                        />
                    </div>
                    {errors.username ? (
                        <FieldError message={errors.username.message} />
                    ) : (
                        <p className="text-xs text-muted-foreground">3–100 characters</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="text-sm text-muted-foreground">
                        Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="user@hospital.com"
                        disabled={isPending}
                        aria-invalid={!!errors.email}
                        {...register('email')}
                        className="rounded-lg bg-white/5 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                    />
                    <FieldError message={errors.email?.message} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password" className="text-sm text-muted-foreground">
                        Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            disabled={isPending}
                            aria-invalid={!!errors.password}
                            maxLength={128}
                            {...register('password')}
                            className="rounded-lg bg-white/5 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={onTogglePassword}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                                <Eye className="h-3.5 w-3.5" />
                            )}
                        </Button>
                    </div>
                    {errors.password ? (
                        <FieldError message={errors.password.message} />
                    ) : (
                        <p className="text-xs text-muted-foreground">8–128 characters</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm text-muted-foreground">
                        Role <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                        control={control}
                        name="role"
                        render={({ field }) => (
                            <RolePicker
                                value={field.value}
                                disabled={isPending}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <FieldError message={errors.role?.message} />
                </div>
            </div>

            <DialogFooter className="p-5 pt-4 border-t border-white/10 flex gap-2.5 sm:flex-row">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isPending}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-10 text-base font-semibold"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground border-0 h-10 text-base font-semibold"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Create User
                        </>
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}

function EditFormBody({
    form,
    user,
    isPending,
    onSubmit,
    onCancel,
}: {
    form: UseFormReturn<UserEditValues>;
    user: User;
    isPending: boolean;
    onSubmit: (values: UserEditValues) => void;
    onCancel: () => void;
}) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = form;

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="first_name" className="text-sm text-muted-foreground">
                            First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="first_name"
                            disabled={isPending}
                            aria-invalid={!!errors.firstName}
                            maxLength={100}
                            {...register('firstName')}
                            className="rounded-lg bg-white/5 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                        />
                        <FieldError message={errors.firstName?.message} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="last_name" className="text-sm text-muted-foreground">
                            Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="last_name"
                            disabled={isPending}
                            aria-invalid={!!errors.lastName}
                            maxLength={100}
                            {...register('lastName')}
                            className="rounded-lg bg-white/5 border-white/10 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                        />
                        <FieldError message={errors.lastName?.message} />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="username" className="text-sm text-muted-foreground">
                        Username <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="username"
                            disabled={isPending}
                            aria-invalid={!!errors.username}
                            maxLength={100}
                            {...register('username')}
                            className="rounded-lg bg-white/5 border-white/10 pl-8 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                        />
                    </div>
                    {errors.username ? (
                        <FieldError message={errors.username.message} />
                    ) : (
                        <p className="text-xs text-muted-foreground">3–100 characters</p>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email-display" className="text-sm text-muted-foreground">
                        Email Address <span className="text-xs">(read-only)</span>
                    </Label>
                    <Input
                        id="email-display"
                        value={user.email}
                        readOnly
                        disabled
                        className="rounded-lg bg-white/[0.03] border-white/10 text-base text-muted-foreground"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm text-muted-foreground">
                        Role <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                        control={control}
                        name="role"
                        render={({ field }) => (
                            <RolePicker
                                value={field.value}
                                disabled={isPending}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <FieldError message={errors.role?.message} />
                </div>

                <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                            <div className="flex flex-col gap-0.5">
                                <Label htmlFor="is_active" className="text-base text-foreground">
                                    Active account
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Disable to deactivate — login will be blocked with
                                    ACCOUNT_INACTIVE.
                                </p>
                            </div>
                            <Checkbox
                                id="is_active"
                                checked={field.value}
                                onCheckedChange={(checked) => field.onChange(checked === true)}
                                disabled={isPending}
                                className="h-4 w-4 rounded-lg border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                        </div>
                    )}
                />
            </div>

            <DialogFooter className="p-5 pt-4 border-t border-white/10 flex gap-2.5 sm:flex-row">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isPending}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-10 text-base font-semibold"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground border-0 h-10 text-base font-semibold"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Check className="h-3.5 w-3.5 mr-1.5" />
                            Update User
                        </>
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}
