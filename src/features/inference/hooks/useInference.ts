/**
 * Inference hooks — React Query wrappers for spec §5 "Module: Inference".
 *
 * All four inference endpoints are stateless (no DB writes), so they are
 * exposed as mutations rather than queries — the caller triggers them on
 * user action and there is nothing server-side to invalidate on success.
 */

import { useMutation } from '@tanstack/react-query';
import { inferenceApi } from '../api/inference.api';
import {
    PredictRequest,
    BatchPredictRequest,
    ExplainRequest,
    PredictionResponse,
    PredictionWithExplanationResponse,
    ExplanationResponse,
} from '../api/inference.types';
import { ApiError } from '@/src/lib/types';

/**
 * Namespace for any cache keys added later (e.g. if the UI chooses to
 * memoise batch results). Kept here for parity with other feature hook
 * files so consumers have a single import surface.
 */
export const inferenceKeys = {
    all: ['inference'] as const,
};

/**
 * POST /inference/predict — single-patient prediction, no LLM explanation.
 * Surface `MODEL_NOT_FOUND` (500) via the mutation's error state.
 */
export const usePredict = () => {
    return useMutation<PredictionResponse, ApiError, PredictRequest>({
        mutationFn: (data) => inferenceApi.predict(data),
        onError: (error) => {
            console.error('Inference predict failed:', error.getFullMessage());
        },
    });
};

/**
 * POST /inference/predict-with-explanation — prediction + LLM explanation.
 * Surface `MODEL_NOT_FOUND` (500) via the mutation's error state.
 */
export const usePredictWithExplanation = () => {
    return useMutation<PredictionWithExplanationResponse, ApiError, PredictRequest>({
        mutationFn: (data) => inferenceApi.predictWithExplanation(data),
        onError: (error) => {
            console.error('Inference predict-with-explanation failed:', error.getFullMessage());
        },
    });
};

/**
 * POST /inference/explain — explanation only from a prior prediction payload.
 * Surface `EXPLANATION_FAILED` (500) via the mutation's error state.
 */
export const useExplain = () => {
    return useMutation<ExplanationResponse, ApiError, ExplainRequest>({
        mutationFn: (data) => inferenceApi.explain(data),
        onError: (error) => {
            console.error('Inference explain failed:', error.getFullMessage());
        },
    });
};

/**
 * POST /inference/predict-batch — up to 50 patients per request.
 * Callers must cap the `patients` array to ≤50 before dispatching.
 */
export const usePredictBatch = () => {
    return useMutation<PredictionResponse[], ApiError, BatchPredictRequest>({
        mutationFn: (data) => inferenceApi.predictBatch(data),
        onError: (error) => {
            console.error('Inference predict-batch failed:', error.getFullMessage());
        },
    });
};
