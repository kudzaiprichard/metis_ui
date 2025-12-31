import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

// Default options for React Query
const defaultOptions: DefaultOptions = {
    queries: {
        // Stale time: How long data is considered fresh (5 minutes)
        staleTime: 5 * 60 * 1000,

        // Cache time: How long inactive data stays in cache (10 minutes)
        gcTime: 10 * 60 * 1000,

        // Retry failed requests (3 times with exponential backoff)
        retry: (failureCount, error) => {
            const axiosError = error as AxiosError;

            // Don't retry on 4xx errors (client errors)
            if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
                return false;
            }

            // Retry up to 3 times for network errors and 5xx errors
            return failureCount < 3;
        },

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus (can be disabled per query)
        refetchOnWindowFocus: false,

        // Refetch on reconnect
        refetchOnReconnect: true,

        // Refetch on mount
        refetchOnMount: true,
    },
    mutations: {
        // Retry mutations once on failure
        retry: 1,

        // Retry delay for mutations
        retryDelay: 1000,
    },
};

// Create query client instance
export const queryClient = new QueryClient({
    defaultOptions,
});

// Type for query parameters (can be extended based on your needs)
interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    [key: string]: string | number | boolean | undefined;
}

// Query keys factory for consistent naming
export const queryKeys = {
    auth: {
        me: ['auth', 'me'] as const,
    },
    patients: {
        all: (params?: QueryParams) => ['patients', params] as const,
        byId: (id: string) => ['patients', id] as const,
    },
    predictions: {
        all: (params?: QueryParams) => ['predictions', params] as const,
        byId: (id: string) => ['predictions', id] as const,
    },
    monitoring: {
        all: (params?: QueryParams) => ['monitoring', params] as const,
        byId: (id: string) => ['monitoring', id] as const,
    },
    models: {
        all: (params?: QueryParams) => ['models', params] as const,
        byId: (id: string) => ['models', id] as const,
    },
    similarPatients: {
        byPatientId: (patientId: string) => ['similar-patients', patientId] as const,
    },
} as const;