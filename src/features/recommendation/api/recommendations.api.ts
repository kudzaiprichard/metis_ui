/**
 * Predictions API — spec §5 "Module: Predictions".
 *
 * Four endpoints:
 *   POST   /predictions                      — create stored prediction
 *   GET    /predictions/{id}                 — fetch stored prediction
 *   PATCH  /predictions/{id}/decision        — record doctor decision
 *   GET    /predictions/patient/{patient_id} — paginated patient history
 *
 * Spec-defined error codes to watch (check `apiError.code`):
 *   POST: RECORD_NOT_FOUND (404), RECORD_PATIENT_MISMATCH (400)
 *   GET(id): PREDICTION_NOT_FOUND (404)
 *   PATCH: PREDICTION_NOT_FOUND (404), TREATMENT_REQUIRED (400)
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    CreatePredictionRequest,
    DoctorDecisionRequest,
    ListPredictionsByPatientParams,
    PredictionResponse,
    PredictionsByPatientResult,
} from './recommendations.types';

export const predictionsApi = {
    /**
     * Create a stored prediction from an existing medical record.
     * POST /predictions — spec returns 201 with PredictionResponse.
     */
    create: (data: CreatePredictionRequest): Promise<PredictionResponse> => {
        return apiClient.post<PredictionResponse, CreatePredictionRequest>(
            API_ROUTES.PREDICTIONS.BASE,
            data,
        );
    },

    /**
     * Fetch a stored prediction by id.
     * GET /predictions/{id}
     */
    getById: (predictionId: string): Promise<PredictionResponse> => {
        return apiClient.get<PredictionResponse>(
            API_ROUTES.PREDICTIONS.BY_ID(predictionId),
        );
    },

    /**
     * Record the doctor's decision on a stored prediction.
     * PATCH /predictions/{id}/decision — spec says this can be set once or
     * updated; response is the refreshed PredictionResponse.
     *
     * The server enforces the conditional rule "when decision = OVERRIDDEN,
     * final_treatment is required"; callers should validate the same rule
     * client-side to avoid a round-trip for an obviously-invalid request.
     */
    recordDecision: (
        predictionId: string,
        data: DoctorDecisionRequest,
    ): Promise<PredictionResponse> => {
        return apiClient.patch<PredictionResponse, DoctorDecisionRequest>(
            API_ROUTES.PREDICTIONS.DECISION(predictionId),
            data,
        );
    },

    /**
     * Paginated prediction history for a patient.
     * GET /predictions/patient/{patient_id}
     *
     * Pagination params ride on the query string as `page` / `pageSize`
     * (spec §3.2 — camelCase). The api-client's paginated envelope reader
     * already tolerates either casing in the response; we normalise to
     * camelCase here so consumers have one shape to rely on.
     */
    listByPatient: async (
        patientId: string,
        params?: ListPredictionsByPatientParams,
    ): Promise<PredictionsByPatientResult> => {
        const { items, pagination: rawPagination } =
            await apiClient.getPaginated<PredictionResponse>(
                API_ROUTES.PREDICTIONS.BY_PATIENT(patientId),
                { params },
            );

        const p = rawPagination as unknown as Partial<{
            page: number;
            pageSize: number;
            page_size: number;
            total: number;
            totalPages: number;
            total_pages: number;
        }>;

        return {
            predictions: items,
            pagination: {
                page: p.page ?? 1,
                pageSize: p.pageSize ?? p.page_size ?? 20,
                total: p.total ?? 0,
                totalPages: p.totalPages ?? p.total_pages ?? 0,
            },
        };
    },
};
