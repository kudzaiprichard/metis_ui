/**
 * Auth Hooks
 * React Query hooks for authentication
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/auth.api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../api/auth.types';
import { setAuthTokens, clearAuthTokens, isAuthenticated } from '@/src/lib/utils/auth';
import { ApiError } from '@/src/lib/types';

/**
 * Query keys for auth
 */
const authKeys = {
    me: ['auth', 'me'] as const,
};

/**
 * Hook to get current authenticated user
 */
export const useCurrentUser = () => {
    return useQuery({
        queryKey: authKeys.me,
        queryFn: authApi.getMe,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false, // Don't retry if unauthorized
        enabled: isAuthenticated(), //  Only fetch if token exists
    });
};

/**
 * Hook to login user
 */
export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
        onSuccess: (data: AuthResponse) => {
            // Store tokens in cookies
            setAuthTokens(
                data.tokens.access_token.token,
                data.tokens.refresh_token.token,
                data.tokens.access_token.expires_at
            );

            // Cache user data
            queryClient.setQueryData(authKeys.me, data.user);

            // Redirect to dashboard or intended page
            const redirect = new URLSearchParams(window.location.search).get('redirect');
            router.push(redirect || '/dashboard');
        },
        onError: (error: ApiError) => {
            console.error('Login failed:', error.getMessage());
        },
    });
};

/**
 * Hook to register new user
 */
export const useRegister = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
        onSuccess: (data: AuthResponse) => {
            // Store tokens in cookies
            setAuthTokens(
                data.tokens.access_token.token,
                data.tokens.refresh_token.token,
                data.tokens.access_token.expires_at
            );

            // Cache user data
            queryClient.setQueryData(authKeys.me, data.user);

            // Redirect to dashboard
            router.push('/dashboard');
        },
        onError: (error: ApiError) => {
            console.error('Registration failed:', error.getMessage());
        },
    });
};

/**
 * Hook to logout user
 */
export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            // Clear tokens from cookies
            clearAuthTokens();

            // Clear user data from cache
            queryClient.removeQueries({ queryKey: authKeys.me });

            // Clear all queries (fresh state)
            queryClient.clear();

            // Redirect to login
            router.push('/login');
        },
        onError: (error: ApiError) => {
            // Even if logout API fails, clear local data
            clearAuthTokens();
            queryClient.clear();
            router.push('/login');

            console.error('Logout error:', error.getMessage());
        },
    });
};

/**
 * Hook to check if user is authenticated
 * Returns the current user if logged in, null otherwise
 */
export const useAuth = () => {
    const { data: user, isLoading, error } = useCurrentUser();

    return {
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,
        error,
    };
};