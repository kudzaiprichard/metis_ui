/**
 * Recommendations/Predictions API
 * Handles prediction and recommendation API calls
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    GeneratePredictionRequest,
    ListPredictionsParams,
    Prediction,
    PredictionDetail,
    PredictionsListResponse,
    DeletePredictionResponse,
} from './recommendations.types';

/**
 * Recommendations API object with all prediction methods
 */
export const recommendationsApi = {
    /**
     * Generate a new prediction for a medical data snapshot
     * POST /recommendation/generate
     */
    generate: (data: GeneratePredictionRequest): Promise<PredictionDetail> => {
        return apiClient.post<PredictionDetail, GeneratePredictionRequest>(
            API_ROUTES.RECOMMENDATION.GENERATE,
            data
        );
    },

    /**
     * Get prediction by ID with full details
     * GET /recommendation/:id
     */
    getById: (predictionId: string): Promise<PredictionDetail> => {
        return apiClient.get<PredictionDetail>(
            API_ROUTES.RECOMMENDATION.BY_ID(predictionId)
        );
    },

    /**
     * List all predictions with pagination and optional patient filter
     * GET /recommendation?page=:page&per_page=:perPage&patient_id=:patientId
     */
    list: async (params?: ListPredictionsParams): Promise<PredictionsListResponse> => {
        const { items, pagination } = await apiClient.getPaginated<Prediction>(
            API_ROUTES.RECOMMENDATION.BASE,
            { params }
        );

        return {
            predictions: items,
            pagination,
        };
    },

    /**
     * Delete a prediction (soft delete)
     * DELETE /recommendation/:id
     */
    delete: (predictionId: string): Promise<DeletePredictionResponse> => {
        return apiClient.delete<DeletePredictionResponse>(
            API_ROUTES.RECOMMENDATION.BY_ID(predictionId)
        );
    },
};