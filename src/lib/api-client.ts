import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl, API_CONFIG, COOKIE_NAMES, HTTP_STATUS, API_ROUTES } from './constants';
import { ApiResponse, ApiError, PaginatedResponse } from './types';
import Cookies from 'js-cookie';

/**
 * Custom Axios config interface with retry flags
 */
interface CustomAxiosConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;           // Tracks if request has been retried
    _skipAuthRetry?: boolean;   // Flag to skip automatic token refresh retry
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

/**
 * Create axios instance with base configuration
 */
const axiosInstance: AxiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor - Add auth token to requests
 */
axiosInstance.interceptors.request.use(
    (config) => {
        // Get access token from cookies
        const token = Cookies.get(COOKIE_NAMES.ACCESS_TOKEN);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle backend ApiResponse format and errors
 */
axiosInstance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
        // Check if backend returned success: false in a 200 response
        if (response.data && response.data.success === false && response.data.error) {
            const apiError = new ApiError(response.data.error, response.data.message);
            return Promise.reject(apiError);
        }

        return response;
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalRequest = error.config as CustomAxiosConfig;

        // Check if response has backend ApiResponse format
        if (error.response?.data && typeof error.response.data === 'object') {
            const data = error.response.data;

            // If backend returned structured error
            if (data.success === false && data.error) {
                const apiError = new ApiError(data.error, data.message);

                // ========== SAFEGUARD 1: Prevent infinite loop on refresh failures ==========
                // If the refresh endpoint itself fails, don't try to refresh again
                if (originalRequest.url?.includes('/auth/refresh')) {
                    clearAuthAndRedirect();
                    return Promise.reject(apiError);
                }

                // ========== SAFEGUARD 2: Check for skip retry flag ==========
                // Allow individual requests to opt-out of automatic token refresh
                // This is used for auth endpoints where 401 is expected (wrong credentials)
                if (originalRequest._skipAuthRetry) {
                    return Promise.reject(apiError);
                }

                // ========== Handle 401 on protected endpoints - Try to refresh token ==========
                if (apiError.statusCode === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
                    // If already refreshing, queue this request
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        }).then(() => {
                            return axiosInstance(originalRequest);
                        }).catch(err => {
                            return Promise.reject(err);
                        });
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    const refreshToken = Cookies.get(COOKIE_NAMES.REFRESH_TOKEN);

                    // No refresh token available - clear auth and redirect
                    if (!refreshToken) {
                        isRefreshing = false;
                        processQueue(apiError, null);
                        clearAuthAndRedirect();
                        return Promise.reject(apiError);
                    }

                    try {
                        // Call refresh endpoint
                        const response = await axios.post<ApiResponse<{
                            tokens: {
                                access_token: {
                                    token: string;
                                    expires_at: string;
                                };
                                refresh_token: {
                                    token: string;
                                };
                            };
                        }>>(
                            `${getApiBaseUrl()}${API_ROUTES.AUTH.REFRESH}`,
                            { refresh_token: refreshToken }
                        );

                        if (response.data.success && response.data.value) {
                            const { access_token, refresh_token } = response.data.value.tokens;

                            // Update cookies with new tokens
                            const accessExpiry = new Date(access_token.expires_at);
                            Cookies.set(COOKIE_NAMES.ACCESS_TOKEN, access_token.token, {
                                expires: accessExpiry,
                                path: '/',
                                sameSite: 'lax',
                                secure: process.env.NODE_ENV === 'production',
                            });

                            Cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refresh_token.token, {
                                expires: 30,
                                path: '/',
                                sameSite: 'lax',
                                secure: process.env.NODE_ENV === 'production',
                            });

                            // Update authorization header
                            originalRequest.headers.Authorization = `Bearer ${access_token.token}`;

                            isRefreshing = false;
                            processQueue(null, access_token.token);

                            // Retry original request with new token
                            return axiosInstance(originalRequest);
                        } else {
                            throw new Error('Token refresh failed');
                        }
                    } catch (refreshError) {
                        // Refresh failed - clear auth and redirect
                        isRefreshing = false;
                        processQueue(refreshError, null);
                        clearAuthAndRedirect();
                        return Promise.reject(apiError);
                    }
                }

                return Promise.reject(apiError);
            }
        }

        // Handle network errors (no response from server)
        if (!error.response) {
            const networkError = new ApiError(
                {
                    title: 'Network Error',
                    code: 'NETWORK_ERROR',
                    status: 0,
                    details: ['Unable to connect to the server. Please check your internet connection.'],
                },
                'Network error occurred'
            );
            return Promise.reject(networkError);
        }

        // Handle other HTTP errors without ApiResponse format
        const statusCode = error.response?.status || 500;
        const genericError = new ApiError(
            {
                title: 'Request Failed',
                code: 'REQUEST_FAILED',
                status: statusCode,
                details: [error.message],
            },
            `Request failed with status ${statusCode}`
        );

        return Promise.reject(genericError);
    }
);

/**
 * Clear auth cookies and redirect to login
 */
function clearAuthAndRedirect() {
    if (typeof window !== 'undefined') {
        Cookies.remove(COOKIE_NAMES.ACCESS_TOKEN);
        Cookies.remove(COOKIE_NAMES.REFRESH_TOKEN);
        window.location.href = '/login';
    }
}

/**
 * API Client with typed methods
 * Automatically unwraps ApiResponse<T> to return T
 */
class ApiClient {
    /**
     * GET request - Returns the value from ApiResponse
     */
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await axiosInstance.get<ApiResponse<T>>(url, config);
        return response.data.value as T;
    }

    /**
     * GET paginated request - Returns items with pagination metadata
     * Use this for endpoints that return PaginatedResponse
     */
    async getPaginated<T>(url: string, config?: AxiosRequestConfig): Promise<{
        items: T[];
        pagination: {
            page: number;
            page_size: number;
            total: number;
            total_pages: number;
        };
    }> {
        const response = await axiosInstance.get<PaginatedResponse<T>>(url, config);

        return {
            items: response.data.value || [],
            pagination: response.data.pagination || {
                page: 1,
                page_size: 20,
                total: 0,
                total_pages: 0,
            },
        };
    }

    /**
     * POST request - Returns the value from ApiResponse
     */
    async post<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
        return response.data.value as T;
    }

    /**
     * PUT request - Returns the value from ApiResponse
     */
    async put<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
        return response.data.value as T;
    }

    /**
     * PATCH request - Returns the value from ApiResponse
     */
    async patch<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
        return response.data.value as T;
    }

    /**
     * DELETE request - Returns the value from ApiResponse
     */
    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
        return response.data.value as T;
    }

    /**
     * GET request - Returns full ApiResponse (useful when you need message or metadata)
     */
    async getFullResponse<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await axiosInstance.get<ApiResponse<T>>(url, config);
        return response.data;
    }

    /**
     * POST request - Returns full ApiResponse
     */
    async postFullResponse<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
        return response.data;
    }

    /**
     * Get raw axios instance for advanced use cases
     */
    get instance(): AxiosInstance {
        return axiosInstance;
    }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export axios instance for direct access if needed
export { axiosInstance };