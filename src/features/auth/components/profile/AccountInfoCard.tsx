'use client';

import { Activity, CalendarPlus, IdCard, RefreshCw } from 'lucide-react';

import { User } from '../../api/auth.types';

interface AccountInfoCardProps {
    user: User;
}

const formatDate = (iso: string) => {
    try {
        return new Date(iso).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return iso;
    }
};

export function AccountInfoCard({ user }: AccountInfoCardProps) {
    return (
        <section
            aria-labelledby="account-info-heading"
            className="flex flex-col gap-3 rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-4"
        >
            <header className="flex items-center gap-2">
                <IdCard className="h-3.5 w-3.5 text-primary" />
                <h3
                    id="account-info-heading"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                    Account
                </h3>
            </header>

            <dl className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                        User ID
                    </dt>
                    <dd className="text-xs font-mono text-foreground/90 break-all">{user.id}</dd>
                </div>

                <div className="flex flex-col gap-0.5">
                    <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                        <Activity className="h-3 w-3" />
                        Status
                    </dt>
                    <dd>
                        {user.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-primary/15 border border-primary/25 text-xs font-semibold text-primary">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-warning/15 border border-warning/25 text-xs font-semibold text-warning">
                                Inactive
                            </span>
                        )}
                    </dd>
                </div>

                <div className="flex flex-col gap-0.5">
                    <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                        <CalendarPlus className="h-3 w-3" />
                        Joined
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                        {formatDate(user.createdAt)}
                    </dd>
                </div>

                <div className="flex flex-col gap-0.5">
                    <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                        <RefreshCw className="h-3 w-3" />
                        Last updated
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                        {formatDate(user.updatedAt)}
                    </dd>
                </div>
            </dl>
        </section>
    );
}
