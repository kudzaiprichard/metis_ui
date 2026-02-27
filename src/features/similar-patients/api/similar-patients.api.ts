/**
 * Similar Patients API
 * Handles similar patient search API calls
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    FindSimilarPatientsRequest,
    FindSimilarPatientsGraphRequest,
    SimilarPatientsResponse,
    SimilarPatientsGraphResponse,
    SimilarPatientDetail,
} from './similar-patients.types';

/**
 * Similar Patients API object with all methods
 */
export const similarPatientsApi = {
    /**
     * Find similar patients in tabular format
     * POST /similar-patients/search
     */
    search: (data: FindSimilarPatientsRequest): Promise<SimilarPatientsResponse> => {
        return apiClient.post<SimilarPatientsResponse, FindSimilarPatientsRequest>(
            API_ROUTES.SIMILAR_PATIENTS.SEARCH,
            data
        );
    },

    /**
     * Find similar patients in graph format for visualization
     * POST /similar-patients/search/graph
     */
    searchGraph: (data: FindSimilarPatientsGraphRequest): Promise<SimilarPatientsGraphResponse> => {
        return apiClient.post<SimilarPatientsGraphResponse, FindSimilarPatientsGraphRequest>(
            API_ROUTES.SIMILAR_PATIENTS.SEARCH_GRAPH,
            data
        );
    },

    /**
     * Get complete details of a similar patient case
     * GET /similar-patients/:caseId
     */
    getDetail: (caseId: string): Promise<SimilarPatientDetail> => {
        return apiClient.get<SimilarPatientDetail>(
            API_ROUTES.SIMILAR_PATIENTS.BY_CASE_ID(caseId)
        );
    },
};