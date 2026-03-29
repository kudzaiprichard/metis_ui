'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useLogin } from '../hooks/useAuth';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';
import { ERROR_CODES } from '@/src/lib/constants';
import { loginSchema, type LoginFormValues } from '@/src/lib/schemas/auth';
import { Input } from '@/src/components/shadcn/input';
import { Button } from '@/src/components/shadcn/button';
import { Label } from '@/src/components/shadcn/label';
import { Checkbox } from '@/src/components/shadcn/checkbox';
import {
    Activity,
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    LogIn,
    Mail,
    ShieldCheck,
} from 'lucide-react';

export function LoginForm() {
    const login = useLogin();
    const { showToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', rememberMe: false },
    });

    const rememberMe = watch('rememberMe') ?? false;

    const onSubmit = (values: LoginFormValues) => {
        login.mutate(
            { email: values.email, password: values.password },
            {
                onError: (error: ApiError) => {
                    // Spec §2.3 / §4: INVALID_CREDENTIALS (401) and ACCOUNT_INACTIVE (403)
                    // are the two login failure codes — surface distinct copy for each.
                    switch (error.code) {
                        case ERROR_CODES.INVALID_CREDENTIALS:
                            showToast(
                                'Invalid credentials',
                                'The email or password you entered is incorrect.',
                                'error',
                            );
                            return;
                        case ERROR_CODES.ACCOUNT_INACTIVE:
                            showToast(
                                'Account inactive',
                                'This account has been deactivated. Contact an administrator.',
                                'error',
                            );
                            return;
                        default:
                            showToast('Login Failed', error.getMessage(), 'error');
                    }
                },
            },
        );
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Mobile-only wordmark — large screens get the BrandShowcase column */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-[0_6px_20px_rgba(16,185,129,0.3)]">
                    <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-foreground">Metis</h1>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        Diabetes Treatment Optimization
                    </p>
                </div>
            </div>

            {/* Heading */}
            <header className="space-y-2 mb-8">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border border-primary/25 bg-primary/10 text-xs font-semibold text-primary uppercase tracking-wider">
                    <LogIn className="h-3 w-3" />
                    Welcome back
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    Sign in to your account
                </h2>
                <p className="text-sm text-muted-foreground">
                    Use your work email and password.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* Email */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="email"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                        Email
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 pointer-events-none" />
                        <Input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            disabled={login.isPending}
                            aria-invalid={!!errors.email}
                            {...register('email')}
                            className="h-11 rounded-lg bg-input/95 border-white/15 pl-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 transition-colors"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="password"
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                        Password
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 pointer-events-none" />
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            disabled={login.isPending}
                            aria-invalid={!!errors.password}
                            {...register('password')}
                            className="h-11 rounded-lg bg-input/95 border-white/15 pl-10 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-white/5 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                </div>

                {/* Row — remember me */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) =>
                                setValue('rememberMe', checked as boolean)
                            }
                            disabled={login.isPending}
                            className="h-3.5 w-3.5 rounded-lg border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                            htmlFor="remember"
                            className="text-xs text-muted-foreground cursor-pointer"
                        >
                            Remember me on this device
                        </Label>
                    </div>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={login.isPending}
                    className="w-full h-11 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_6px_24px_rgba(16,185,129,0.25)] disabled:opacity-70"
                >
                    {login.isPending ? (
                        'Signing in...'
                    ) : (
                        <span className="flex items-center gap-2">
                            Sign In
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    )}
                </Button>
            </form>

            {/* Admin-managed accounts notice */}
            <div className="mt-7 flex items-start gap-3 p-3.5 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Accounts are provisioned by an administrator.{' '}
                    <span className="text-foreground font-semibold">
                        Contact admin to get your account created.
                    </span>
                </p>
            </div>
        </div>
    );
}
