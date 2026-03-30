'use client';

import { Check, Lock, ShieldCheck } from 'lucide-react';

import { User, UserRole, normalizeUserRole } from '../../api/auth.types';

interface PermissionsCardProps {
    user: User;
}

const DOCTOR_ABILITIES = [
    'View and manage assigned patients',
    'Create medical records',
    'Run AI predictions on patients',
    'Search similar historical cases',
];

const DOCTOR_RESTRICTIONS = ['User administration', 'Bandit simulations'];

const ADMIN_ABILITIES = [
    'Manage system users (create, edit, deactivate)',
    'Run NeuralThompson bandit simulations',
    'Inspect simulation history & per-step decisions',
];

const ADMIN_RESTRICTIONS = ['Patient records (clinical PHI)'];

export function PermissionsCard({ user }: PermissionsCardProps) {
    const role = normalizeUserRole(user.role);
    const isAdmin = role === UserRole.ADMIN;
    const abilities = isAdmin ? ADMIN_ABILITIES : DOCTOR_ABILITIES;
    const restrictions = isAdmin ? ADMIN_RESTRICTIONS : DOCTOR_RESTRICTIONS;

    return (
        <section
            aria-labelledby="permissions-heading"
            className="flex flex-col gap-3 rounded-lg border border-white/10 bg-card/30 backdrop-blur-sm p-4"
        >
            <header className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <h3
                    id="permissions-heading"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                    What you can do
                </h3>
            </header>

            <ul className="flex flex-col gap-1.5">
                {abilities.map((ability) => (
                    <li
                        key={ability}
                        className="flex items-start gap-2 text-xs text-foreground/85 leading-relaxed"
                    >
                        <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                        <span>{ability}</span>
                    </li>
                ))}
            </ul>

            {restrictions.length > 0 && (
                <>
                    <div className="h-px bg-white/[0.06]" />
                    <ul className="flex flex-col gap-1.5">
                        {restrictions.map((r) => (
                            <li
                                key={r}
                                className="flex items-start gap-2 text-xs text-muted-foreground/70 leading-relaxed"
                            >
                                <Lock className="h-3 w-3 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                                <span>{r}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <p className="text-xs text-muted-foreground/50 leading-relaxed pt-1 border-t border-white/[0.06]">
                Need different access? Ask an administrator to update your role.
            </p>
        </section>
    );
}
