/**
 * Similar Patients Hooks
 * React Query hooks for similar patient search
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { similarPatientsApi } from '../api/similar-patients.api';
import {
    FindSimilarPatientsRequest,
    FindSimilarPatientsGraphRequest,
    SimilarPatientsResponse,
    SimilarPatientsGraphResponse,
} from '../api/similar-patients.types';
import { ApiError } from '@/src/lib/types';

/**
 * Query keys for similar patients
 */
export const similarPatientsKeys = {
    all: ['similar-patients'] as const,
    searches: () => [...similarPatientsKeys.all, 'search'] as const,
    search: (params: FindSimilarPatientsRequest) => [...similarPatientsKeys.searches(), params] as const,
    graphSearches: () => [...similarPatientsKeys.all, 'graph-search'] as const,
    graphSearch: (params: FindSimilarPatientsGraphRequest) => [...similarPatientsKeys.graphSearches(), params] as const,
    details: () => [...similarPatientsKeys.all, 'detail'] as const,
    detail: (caseId: string) => [...similarPatientsKeys.details(), caseId] as const,
};

/**
 * Hook to auto-search similar patients on mount (tabular format).
 * Enabled only when params contain at least one ID.
 */
export const useAutoSearchSimilarPatients = (params: FindSimilarPatientsRequest) => {
    const enabled = !!(params.patient_id || params.medical_data_id);

    return useQuery<SimilarPatientsResponse, ApiError>({
        queryKey: similarPatientsKeys.search(params),
        queryFn: () => similarPatientsApi.search(params),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
};

/**
 * Hook to auto-search similar patients on mount (graph format).
 * Enabled only when params contain at least one ID.
 */
export const useAutoSearchSimilarPatientsGraph = (params: FindSimilarPatientsGraphRequest) => {
    const enabled = !!(params.patient_id || params.medical_data_id);

    return useQuery<SimilarPatientsGraphResponse, ApiError>({
        queryKey: similarPatientsKeys.graphSearch(params),
        queryFn: () => similarPatientsApi.searchGraph(params),
        enabled,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};

/**
 * Hook to manually search for similar patients (tabular format)
 * Uses mutation since it's a user-initiated POST request
 */
export const useSearchSimilarPatients = () => {
    return useMutation({
        mutationFn: (data: FindSimilarPatientsRequest) => similarPatientsApi.search(data),
        onError: (error: ApiError) => {
            console.error('Search similar patients failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to manually search for similar patients (graph format)
 * Uses mutation since it's a user-initiated POST request
 */
export const useSearchSimilarPatientsGraph = () => {
    return useMutation({
        mutationFn: (data: FindSimilarPatientsGraphRequest) => similarPatientsApi.searchGraph(data),
        onError: (error: ApiError) => {
            console.error('Search similar patients graph failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to get similar patient case detail
 */
export const useSimilarPatientDetail = (caseId: string) => {
    return useQuery({
        queryKey: similarPatientsKeys.detail(caseId),
        queryFn: () => similarPatientsApi.getDetail(caseId),
        enabled: !!caseId,
    });
};