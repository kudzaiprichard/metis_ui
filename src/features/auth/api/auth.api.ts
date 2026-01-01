/**
 * Auth API
 * Handles authentication-related API calls
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User,
    RefreshTokenRequest,
    RefreshTokenResponse,
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
            { _skipAuthRetry: true } as any  // Skip auto-retry for login endpoint
        );
    },

    /**
     * Register new user
     * POST /auth/register
     * Note: _skipAuthRetry flag prevents automatic token refresh on 401
     * (401 here means validation error, not expired token)
     */
    register: (data: RegisterRequest): Promise<AuthResponse> => {
        return apiClient.post<AuthResponse, RegisterRequest>(
            API_ROUTES.AUTH.REGISTER,
            data,
            { _skipAuthRetry: true } as any  // Skip auto-retry for register endpoint
        );
    },

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