import Cookies from 'js-cookie';
import { COOKIE_NAMES, COOKIE_OPTIONS } from '../constants';

// Spec §2.5 returns plain JWT strings with no `expires_at` — derive cookie
// expiry from the JWT's own `exp` claim (mirrors api-client.ts).
function decodeJwtExpiry(jwt: string): Date | undefined {
    try {
        const payload = jwt.split('.')[1];
        if (!payload) return undefined;
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const { exp } = JSON.parse(atob(base64)) as { exp?: number };
        return typeof exp === 'number' ? new Date(exp * 1000) : undefined;
    } catch {
        return undefined;
    }
}

/**
 * Store authentication tokens in cookies
 * Called after successful login or register
 */
export function setAuthTokens(accessToken: string, refreshToken: string) {
    Cookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
        ...COOKIE_OPTIONS,
        expires: decodeJwtExpiry(accessToken),
    });

    Cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
        ...COOKIE_OPTIONS,
        expires: decodeJwtExpiry(refreshToken) ?? 30,
    });
}

/**
 * Get access token from cookies
 */
export function getAccessToken(): string | undefined {
    return Cookies.get(COOKIE_NAMES.ACCESS_TOKEN);
}

/**
 * Get refresh token from cookies
 */
export function getRefreshToken(): string | undefined {
    return Cookies.get(COOKIE_NAMES.REFRESH_TOKEN);
}

/**
 * Clear all authentication tokens
 * Called on logout or when tokens are invalid
 */
export function clearAuthTokens() {
    Cookies.remove(COOKIE_NAMES.ACCESS_TOKEN);
    Cookies.remove(COOKIE_NAMES.REFRESH_TOKEN);
}

/**
 * Check if user is authenticated (has valid access token)
 */
export function isAuthenticated(): boolean {
    return !!getAccessToken();
}