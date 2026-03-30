'use client';

import { Loader2 } from 'lucide-react';

import { useCurrentUser } from '../../hooks/useAuth';
import { ProfileHero } from './ProfileHero';
import { EditProfileForm } from './EditProfileForm';
import { ChangePasswordCard } from './ChangePasswordCard';
import { AccountInfoCard } from './AccountInfoCard';
import { PermissionsCard } from './PermissionsCard';
import { SessionInfoCard } from './SessionInfoCard';
import { QuickActionsCard } from './QuickActionsCard';

export function ProfileView() {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Loading profile…</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-sm text-muted-foreground">
                Unable to load your profile.
            </div>
        );
    }

    return (
        <div className="pb-24 space-y-5">
            <ProfileHero user={user} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Main column — editable forms + permissions */}
                <div className="lg:col-span-8 flex flex-col gap-5">
                    <EditProfileForm user={user} />
                    <ChangePasswordCard />
                    <PermissionsCard user={user} />
                </div>

                {/* Side rail — small widgets stack */}
                <aside className="lg:col-span-4 flex flex-col gap-5">
                    <AccountInfoCard user={user} />
                    <SessionInfoCard />
                    <QuickActionsCard user={user} />
                </aside>
            </div>
        </div>
    );
}
