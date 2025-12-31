/**
 * Auth API
 * Handles authentication-related API calls
 */

import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/constants';
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
     */
    login: (credentials: LoginRequest): Promise<AuthResponse> => {
        return apiClient.post<AuthResponse, LoginRequest>(
            API_ROUTES.AUTH.LOGIN,
            credentials
        );
    },

    /**
     * Register new user
     * POST /auth/register
     */
    register: (data: RegisterRequest): Promise<AuthResponse> => {
        return apiClient.post<AuthResponse, RegisterRequest>(
            API_ROUTES.AUTH.REGISTER,
            data
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