"use client";

import { cn } from "@/src/lib/utils/utils";
import { ProfileDropdown } from "./profile-dropdown";
import { User } from "@/src/features/auth/api/auth.types";

interface TopActionsProps {
    user: User;
    isMenuExpanded?: boolean;
    onLogout: () => void;
    /** Closes the ribbon menu (dismisses the backdrop) when invoked. */
    onCloseRibbon?: () => void;
}

export function TopActions({
                               user,
                               isMenuExpanded = false,
                               onLogout,
                               onCloseRibbon,
                           }: TopActionsProps) {
    return (
        <nav
            aria-label="Account"
            className={cn(
                "fixed top-2 right-2 sm:top-6 sm:right-6 flex items-center gap-3 z-[1001]",
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
                onItemSelect={onCloseRibbon}
            />
        </nav>
    );
}