import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl, API_CONFIG, COOKIE_NAMES, HTTP_STATUS, API_ROUTES } from './constants';
import { ApiResponse, ApiError, PaginatedResponse } from './types';
import Cookies from 'js-cookie';

/**
 * Custom Axios config interface with retry flags
 */
interface CustomAxiosConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRetry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

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

const axiosInstance: AxiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
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

axiosInstance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
        // ===== DEBUG: Log every successful response =====
        console.log('[API] Response received:', {
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            data: response.data,
        });

        if (response.data && response.data.success === false && response.data.error) {
            // ===== DEBUG: Backend returned success:false in 200 =====
            console.log('[API] Backend returned success:false in 200 response:', {
                url: response.config.url,
                error: response.data.error,
                message: response.data.message,
            });

            const apiError = new ApiError(response.data.error, response.data.message);
            return Promise.reject(apiError);
        }

        return response;
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalRequest = error.config as CustomAxiosConfig;

        // ===== DEBUG: Log every error response =====
        console.log('[API] Error intercepted:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            responseData: error.response?.data,
            message: error.message,
        });

        if (error.response?.data && typeof error.response.data === 'object') {
            const data = error.response.data;

            if (data.success === false && data.error) {
                const apiError = new ApiError(data.error, data.message);

                // ===== DEBUG: Structured backend error =====
                console.log('[API] Structured backend error:', {
                    url: originalRequest?.url,
                    statusCode: apiError.statusCode,
                    errorData: data.error,
                    message: data.message,
                });

                if (originalRequest.url?.includes('/auth/refresh')) {
                    clearAuthAndRedirect();
                    return Promise.reject(apiError);
                }

                if (originalRequest._skipAuthRetry) {
                    return Promise.reject(apiError);
                }

                if (apiError.statusCode === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
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

                    if (!refreshToken) {
                        isRefreshing = false;
                        processQueue(apiError, null);
                        clearAuthAndRedirect();
                        return Promise.reject(apiError);
                    }

                    try {
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

                            originalRequest.headers.Authorization = `Bearer ${access_token.token}`;

                            isRefreshing = false;
                            processQueue(null, access_token.token);

                            return axiosInstance(originalRequest);
                        } else {
                            throw new Error('Token refresh failed');
                        }
                    } catch (refreshError) {
                        isRefreshing = false;
                        processQueue(refreshError, null);
                        clearAuthAndRedirect();
                        return Promise.reject(apiError);
                    }
                }

                return Promise.reject(apiError);
            }
        }

        if (!error.response) {
            // ===== DEBUG: Network error (no response) =====
            console.log('[API] Network error - no response received:', {
                url: originalRequest?.url,
                message: error.message,
            });

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

        // ===== DEBUG: Unhandled HTTP error =====
        const statusCode = error.response?.status || 500;
        console.log('[API] Unhandled HTTP error:', {
            url: originalRequest?.url,
            statusCode,
            responseData: error.response?.data,
            message: error.message,
        });

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

function clearAuthAndRedirect() {
    if (typeof window !== 'undefined') {
        Cookies.remove(COOKIE_NAMES.ACCESS_TOKEN);
        Cookies.remove(COOKIE_NAMES.REFRESH_TOKEN);
        window.location.href = '/login';
    }
}

class ApiClient {
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        // ===== DEBUG: Log every GET call and what value is extracted =====
        console.log('[ApiClient] GET', url);
        const response = await axiosInstance.get<ApiResponse<T>>(url, config);
        console.log('[ApiClient] GET result value:', url, response.data.value);
        return response.data.value as T;
    }

    async getPaginated<T>(url: string, config?: AxiosRequestConfig): Promise<{
        items: T[];
        pagination: {
            page: number;
            page_size: number;
            total: number;
            total_pages: number;
        };
    }> {
        console.log('[ApiClient] GET paginated', url);
        const response = await axiosInstance.get<PaginatedResponse<T>>(url, config);
        console.log('[ApiClient] GET paginated result:', url, response.data);

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

    async post<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<T> {
        console.log('[ApiClient] POST', url, 'payload:', data);
        const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
        console.log('[ApiClient] POST result value:', url, response.data.value);
        return response.data.value as T;
    }

    async put<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<T> {
        console.log('[ApiClient] PUT', url, 'payload:', data);
        const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
        console.log('[ApiClient] PUT result value:', url, response.data.value);
        return response.data.value as T;
    }

    async patch<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<T> {
        console.log('[ApiClient] PATCH', url, 'payload:', data);
        const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
        console.log('[ApiClient] PATCH result value:', url, response.data.value);
        return response.data.value as T;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        console.log('[ApiClient] DELETE', url);
        const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
        console.log('[ApiClient] DELETE result value:', url, response.data.value);
        return response.data.value as T;
    }

    async getFullResponse<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        const response = await axiosInstance.get<ApiResponse<T>>(url, config);
        return response.data;
    }

    async postFullResponse<T, D = unknown>(
        url: string,
        data?: D,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
        return response.data;
    }

    get instance(): AxiosInstance {
        return axiosInstance;
    }
}

export const apiClient = new ApiClient();
export { axiosInstance };