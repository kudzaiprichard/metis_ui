/**
 * Inference API — thin client for spec §5 "Module: Inference".
 *
 * Four stateless endpoints, no database writes. All four require ADMIN or
 * DOCTOR. The `predict-batch` endpoint accepts up to 50 patients.
 * Error codes to watch: MODEL_NOT_FOUND (500) on predict/batch,
 * EXPLANATION_FAILED (500) on explain.
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    PredictRequest,
    BatchPredictRequest,
    ExplainRequest,
    PredictionResponse,
    PredictionWithExplanationResponse,
    ExplanationResponse,
} from './inference.types';

export const inferenceApi = {
    /**
     * Run a single-patient prediction.
     * POST /inference/predict — returns decision, safety, fairness only
     * (no LLM explanation).
     */
    predict: (data: PredictRequest): Promise<PredictionResponse> => {
        return apiClient.post<PredictionResponse, PredictRequest>(
            API_ROUTES.INFERENCE.PREDICT,
            data
        );
    },

    /**
     * Run a prediction and attach an LLM-generated clinical explanation.
     * POST /inference/predict-with-explanation
     */
    predictWithExplanation: (
        data: PredictRequest
    ): Promise<PredictionWithExplanationResponse> => {
        return apiClient.post<PredictionWithExplanationResponse, PredictRequest>(
            API_ROUTES.INFERENCE.PREDICT_WITH_EXPLANATION,
            data
        );
    },

    /**
     * Generate an explanation from an already-computed prediction payload.
     * POST /inference/explain — does not re-run the model.
     */
    explain: (data: ExplainRequest): Promise<ExplanationResponse> => {
        return apiClient.post<ExplanationResponse, ExplainRequest>(
            API_ROUTES.INFERENCE.EXPLAIN,
            data
        );
    },

    /**
     * Run predictions for multiple patients in one request.
     * POST /inference/predict-batch — spec §5 caps at 50 patients;
     * callers must enforce that limit before dispatch.
     */
    predictBatch: (data: BatchPredictRequest): Promise<PredictionResponse[]> => {
        return apiClient.post<PredictionResponse[], BatchPredictRequest>(
            API_ROUTES.INFERENCE.PREDICT_BATCH,
            data
        );
    },
};
