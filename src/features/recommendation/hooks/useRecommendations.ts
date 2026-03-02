/**
 * Recommendations Hooks
 * React Query hooks for predictions and recommendations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recommendationsApi } from '../api/recommendations.api';
import {
    GeneratePredictionRequest,
    ListPredictionsParams,
} from '../api/recommendations.types';
import { patientsKeys } from '../../patients/hooks/usePatients';
import { ApiError } from '@/src/lib/types';

/**
 * Query keys for recommendations
 */
export const recommendationsKeys = {
    all: ['recommendations'] as const,
    lists: () => [...recommendationsKeys.all, 'list'] as const,
    list: (params?: ListPredictionsParams) => [...recommendationsKeys.lists(), params] as const,
    details: () => [...recommendationsKeys.all, 'detail'] as const,
    detail: (id: string) => [...recommendationsKeys.details(), id] as const,
};

// =========================================================================
// QUERIES
// =========================================================================

/**
 * Hook to list predictions with pagination and optional patient filter
 */
export const useRecommendations = (params?: ListPredictionsParams) => {
    return useQuery({
        queryKey: recommendationsKeys.list(params),
        queryFn: () => recommendationsApi.list(params),
        staleTime: 3 * 60 * 1000,
    });
};

/**
 * Hook to get a single prediction by ID with full details
 */
export const useRecommendation = (predictionId: string) => {
    return useQuery({
        queryKey: recommendationsKeys.detail(predictionId),
        queryFn: () => recommendationsApi.getById(predictionId),
        staleTime: 5 * 60 * 1000,
        enabled: !!predictionId,
    });
};

/**
 * Hook to get predictions for a specific patient (uses list with patient_id filter)
 */
export const usePatientRecommendations = (
    patientId: string,
    page: number = 1,
    perPage: number = 20
) => {
    const params: ListPredictionsParams = {
        patient_id: patientId,
        page,
        per_page: perPage,
    };

    return useQuery({
        queryKey: recommendationsKeys.list(params),
        queryFn: () => recommendationsApi.list(params),
        staleTime: 5 * 60 * 1000,
        enabled: !!patientId,
    });
};

// =========================================================================
// MUTATIONS
// =========================================================================

/**
 * Hook to generate a new prediction for a medical data snapshot
 */
export const useGenerateRecommendation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: GeneratePredictionRequest) => recommendationsApi.generate(data),
        onSuccess: (prediction) => {
            queryClient.invalidateQueries({ queryKey: recommendationsKeys.lists() });
            queryClient.setQueryData(recommendationsKeys.detail(prediction.id), prediction);

            const patientId = prediction.patient.id;
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(patientId) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.medicalRecords(patientId) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.latestMedicalData(patientId) });
        },
        onError: (error: ApiError) => {
            console.error('Generate prediction failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to delete a prediction (soft delete)
 */
export const useDeleteRecommendation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (predictionId: string) => recommendationsApi.delete(predictionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: recommendationsKeys.lists() });
        },
        onError: (error: ApiError) => {
            console.error('Delete prediction failed:', error.getFullMessage());
        },
    });
};