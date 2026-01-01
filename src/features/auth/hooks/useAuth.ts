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
import { queueToast } from '@/src/lib/utils/toast-bridge';

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
        enabled: isAuthenticated(), // Only fetch if token exists
    });
};

/**
 * Hook to login user
 */
export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            const result = await authApi.login(credentials);
            return result;
        },
        onSuccess: (data: AuthResponse) => {
            // Store tokens in cookies
            setAuthTokens(
                data.tokens.access_token.token,
                data.tokens.refresh_token.token,
                data.tokens.access_token.expires_at
            );

            // Cache user data
            queryClient.setQueryData(authKeys.me, data.user);

            // Queue success toast for next page (ToastBridge will display it)
            queueToast(
                'Welcome Back!',
                `Welcome back, ${data.user.first_name}!`,
                'success'
            );

            // Redirect to dashboard or intended page
            const redirect = new URLSearchParams(window.location.search).get('redirect');
            router.push(redirect || '/dashboard');
        },
        onError: (error: ApiError) => {
            console.error('Login failed:', error.getFullMessage());
            // Note: Error toasts on same page are handled in LoginForm
            // No need to queue here since we're not navigating away
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

            // Queue welcome toast for next page
            queueToast(
                'Account Created!',
                `Welcome to the platform, ${data.user.first_name}!`,
                'success'
            );

            // Redirect to dashboard
            router.push('/dashboard');
        },
        onError: (error: ApiError) => {
            console.error('Registration failed:', error.getFullMessage());
            // Error handling in registration form (if you have one)
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

            // Queue logout toast for login page
            queueToast(
                'Logged Out',
                'You have been successfully logged out',
                'success'
            );

            // Redirect to login
            router.push('/login');
        },
        onError: (error: ApiError) => {
            // Even if logout API fails, clear local data
            clearAuthTokens();
            queryClient.clear();

            // Queue error toast
            queueToast(
                'Logout Error',
                'An error occurred, but you have been logged out',
                'error'
            );

            // Redirect to login
            router.push('/login');

            console.error('Logout error:', error.getFullMessage());
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