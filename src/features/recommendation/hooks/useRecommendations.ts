/**
 * Predictions Hooks — spec §5 "Module: Predictions".
 *
 * Four endpoints, exposed here as two queries + two mutations. The file is
 * still named `useRecommendations.ts` for legacy reasons; the module's
 * authoritative name is "Predictions" and every exported symbol uses that
 * naming.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { predictionsApi } from '../api/recommendations.api';
import {
    CreatePredictionRequest,
    DoctorDecisionRequest,
    ListPredictionsByPatientParams,
    PredictionResponse,
    PredictionsByPatientResult,
} from '../api/recommendations.types';
import { patientsKeys } from '../../patients/hooks/usePatients';
import { ApiError } from '@/src/lib/types';

export const predictionsKeys = {
    all: ['predictions'] as const,
    details: () => [...predictionsKeys.all, 'detail'] as const,
    detail: (id: string) => [...predictionsKeys.details(), id] as const,
    patientHistories: () => [...predictionsKeys.all, 'patient'] as const,
    patientHistory: (patientId: string, params?: ListPredictionsByPatientParams) =>
        [...predictionsKeys.patientHistories(), patientId, params] as const,
};

// =========================================================================
// QUERIES
// =========================================================================

/**
 * Fetch a single stored prediction by id.
 * GET /predictions/{id} — surface PREDICTION_NOT_FOUND (404) via error.
 */
export const usePrediction = (predictionId: string) => {
    return useQuery<PredictionResponse, ApiError>({
        queryKey: predictionsKeys.detail(predictionId),
        queryFn: () => predictionsApi.getById(predictionId),
        staleTime: 5 * 60 * 1000,
        enabled: !!predictionId,
    });
};

/**
 * Paginated prediction history for a patient.
 * GET /predictions/patient/{patient_id}
 */
export const usePatientPredictions = (
    patientId: string,
    params?: ListPredictionsByPatientParams,
) => {
    return useQuery<PredictionsByPatientResult, ApiError>({
        queryKey: predictionsKeys.patientHistory(patientId, params),
        queryFn: () => predictionsApi.listByPatient(patientId, params),
        staleTime: 3 * 60 * 1000,
        enabled: !!patientId,
    });
};

// =========================================================================
// MUTATIONS
// =========================================================================

/**
 * Create a stored prediction from an existing medical record.
 * POST /predictions — error codes: RECORD_NOT_FOUND (404),
 * RECORD_PATIENT_MISMATCH (400).
 *
 * On success we seed the detail cache with the new record and invalidate
 * the patient's prediction history + patient detail (the record's
 * `predictions` relation is likely stale).
 */
export const useCreatePrediction = () => {
    const queryClient = useQueryClient();

    return useMutation<PredictionResponse, ApiError, CreatePredictionRequest>({
        mutationFn: (data) => predictionsApi.create(data),
        onSuccess: (prediction) => {
            queryClient.setQueryData(predictionsKeys.detail(prediction.id), prediction);
            queryClient.invalidateQueries({
                queryKey: [...predictionsKeys.patientHistories(), prediction.patientId],
            });
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(prediction.patientId) });
        },
        onError: (error) => {
            console.error('Create prediction failed:', error.getFullMessage());
        },
    });
};

/**
 * Record the doctor's final decision on a stored prediction.
 * PATCH /predictions/{id}/decision — error codes: PREDICTION_NOT_FOUND (404),
 * TREATMENT_REQUIRED (400) when decision=OVERRIDDEN without final_treatment.
 *
 * Invalidates the detail cache and any patient-history list that might
 * contain this prediction.
 */
export const useRecordDecision = () => {
    const queryClient = useQueryClient();

    return useMutation<
        PredictionResponse,
        ApiError,
        { predictionId: string; data: DoctorDecisionRequest }
    >({
        mutationFn: ({ predictionId, data }) =>
            predictionsApi.recordDecision(predictionId, data),
        onSuccess: (prediction) => {
            queryClient.setQueryData(predictionsKeys.detail(prediction.id), prediction);
            queryClient.invalidateQueries({
                queryKey: [...predictionsKeys.patientHistories(), prediction.patientId],
            });
        },
        onError: (error) => {
            console.error('Record decision failed:', error.getFullMessage());
        },
    });
};

// Legacy stub — prediction delete is not in the backend spec.
export const useDeleteRecommendation = () =>
    useMutation({
        mutationFn: async (_id: string) => {
            throw new Error('Deleting predictions is not supported');
        },
    });

// Legacy alias used by list components — wraps usePatientPredictions with the old param shape.
export const useRecommendations = (params: {
    page?: number;
    per_page?: number;
    patient_id?: string;
}) => {
    return usePatientPredictions(params.patient_id ?? '', {
        page: params.page,
        pageSize: params.per_page,
    });
};
