/**
 * Auth API
 * Handles authentication-related API calls
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    LoginRequest,
    AuthResponse,
    User,
    RefreshTokenRequest,
    RefreshTokenResponse,
    UpdateProfileRequest,
} from './auth.types';

/**
 * Auth API object with all authentication methods
 */
export const authApi = {
    /**
     * Login user
     * POST /auth/login
     * Note: _skipAuthRetry flag prevents automatic token refresh on 401
     * (401 here means wrong credentials, not expired token)
     */
    login: (credentials: LoginRequest): Promise<AuthResponse> => {
        return apiClient.post<AuthResponse, LoginRequest>(
            API_ROUTES.AUTH.LOGIN,
            credentials,
            { _skipAuthRetry: true }  // Skip auto-retry for login endpoint
        );
    },

    // `register` is intentionally absent — self-registration was removed.
    // Account creation lives behind the admin user-management screen
    // (`useCreateUser` in src/features/users), which calls POST /users.

    /**
     * Logout user
     * POST /auth/logout
     */
    logout: (): Promise<void> => {
        return apiClient.post<void>(API_ROUTES.AUTH.LOGOUT);
    },

    /**
     * Get current authenticated user
     * GET /auth/me
     */
    getMe: (): Promise<User> => {
        return apiClient.get<User>(API_ROUTES.AUTH.ME);
    },

    /**
     * Update current authenticated user's profile
     * PATCH /auth/me — spec §2.8
     */
    updateMe: (data: UpdateProfileRequest): Promise<User> => {
        return apiClient.patch<User, UpdateProfileRequest>(API_ROUTES.AUTH.ME, data);
    },

    /**
     * Refresh access token
     * POST /auth/refresh
     */
    refreshToken: (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
        return apiClient.post<RefreshTokenResponse, RefreshTokenRequest>(
            API_ROUTES.AUTH.REFRESH,
            data
        );
    },
};