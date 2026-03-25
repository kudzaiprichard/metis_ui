'use client';

import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { PageLoader } from '@/src/components/shared/ui/page-loader';

export function DashboardContent() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <PageLoader isLoading fullPage={false} loadingText="Loading..." />;
    }

    if (!user) {
        return <PageLoader isLoading fullPage={false} loadingText="Loading user data..." />;
    }

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    return (
        <>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                    Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Welcome back, {user.firstName}!
                </p>
            </div>

            {/* User Info Card */}
            <div className="rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-[24px] p-8 mb-6 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_8px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
                {/* Card Header */}
                <div className="flex items-center gap-5 mb-8 pb-6 border-b border-white/10 flex-col sm:flex-row sm:items-center items-start">
                    <div className="w-20 h-20 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-700 to-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-white">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl sm:text-2xl font-semibold text-foreground mb-1">
                            {user.firstName} {user.lastName}
                        </h2>
                        <p className="text-sm text-emerald-400">{user.email}</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 md:gap-6">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                            User ID
                        </p>
                        <p className="text-base font-mono text-foreground break-all">
                            {user.id}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                            Role
                        </p>
                        <span className="inline-flex w-fit px-3 py-1.5 rounded-lg bg-emerald-400/20 border border-emerald-400/30 text-xs font-semibold text-emerald-400">
                            {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                            Created At
                        </p>
                        <p className="text-sm font-medium text-foreground">
                            {formatDate(user.createdAt)}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                            Last Updated
                        </p>
                        <p className="text-sm font-medium text-foreground">
                            {formatDate(user.updatedAt)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Raw JSON (debug) */}
            <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur-[24px] p-6 mb-24">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                    Raw User Data (Debug)
                </h3>
                <pre className="text-xs text-emerald-400 font-mono leading-relaxed overflow-auto">
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>
        </>
    );
}
