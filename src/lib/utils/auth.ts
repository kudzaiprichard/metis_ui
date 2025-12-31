import Cookies from 'js-cookie';
import { COOKIE_NAMES, COOKIE_OPTIONS } from '../constants';

/**
 * Store authentication tokens in cookies
 * Called after successful login or register
 */
export function setAuthTokens(accessToken: string, refreshToken: string, accessTokenExpiresAt: string) {
    // Calculate expiry for access token cookie
    const accessExpiry = new Date(accessTokenExpiresAt);

    // Set access token cookie with expiry
    Cookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
        ...COOKIE_OPTIONS,
        expires: accessExpiry,
    });

    // Set refresh token cookie (30 days expiry - adjust based on your backend)
    Cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
        ...COOKIE_OPTIONS,
        expires: 30, // 30 days
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