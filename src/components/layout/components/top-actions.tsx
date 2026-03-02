"use client";

import { cn } from "@/src/lib/utils/utils";
import { ProfileDropdown } from "./profile-dropdown";
import { User } from "@/src/features/auth/api/auth.types";

interface TopActionsProps {
    user: User;
    isMenuExpanded?: boolean;
    onLogout: () => void;
}

export function TopActions({
                               user,
                               isMenuExpanded = false,
                               onLogout,
                           }: TopActionsProps) {
    return (
        <div
            className={cn(
                "fixed top-6 right-6 flex items-center gap-3 z-[1001]",
                isMenuExpanded
                    ? "opacity-100 pointer-events-auto translate-y-0"
                    : "opacity-0 pointer-events-none translate-y-[-8px]"
            )}
            style={{
                transition: "all 400ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
        >
            <ProfileDropdown
                user={user}
                onLogout={onLogout}
            />
        </div>
    );
}