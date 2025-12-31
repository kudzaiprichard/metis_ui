/**
 * AuthChecker Component
 * Fetches current user on app mount if token exists
 */

'use client';

import {useCurrentUser} from "@/src/features/auth/hooks/useAuth";

export function AuthChecker() {
    // useCurrentUser now automatically checks for token
    // and only fetches if token exists (enabled: isAuthenticated())
    useCurrentUser();

    // This component doesn't render anything
    // It just triggers the /me API call when token exists
    return null;
}