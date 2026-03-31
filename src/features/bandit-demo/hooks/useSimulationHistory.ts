/**
 * Simulation history hooks — React Query wrappers for the three spec
 * endpoints that were previously unused:
 *
 *   • GET    /simulations                 → useSimulations (paginated list)
 *   • GET    /simulations/{id}/steps      → useSimulationSteps (drill-down)
 *   • DELETE /simulations/{id}            → useDeleteSimulation
 *   • POST   /simulations/{id}/cancel     → useCancelSimulation
 *
 * SSE streaming remains in `useSimulationStream.ts`; that hook owns
 * lifecycle state tied to an active run.
 *
 * Delete flow caveat (spec §6 "Common Integration Mistakes" row 6):
 *   DELETE returns `SIMULATION_RUNNING` (409) while status === 'RUNNING'.
 *   Callers must cancel first, wait for the status transition, then delete.
 *   The dialog in `DeleteSimulationDialog` orchestrates that — these hooks
 *   expose the primitives.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/src/lib/types';

import {
    cancelSimulation,
    deleteSimulation,
    getSimulation,
    listSimulations,
    listSimulationSteps,
} from '../api/simulation.api';
import {
    PaginatedQuery,
    PaginatedSimulationsResult,
    PaginatedStepsResult,
    SimulationResponse,
} from '../types';

export const simulationsKeys = {
    all: ['simulations'] as const,
    lists: () => [...simulationsKeys.all, 'list'] as const,
    list: (params?: PaginatedQuery) => [...simulationsKeys.lists(), params] as const,
    details: () => [...simulationsKeys.all, 'detail'] as const,
    detail: (id: string) => [...simulationsKeys.details(), id] as const,
    steps: (id: string, params?: PaginatedQuery) =>
        [...simulationsKeys.detail(id), 'steps', params] as const,
};

// =========================================================================
// QUERIES
// =========================================================================

/**
 * Paginated simulation history, newest first (spec guarantee).
 * GET /simulations — query string carries `page` / `pageSize`.
 */
export function useSimulations(params?: PaginatedQuery) {
    return useQuery<PaginatedSimulationsResult, ApiError>({
        queryKey: simulationsKeys.list(params),
        queryFn: () => listSimulations(params),
        staleTime: 60 * 1000,
        // Previous page keeps rendering during pagination transitions so the
        // table doesn't flash to a skeleton on every page click.
        placeholderData: (prev) => prev,
    });
}

/**
 * Fetch a single simulation. Mirrors what SSE eventually delivers but
 * driven by React Query so list/detail views can share a cache entry.
 *
 * `refetchInterval` lets the delete dialog poll for the transition out of
 * RUNNING without needing its own timer. Defaults to off; callers opt in.
 */
export function useSimulation(
    simulationId: string,
    options?: { refetchIntervalMs?: number | false },
) {
    return useQuery<SimulationResponse, ApiError>({
        queryKey: simulationsKeys.detail(simulationId),
        queryFn: () => getSimulation(simulationId),
        enabled: !!simulationId,
        staleTime: 10 * 1000,
        refetchInterval: options?.refetchIntervalMs ?? false,
    });
}

/**
 * Per-step drill-down for a completed simulation.
 * GET /simulations/{id}/steps — paginated (page=1, pageSize up to 100 per spec).
 */
export function useSimulationSteps(
    simulationId: string,
    params?: PaginatedQuery,
) {
    return useQuery<PaginatedStepsResult, ApiError>({
        queryKey: simulationsKeys.steps(simulationId, params),
        queryFn: () => listSimulationSteps(simulationId, params),
        enabled: !!simulationId,
        // Completed simulations are immutable — cache aggressively.
        staleTime: 10 * 60 * 1000,
        placeholderData: (prev) => prev,
    });
}

// =========================================================================
// MUTATIONS
// =========================================================================

/**
 * Request cancellation of a RUNNING simulation. Response is 202 — actual
 * status transition happens asynchronously and is observed via the SSE
 * `complete` event or by polling GET /simulations/{id}.
 *
 * Invalidates detail (triggers refetch) and list (status chip will flip).
 */
export function useCancelSimulation() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (simulationId) => cancelSimulation(simulationId),
        onSuccess: (_void, simulationId) => {
            queryClient.invalidateQueries({
                queryKey: simulationsKeys.detail(simulationId),
            });
            queryClient.invalidateQueries({ queryKey: simulationsKeys.lists() });
        },
    });
}

/**
 * Permanently delete a simulation.
 *
 * Only safe to call when `status !== 'RUNNING'` — otherwise the server
 * returns `SIMULATION_RUNNING` (409). Callers must orchestrate
 * cancel-then-wait-then-delete; the dialog does this via `useSimulation`
 * with `refetchIntervalMs`.
 *
 * On success we evict the detail cache and invalidate the list.
 */
export function useDeleteSimulation() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (simulationId) => deleteSimulation(simulationId),
        onSuccess: (_void, simulationId) => {
            queryClient.removeQueries({
                queryKey: simulationsKeys.detail(simulationId),
            });
            queryClient.invalidateQueries({ queryKey: simulationsKeys.lists() });
        },
    });
}
