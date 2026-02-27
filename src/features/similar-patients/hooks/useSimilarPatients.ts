/**
 * Similar Patients Hooks
 * React Query hooks for similar patient search
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { similarPatientsApi } from '../api/similar-patients.api';
import {
    FindSimilarPatientsRequest,
    FindSimilarPatientsGraphRequest,
} from '../api/similar-patients.types';
import { ApiError } from '@/src/lib/types';

/**
 * Query keys for similar patients
 */
const similarPatientsKeys = {
    all: ['similar-patients'] as const,
    searches: () => [...similarPatientsKeys.all, 'search'] as const,
    search: (params: FindSimilarPatientsRequest) => [...similarPatientsKeys.searches(), params] as const,
    graphSearches: () => [...similarPatientsKeys.all, 'graph-search'] as const,
    graphSearch: (params: FindSimilarPatientsGraphRequest) => [...similarPatientsKeys.graphSearches(), params] as const,
    details: () => [...similarPatientsKeys.all, 'detail'] as const,
    detail: (caseId: string) => [...similarPatientsKeys.details(), caseId] as const,
};

/**
 * Hook to search for similar patients (tabular format)
 * Uses mutation since it's a POST request with search criteria
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
 * Hook to search for similar patients (graph format)
 * Uses mutation since it's a POST request with search criteria
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
        enabled: !!caseId, // Only fetch if caseId exists
    });
};