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
import { ApiError } from '@/src/lib/types';

/**
 * Query keys for recommendations
 */
const recommendationsKeys = {
    all: ['recommendations'] as const,
    lists: () => [...recommendationsKeys.all, 'list'] as const,
    list: (params?: ListPredictionsParams) => [...recommendationsKeys.lists(), params] as const,
    details: () => [...recommendationsKeys.all, 'detail'] as const,
    detail: (id: string) => [...recommendationsKeys.details(), id] as const,
    byPatient: (patientId: string) => [...recommendationsKeys.all, 'patient', patientId] as const,
};

/**
 * Hook to list predictions with pagination and filters
 */
export const useRecommendations = (params?: ListPredictionsParams) => {
    return useQuery({
        queryKey: recommendationsKeys.list(params),
        queryFn: () => recommendationsApi.list(params),
        staleTime: 3 * 60 * 1000, // 3 minutes
    });
};

/**
 * Hook to get a single prediction by ID with full details
 */
export const useRecommendation = (predictionId: string) => {
    return useQuery({
        queryKey: recommendationsKeys.detail(predictionId),
        queryFn: () => recommendationsApi.getById(predictionId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!predictionId, // Only fetch if predictionId exists
    });
};

/**
 * Hook to get all predictions for a patient
 */
export const usePatientRecommendations = (patientId: string, limit?: number) => {
    return useQuery({
        queryKey: recommendationsKeys.byPatient(patientId),
        queryFn: () => recommendationsApi.getByPatient(patientId, limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!patientId,
    });
};

/**
 * Hook to generate a new prediction for a patient
 */
export const useGenerateRecommendation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: GeneratePredictionRequest) => recommendationsApi.generate(data),
        onSuccess: (prediction) => {
            // Invalidate predictions list to refetch with new prediction
            queryClient.invalidateQueries({ queryKey: recommendationsKeys.lists() });

            // Invalidate patient predictions cache
            queryClient.invalidateQueries({ queryKey: recommendationsKeys.byPatient(prediction.patient_id) });

            // Set the new prediction in cache
            queryClient.setQueryData(recommendationsKeys.detail(prediction.id), prediction);
        },
        onError: (error: ApiError) => {
            console.error('Generate prediction failed:', error.getFullMessage());
        },
    });
};