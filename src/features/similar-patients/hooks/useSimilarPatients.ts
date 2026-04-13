/**
 * Similar Patients Hooks
 * React Query hooks for similar patient search
 */

import { useQuery } from '@tanstack/react-query';
import { similarPatientsApi, SimilarPatientsSearchPagination } from '../api/similar-patients.api';
import {
    FindSimilarPatientsRequest,
    FindSimilarPatientsGraphRequest,
    SimilarPatientsSearchResult,
    SimilarPatientsGraphResponse,
} from '../api/similar-patients.types';
import { ApiError } from '@/src/lib/types';

export const similarPatientsKeys = {
    all: ['similar-patients'] as const,
    searches: () => [...similarPatientsKeys.all, 'search'] as const,
    search: (params: FindSimilarPatientsRequest, pagination?: SimilarPatientsSearchPagination) =>
        [...similarPatientsKeys.searches(), params, pagination] as const,
    graphSearches: () => [...similarPatientsKeys.all, 'graph-search'] as const,
    graphSearch: (params: FindSimilarPatientsGraphRequest) =>
        [...similarPatientsKeys.graphSearches(), params] as const,
    details: () => [...similarPatientsKeys.all, 'detail'] as const,
    detail: (caseId: string) => [...similarPatientsKeys.details(), caseId] as const,
};

/**
 * Hook to search similar patients (graph format).
 * Enabled only when params contain at least one ID.
 */
export const useAutoSearchSimilarPatientsGraph = (params: FindSimilarPatientsGraphRequest) => {
    const enabled = !!(params.patient_id || params.medical_record_id);

    return useQuery<SimilarPatientsGraphResponse, ApiError>({
        queryKey: similarPatientsKeys.graphSearch(params),
        queryFn: () => similarPatientsApi.searchGraph(params),
        enabled,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
};

/**
 * Hook to search similar patients (tabular format).
 * Enabled only when params contain at least one ID. Re-fetches on page or
 * pageSize change to drive the paginated results UI.
 */
export const useAutoSearchSimilarPatients = (
    params: FindSimilarPatientsRequest,
    pagination?: SimilarPatientsSearchPagination
) => {
    const enabled = !!(params.patient_id || params.medical_record_id);

    return useQuery<SimilarPatientsSearchResult, ApiError>({
        queryKey: similarPatientsKeys.search(params, pagination),
        queryFn: () => similarPatientsApi.search(params, pagination),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
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
