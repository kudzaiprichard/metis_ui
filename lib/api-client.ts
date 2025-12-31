import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getApiBaseUrl, API_CONFIG, STORAGE_KEYS, HTTP_STATUS } from './constants';
import { ApiResponse, ApiError } from './types';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Get access token from localStorage
        const token = typeof window !== 'undefined'
            ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
            : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle backend ApiResponse format and errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
        // Check if backend returned success: false
        if (response.data && response.data.success === false && response.data.error) {
            // Backend returned an error in ApiResponse format
            const apiError = new ApiError(response.data.error, response.data.message);
            return Promise.reject(apiError);
        }

        return response;
    },
    (error: AxiosError<ApiResponse<unknown>>) => {
        // Check if response has backend ApiResponse format
        if (error.response?.data && typeof error.response.data === 'object') {
            const data = error.response.data;

            // If backend returned structured error
            if (data.success === false && data.error) {
                const apiError = new ApiError(data.error, data.message);

                // Handle 401 Unauthorized - clear tokens and redirect to login
                if (apiError.statusCode === HTTP_STATUS.UNAUTHORIZED) {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                        localStorage.removeItem(STORAGE_KEYS.USER_DATA);

                        // Redirect to login page
                        window.location.href = '/login';
                    }
                }

                return Promise.reject(apiError);
            }
        }

        // Handle network errors or other non-API errors
        if (!error.response) {
            // Network error
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

// API Client with typed methods
class ApiClient {
    /**
     * GET request - Returns the value from ApiResponse
     */
    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await axiosInstance.get<ApiResponse<T>>(url, config);
        return response.data.value as T;
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