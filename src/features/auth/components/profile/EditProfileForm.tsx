'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, Mail, Pencil, RotateCcw, User as UserIcon } from 'lucide-react';

import { useUpdateMe } from '../../hooks/useAuth';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { ERROR_CODES } from '@/src/lib/constants';
import { User, UpdateProfileRequest } from '../../api/auth.types';
import { profileSchema, type ProfileFormValues } from '@/src/lib/schemas/auth';
import { Input } from '@/src/components/shadcn/input';
import { Button } from '@/src/components/shadcn/button';
import { Label } from '@/src/components/shadcn/label';

interface EditProfileFormProps {
    user: User;
}

const inputClass =
    'h-9 rounded-lg bg-input pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0';
const plainInputClass =
    'h-9 rounded-lg bg-input text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0';

export function EditProfileForm({ user }: EditProfileFormProps) {
    const updateMe = useUpdateMe();
    const { showToast } = useToast();

    const initialValues = (): ProfileFormValues => ({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        username: user.username ?? '',
        email: user.email ?? '',
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: initialValues(),
    });

    // Re-seed when the parent's user reference changes (e.g. after a save).
    useEffect(() => {
        reset(initialValues());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, reset]);

    const onSubmit = (values: ProfileFormValues) => {
        const payload: UpdateProfileRequest = {};
        if (values.firstName !== user.firstName) payload.first_name = values.firstName;
        if (values.lastName !== user.lastName) payload.last_name = values.lastName;
        if (values.username !== user.username) payload.username = values.username;
        if (values.email !== user.email) payload.email = values.email;
        if (Object.keys(payload).length === 0) return;

        updateMe.mutate(payload, {
            onSuccess: (saved) => {
                showToast('Profile Updated', 'Your profile has been saved.', 'success');
                reset({
                    firstName: saved.firstName ?? '',
                    lastName: saved.lastName ?? '',
                    username: saved.username ?? '',
                    email: saved.email ?? '',
                });
            },
            onError: (error: ApiError) => {
                switch (error.code) {
                    case ERROR_CODES.USERNAME_EXISTS:
                        showToast(
                            'Username taken',
                            'That username is already in use. Please choose a different one.',
                            'error',
                        );
                        return;
                    case ERROR_CODES.EMAIL_EXISTS:
                        showToast(
                            'Email already registered',
                            'Another account already uses that email address.',
                            'error',
                        );
                        return;
                    case ERROR_CODES.VALIDATION_ERROR:
                        showToast('Validation Failed', error.getMessage(), 'error');
                        return;
                    default:
                        showToast('Update Failed', error.getMessage(), 'error');
                }
            },
        });
    };

    const handleRevert = () => {
        reset(initialValues());
    };

    const pending = updateMe.isPending;

    return (
        <section
            aria-labelledby="edit-profile-heading"
            className="rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-5 sm:p-6"
        >
            <header className="flex items-center gap-2.5 mb-1">
                <Pencil className="h-4 w-4 text-primary" />
                <h2 id="edit-profile-heading" className="text-md font-semibold text-foreground">
                    Personal details
                </h2>
            </header>
            <p className="text-sm text-muted-foreground/70 mb-5">
                Edit how you appear in the system. Role is managed by an administrator.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="profile-first-name"
                            className="text-xs text-muted-foreground"
                        >
                            First name
                        </Label>
                        <Input
                            id="profile-first-name"
                            disabled={pending}
                            aria-invalid={!!errors.firstName}
                            {...register('firstName')}
                            className={plainInputClass}
                        />
                        {errors.firstName ? (
                            <p className="text-xs text-destructive">{errors.firstName.message}</p>
                        ) : (
                            <p className="text-xs text-muted-foreground">1–100 characters</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="profile-last-name"
                            className="text-xs text-muted-foreground"
                        >
                            Last name
                        </Label>
                        <Input
                            id="profile-last-name"
                            disabled={pending}
                            aria-invalid={!!errors.lastName}
                            {...register('lastName')}
                            className={plainInputClass}
                        />
                        {errors.lastName ? (
                            <p className="text-xs text-destructive">{errors.lastName.message}</p>
                        ) : (
                            <p className="text-xs text-muted-foreground">1–100 characters</p>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="profile-username" className="text-xs text-muted-foreground">
                        Username
                    </Label>
                    <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="profile-username"
                            disabled={pending}
                            aria-invalid={!!errors.username}
                            {...register('username')}
                            className={inputClass}
                        />
                    </div>
                    {errors.username ? (
                        <p className="text-xs text-destructive">{errors.username.message}</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">3–100 characters</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="profile-email" className="text-xs text-muted-foreground">
                        Email address
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="profile-email"
                            type="email"
                            autoComplete="email"
                            disabled={pending}
                            aria-invalid={!!errors.email}
                            {...register('email')}
                            className={inputClass}
                        />
                    </div>
                    {errors.email ? (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            You sign in with this address.
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <Button
                        type="submit"
                        disabled={pending || !isDirty}
                        className="h-9 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            {pending ? 'Saving…' : 'Save changes'}
                        </span>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={pending || !isDirty}
                        onClick={handleRevert}
                        className="h-9 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Revert
                    </Button>
                </div>
            </form>
        </section>
    );
}
