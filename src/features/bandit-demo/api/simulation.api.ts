/**
 * Simulation API
 *
 * Handles CSV upload, simulation CRUD, cancellation, and detail fetching.
 * SSE streaming is handled separately in the useSimulationStream hook
 * because it requires fetchEventSource, not axios.
 *
 * Spec §6 "Simulation Endpoints Reference":
 *   POST   /simulations                      — upload + start (this file)
 *   GET    /simulations                      — paginated list
 *   GET    /simulations/{id}                 — single detail
 *   GET    /simulations/{id}/stream          — SSE (useSimulationStream)
 *   POST   /simulations/{id}/cancel          — async cancel
 *   GET    /simulations/{id}/steps           — paginated per-step drill-down
 *   DELETE /simulations/{id}                 — permanent delete (cancel first
 *                                              if RUNNING; server returns
 *                                              SIMULATION_RUNNING 409 otherwise)
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    PaginatedQuery,
    PaginatedSimulationsResult,
    PaginatedStepsResult,
    PaginationMeta,
    SimulationResponse,
    SimulationStepResponse,
    SimulationUploadConfig,
} from '../types';

/**
 * Upload a patient CSV and start a simulation.
 * POST /api/v1/simulations — multipart/form-data
 */
export async function startSimulation(
    file: File,
    config: SimulationUploadConfig,
): Promise<SimulationResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('initial_epsilon', config.initialEpsilon.toString());
    formData.append('epsilon_decay', config.epsilonDecay.toString());
    formData.append('min_epsilon', config.minEpsilon.toString());
    formData.append('random_seed', config.randomSeed.toString());
    formData.append('reset_posterior', config.resetPosterior.toString());

    return apiClient.post<SimulationResponse>(
        API_ROUTES.SIMULATIONS.BASE,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
}

/**
 * Get a single simulation's current state and aggregates.
 * GET /api/v1/simulations/{id}
 */
export async function getSimulation(simulationId: string): Promise<SimulationResponse> {
    return apiClient.get<SimulationResponse>(
        API_ROUTES.SIMULATIONS.BY_ID(simulationId),
    );
}

/**
 * Cancel a running simulation.
 * POST /api/v1/simulations/{id}/cancel — returns 202 with value: null.
 * Cancellation is asynchronous; watch the SSE stream for the complete event.
 *
 * Spec error codes: SIMULATION_NOT_FOUND (404), SIMULATION_NOT_RUNNING (409).
 */
export async function cancelSimulation(simulationId: string): Promise<void> {
    await apiClient.post<null>(
        API_ROUTES.SIMULATIONS.CANCEL(simulationId),
    );
}

/**
 * List all simulations, newest first.
 * GET /api/v1/simulations — spec §6 "Simulation Endpoints Reference".
 *
 * Paginated via query string (`page`, `pageSize` — camelCase per spec §3.2).
 * The api-client returns pagination with snake_case keys; we normalise to
 * camelCase here so callers have a single shape to consume.
 */
export async function listSimulations(
    params?: PaginatedQuery,
): Promise<PaginatedSimulationsResult> {
    const { items, pagination } = await apiClient.getPaginated<SimulationResponse>(
        API_ROUTES.SIMULATIONS.BASE,
        { params },
    );

    return {
        simulations: items,
        pagination: normalisePagination(pagination),
    };
}

/**
 * Retrieve full per-step detail records from the DB.
 * GET /api/v1/simulations/{id}/steps — the SSE stream carries lean payloads;
 * this endpoint carries the full SimulationStepResponse per step.
 *
 * Spec error codes: SIMULATION_NOT_FOUND (404).
 * Query parameters default to page=1, pageSize=20; max pageSize per spec is 100.
 */
export async function listSimulationSteps(
    simulationId: string,
    params?: PaginatedQuery,
): Promise<PaginatedStepsResult> {
    const { items, pagination } = await apiClient.getPaginated<SimulationStepResponse>(
        API_ROUTES.SIMULATIONS.STEPS(simulationId),
        { params },
    );

    return {
        steps: items,
        pagination: normalisePagination(pagination),
    };
}

/**
 * Permanently delete a simulation and all its step records (cascade).
 * DELETE /api/v1/simulations/{id}
 *
 * Spec error codes: SIMULATION_NOT_FOUND (404), SIMULATION_RUNNING (409).
 * If the simulation is still RUNNING the server rejects with
 * `SIMULATION_RUNNING` and the caller must cancel first, wait for status to
 * leave RUNNING, then retry delete. That cancel-then-delete flow lives in
 * the UI layer because it requires polling / user-visible state.
 */
export async function deleteSimulation(simulationId: string): Promise<void> {
    await apiClient.delete<null>(API_ROUTES.SIMULATIONS.BY_ID(simulationId));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalise the api-client's pagination envelope (snake_case fallback) into
 * the camelCase shape callers use. The backend itself returns camelCase per
 * spec §3.2, but api-client's type is snake_case for legacy reasons.
 */
function normalisePagination(raw: unknown): PaginationMeta {
    const p = raw as Partial<{
        page: number;
        pageSize: number;
        page_size: number;
        total: number;
        totalPages: number;
        total_pages: number;
    }>;
    return {
        page: p.page ?? 1,
        pageSize: p.pageSize ?? p.page_size ?? 20,
        total: p.total ?? 0,
        totalPages: p.totalPages ?? p.total_pages ?? 0,
    };
}
