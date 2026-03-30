'use client';

import { CheckCircle2, Mail, ShieldCheck, Stethoscope } from 'lucide-react';

import { User, UserRole, normalizeUserRole } from '../../api/auth.types';

interface ProfileHeroProps {
    user: User;
}

const formatJoined = (iso: string) => {
    try {
        return new Date(iso).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return iso;
    }
};

export function ProfileHero({ user }: ProfileHeroProps) {
    const role = normalizeUserRole(user.role);
    const RoleIcon = role === UserRole.ADMIN ? ShieldCheck : Stethoscope;
    const roleLabel = role === UserRole.ADMIN ? 'Administrator' : 'Doctor';
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

    return (
        <section
            aria-labelledby="profile-hero-name"
            className="relative overflow-hidden rounded-lg border border-primary/15 bg-card/30 backdrop-blur-sm"
        >
            {/* Ambient glow strip across the top */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent"
            />
            <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-[80px]"
            />

            <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-700 via-primary to-emerald-400 flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-[0_8px_24px_rgba(16,185,129,0.3)]">
                        {initials}
                    </div>
                    {user.isActive && (
                        <span
                            aria-label="Active account"
                            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary border-2 border-card text-primary-foreground"
                        >
                            <CheckCircle2 className="h-3 w-3" />
                        </span>
                    )}
                </div>

                {/* Identity */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-primary/15 border border-primary/25 mb-2">
                        <RoleIcon className="h-3 w-3 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            {roleLabel}
                        </span>
                    </div>
                    <h1
                        id="profile-hero-name"
                        className="text-2xl font-bold text-foreground tracking-tight"
                    >
                        {user.firstName} {user.lastName}
                    </h1>
                    <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-muted-foreground mt-1 truncate">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                    </p>
                </div>

                {/* Joined-since pill */}
                <div className="hidden lg:flex flex-col items-end gap-0.5 text-right">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground/70 font-semibold">
                        Member since
                    </span>
                    <span className="text-md font-semibold text-foreground">
                        {formatJoined(user.createdAt)}
                    </span>
                </div>
            </div>
        </section>
    );
}
