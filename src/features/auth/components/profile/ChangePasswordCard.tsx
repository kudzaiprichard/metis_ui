'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react';

import { useUpdateMe } from '../../hooks/useAuth';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { ERROR_CODES } from '@/src/lib/constants';
import { changePasswordSchema, type ChangePasswordValues } from '@/src/lib/schemas/auth';
import { Input } from '@/src/components/shadcn/input';
import { Button } from '@/src/components/shadcn/button';
import { Label } from '@/src/components/shadcn/label';

const inputClass =
    'h-10 rounded-lg bg-input pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0';

const EMPTY: ChangePasswordValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

type VisibleField = 'currentPassword' | 'newPassword' | 'confirmPassword';

export function ChangePasswordCard() {
    const updateMe = useUpdateMe();
    const { showToast } = useToast();
    const [visible, setVisible] = useState<Record<VisibleField, boolean>>({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: EMPTY,
    });

    const toggle = (field: VisibleField) =>
        setVisible((prev) => ({ ...prev, [field]: !prev[field] }));

    const onSubmit = (values: ChangePasswordValues) => {
        updateMe.mutate(
            {
                current_password: values.currentPassword,
                password: values.newPassword,
            },
            {
                onSuccess: () => {
                    showToast(
                        'Password Updated',
                        'Use your new password the next time you sign in.',
                        'success',
                    );
                    reset(EMPTY);
                },
                onError: (error: ApiError) => {
                    switch (error.code) {
                        case ERROR_CODES.INVALID_CREDENTIALS:
                            showToast(
                                'Current password is incorrect',
                                'Re-enter your current password and try again.',
                                'error',
                            );
                            return;
                        case ERROR_CODES.VALIDATION_ERROR:
                            showToast('Validation Failed', error.getMessage(), 'error');
                            return;
                        default:
                            showToast('Password Update Failed', error.getMessage(), 'error');
                    }
                },
            },
        );
    };

    const pending = updateMe.isPending;

    return (
        <section
            aria-labelledby="change-password-heading"
            className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-5 sm:p-6"
        >
            <header className="flex items-center gap-2.5 mb-1">
                <KeyRound className="h-4 w-4 text-primary" />
                <h2
                    id="change-password-heading"
                    className="text-md font-semibold text-foreground"
                >
                    Change password
                </h2>
            </header>
            <p className="text-sm text-muted-foreground/70 mb-5">
                Pick a new password 8–128 characters long. You&apos;ll need your current password to
                confirm the change.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <PasswordField
                    id="current-password"
                    label="Current password"
                    autoComplete="current-password"
                    visible={visible.currentPassword}
                    onToggle={() => toggle('currentPassword')}
                    error={errors.currentPassword?.message}
                    disabled={pending}
                    register={register('currentPassword')}
                />
                <PasswordField
                    id="new-password"
                    label="New password"
                    autoComplete="new-password"
                    visible={visible.newPassword}
                    onToggle={() => toggle('newPassword')}
                    error={errors.newPassword?.message}
                    hint="8–128 characters"
                    disabled={pending}
                    register={register('newPassword')}
                />
                <PasswordField
                    id="confirm-password"
                    label="Confirm new password"
                    autoComplete="new-password"
                    visible={visible.confirmPassword}
                    onToggle={() => toggle('confirmPassword')}
                    error={errors.confirmPassword?.message}
                    disabled={pending}
                    register={register('confirmPassword')}
                />

                <div className="flex items-start gap-2.5 p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground/80 leading-relaxed">
                        After changing your password you may be signed out on other devices the next
                        time they reach the server.
                    </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <Button
                        type="submit"
                        disabled={pending || !isDirty}
                        className="h-9 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        {pending ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Saving…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <KeyRound className="h-3.5 w-3.5" />
                                Update password
                            </span>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={pending || !isDirty}
                        onClick={() => reset(EMPTY)}
                        className="h-9 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                    >
                        Clear
                    </Button>
                </div>
            </form>
        </section>
    );
}

interface PasswordFieldProps {
    id: string;
    label: string;
    autoComplete: 'current-password' | 'new-password';
    visible: boolean;
    onToggle: () => void;
    error?: string;
    hint?: string;
    disabled: boolean;
    register: ReturnType<ReturnType<typeof useForm<ChangePasswordValues>>['register']>;
}

function PasswordField({
    id,
    label,
    autoComplete,
    visible,
    onToggle,
    error,
    hint,
    disabled,
    register,
}: PasswordFieldProps) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs text-muted-foreground">
                {label}
            </Label>
            <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 pointer-events-none" />
                <Input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete={autoComplete}
                    disabled={disabled}
                    aria-invalid={!!error}
                    {...register}
                    className={inputClass}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    tabIndex={-1}
                    aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-white/5 transition-colors"
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            {error ? (
                <p className="text-xs text-destructive">{error}</p>
            ) : hint ? (
                <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
        </div>
    );
}
