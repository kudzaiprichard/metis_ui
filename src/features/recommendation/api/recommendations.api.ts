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
} from './recommendations.types';

/**
 * Recommendations API object with all prediction methods
 */
export const recommendationsApi = {
    /**
     * Generate a new prediction for a patient
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
     * Get predictions for a specific patient with pagination
     * GET /recommendation?patient_id=:patientId&page=:page&per_page=:perPage
     */
    getByPatient: async (
        patientId: string,
        page: number = 1,
        perPage: number = 20
    ): Promise<PredictionsListResponse> => {
        const params: ListPredictionsParams = {
            patient_id: patientId,
            page,
            per_page: perPage,
        };

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
     * List all predictions with pagination and optional filters
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
     * Delete a prediction
     * DELETE /recommendation/:id
     */
    delete: (predictionId: string): Promise<{ deleted: boolean; prediction_id: string }> => {
        return apiClient.delete<{ deleted: boolean; prediction_id: string }>(
            API_ROUTES.RECOMMENDATION.BY_ID(predictionId)
        );
    },
};