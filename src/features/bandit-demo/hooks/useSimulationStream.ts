/**
 * useSimulationStream
 *
 * Replaces useBanditSimulation. Drives all simulation state from the
 * backend SSE stream instead of local computation.
 *
 * Lifecycle: idle → uploading → connecting → streaming → completed/cancelled/failed
 *            streaming ⇄ paused (disconnect/reconnect the SSE stream)
 *
 * Handles:
 *  - CSV upload via POST /api/v1/simulations
 *  - SSE subscription via @microsoft/fetch-event-source
 *  - Reconnection with last_step on network errors
 *  - Silent token refresh on 401/403
 *  - Cancellation via POST /api/v1/simulations/{id}/cancel
 *  - DB-replay path (fetches aggregates from GET /simulations/{id} when complete event has no aggregates)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { getApiBaseUrl, API_ROUTES, COOKIE_NAMES } from '@/src/lib/constants';
import Cookies from 'js-cookie';
import axios from 'axios';

import {
    SSEStepEvent,
    SSECompleteEvent,
    SSEErrorEvent,
    HistoryEntry,
    SimulationLifecycle,
    SimulationUploadConfig,
    SimulationAggregatesResponse,
    TREATMENTS,
    TREATMENT_NAMES,
    getPhaseLabel,
} from '../types';
import { startSimulation, cancelSimulation } from '../api/simulation.api';

// ---------------------------------------------------------------------------
// Token helpers (read/refresh) — used by SSE which bypasses the axios client
// ---------------------------------------------------------------------------

function getAccessToken(): string | undefined {
    return Cookies.get(COOKIE_NAMES.ACCESS_TOKEN);
}

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = Cookies.get(COOKIE_NAMES.REFRESH_TOKEN);
    if (!refreshToken) return null;

    try {
        const response = await axios.post<{
            success: boolean;
            value?: {
                tokens: {
                    access_token: { token: string; expires_at: string };
                    refresh_token: { token: string };
                };
            };
        }>(`${getApiBaseUrl()}${API_ROUTES.AUTH.REFRESH}`, {
            refresh_token: refreshToken,
        });

        if (response.data.success && response.data.value) {
            const { access_token, refresh_token } = response.data.value.tokens;

            Cookies.set(COOKIE_NAMES.ACCESS_TOKEN, access_token.token, {
                expires: new Date(access_token.expires_at),
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });
            Cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refresh_token.token, {
                expires: 30,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
            });

            return access_token.token;
        }
    } catch {
        // Refresh failed — caller will handle
    }
    return null;
}

// ---------------------------------------------------------------------------
// Helper: zero-filled treatment counts/estimates as arrays (for component compat)
// ---------------------------------------------------------------------------

function treatmentRecordToArray(record: Record<string, number>): number[] {
    return TREATMENT_NAMES.map((name) => record[name] ?? 0);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseSimulationStreamReturn {
    // Lifecycle
    simulationId: string | null;
    status: SimulationLifecycle;
    error: string | null;
    csvErrors: string[] | null;

    // Current step state
    step: number;
    totalSteps: number;

    // Accumulated data (array-indexed for component compatibility)
    history: HistoryEntry[];
    treatmentCounts: number[];
    runningEstimates: number[];
    cumulativeReward: number;
    cumulativeRegret: number;
    runningAccuracy: number;
    epsilon: number;

    // Derived
    phase: string;
    bestTreatmentIdx: number;
    treatments: typeof TREATMENTS;
    minEpsilon: number;

    // Final aggregates
    finalAggregates: SSECompleteEvent | null;
    simulationAggregates: SimulationAggregatesResponse | null;

    // Actions
    upload: (file: File, config: SimulationUploadConfig) => Promise<void>;
    connect: () => void;
    disconnect: () => void;
    cancel: () => Promise<void>;
    reset: () => void;
}

export function useSimulationStream(): UseSimulationStreamReturn {
    // -- Lifecycle state --
    const [simulationId, setSimulationId] = useState<string | null>(null);
    const [status, setStatus] = useState<SimulationLifecycle>('idle');
    const [error, setError] = useState<string | null>(null);
    const [csvErrors, setCsvErrors] = useState<string[] | null>(null);

    // -- Step state --
    const [step, setStep] = useState(0);
    const [totalSteps, setTotalSteps] = useState(0);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [treatmentCounts, setTreatmentCounts] = useState<number[]>(
        new Array(TREATMENTS.length).fill(0),
    );
    const [runningEstimates, setRunningEstimates] = useState<number[]>(
        new Array(TREATMENTS.length).fill(0),
    );
    const [cumulativeReward, setCumulativeReward] = useState(0);
    const [cumulativeRegret, setCumulativeRegret] = useState(0);
    const [runningAccuracy, setRunningAccuracy] = useState(0);
    const [epsilon, setEpsilon] = useState(0);
    const [phase, setPhase] = useState('Exploring');
    const [minEpsilon, setMinEpsilon] = useState(0.01);

    // -- Final aggregates --
    const [finalAggregates, setFinalAggregates] = useState<SSECompleteEvent | null>(null);
    const [simulationAggregates, setSimulationAggregates] =
        useState<SimulationAggregatesResponse | null>(null);

    // -- Refs for SSE management --
    const abortRef = useRef<AbortController | null>(null);
    const lastStepRef = useRef(0);
    const simulationIdRef = useRef<string | null>(null);
    const statusRef = useRef<SimulationLifecycle>('idle');
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep refs in sync
    simulationIdRef.current = simulationId;
    statusRef.current = status;

    // -- Derived: best treatment --
    const bestTreatmentIdx = runningEstimates.indexOf(
        Math.max(...runningEstimates),
    );

    // -----------------------------------------------------------------------
    // Process a single step event
    // -----------------------------------------------------------------------
    const processStep = useCallback((data: SSEStepEvent) => {
        lastStepRef.current = data.step;

        setStep(data.step);
        setTotalSteps(data.totalSteps);
        setEpsilon(data.epsilon);
        setCumulativeReward(data.cumulativeReward);
        setCumulativeRegret(data.cumulativeRegret);
        setRunningAccuracy(data.runningAccuracy);
        setTreatmentCounts(treatmentRecordToArray(data.treatmentCounts));
        setRunningEstimates(treatmentRecordToArray(data.runningEstimates));
        setPhase(getPhaseLabel(data.epsilon));

        setHistory((prev) => [
            ...prev,
            {
                step: data.step,
                selectedIdx: data.selectedIdx,
                selectedTreatment: data.selectedTreatment,
                explored: data.explored,
                observedReward: data.observedReward,
                epsilon: data.epsilon,
                cumulativeReward: data.cumulativeReward,
                cumulativeRegret: data.cumulativeRegret,
                runningAccuracy: data.runningAccuracy,
            },
        ]);
    }, []);

    // -----------------------------------------------------------------------
    // Handle the complete event
    // -----------------------------------------------------------------------
    const handleComplete = useCallback(
        (data: SSECompleteEvent) => {
            if (data.status === 'CANCELLED') {
                setStatus('cancelled');
            } else if (data.status === 'FAILED') {
                setStatus('failed');
            } else {
                setStatus('completed');
            }
            setFinalAggregates(data);

            // Both live and DB-replay paths now include aggregates when COMPLETED
            if (data.status === 'COMPLETED') {
                setSimulationAggregates({
                    finalAccuracy: data.final_accuracy ?? null,
                    finalCumulativeReward: data.final_cumulative_reward ?? null,
                    finalCumulativeRegret: data.final_cumulative_regret ?? null,
                    meanReward: data.mean_reward ?? null,
                    meanRegret: data.mean_regret ?? null,
                    thompsonExplorationRate: data.thompson_exploration_rate ?? null,
                    treatmentCounts: data.treatment_counts ?? null,
                    confidenceDistribution: data.confidence_distribution ?? null,
                    safetyDistribution: data.safety_distribution ?? null,
                });
            }
        },
        [],
    );

    // -----------------------------------------------------------------------
    // Open the SSE stream
    // -----------------------------------------------------------------------
    const openStream = useCallback(
        (simId: string) => {
            // Abort any existing connection
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            const token = getAccessToken();
            if (!token) {
                setError('Not authenticated — please log in again.');
                setStatus('failed');
                return;
            }

            const baseUrl = getApiBaseUrl();
            const url = `${baseUrl}${API_ROUTES.SIMULATIONS.STREAM(simId)}?last_step=${lastStepRef.current}`;

            setStatus('streaming');

            fetchEventSource(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'text/event-stream',
                },
                signal: controller.signal,

                onopen: async (response) => {
                    if (response.ok) return;

                    // 401/403 — attempt silent token refresh and retry
                    if (response.status === 401 || response.status === 403) {
                        const newToken = await refreshAccessToken();
                        if (newToken) {
                            // Abort this connection, reconnect with new token
                            controller.abort();
                            // Small delay to let abort propagate
                            setTimeout(() => openStream(simId), 100);
                            return;
                        }
                        throw new Error('Authentication failed — please log in again.');
                    }

                    const text = await response.text();
                    throw new Error(
                        `Server returned ${response.status}: ${text}`,
                    );
                },

                onmessage: (event) => {
                    switch (event.event) {
                        case 'step': {
                            const data: SSEStepEvent = JSON.parse(event.data);
                            processStep(data);
                            break;
                        }
                        case 'ping': {
                            // Keep-alive — no action needed
                            break;
                        }
                        case 'complete': {
                            const data: SSECompleteEvent = JSON.parse(event.data);
                            handleComplete(data);
                            controller.abort();
                            break;
                        }
                        case 'error': {
                            const data: SSEErrorEvent = JSON.parse(event.data);
                            setError(data.error);
                            setStatus('failed');
                            controller.abort();
                            break;
                        }
                    }
                },

                onerror: (err) => {
                    // If we intentionally aborted (pause, cancel, unmount), don't reconnect
                    if (controller.signal.aborted) {
                        throw err; // Stop fetchEventSource's auto-retry
                    }

                    // Network error — attempt reconnect with backoff
                    console.warn('[SSE] Connection error, reconnecting in 3s...', err);

                    reconnectTimeoutRef.current = setTimeout(async () => {
                        // Check if still in a state where reconnecting makes sense
                        if (
                            statusRef.current !== 'streaming' &&
                            statusRef.current !== 'connecting'
                        ) {
                            return;
                        }

                        // Try refreshing the token in case it expired
                        const freshToken = await refreshAccessToken();
                        if (!freshToken && !getAccessToken()) {
                            setError('Session expired — please log in again.');
                            setStatus('failed');
                            return;
                        }

                        openStream(simId);
                    }, 3000);

                    throw err; // Stop fetchEventSource's built-in auto-retry
                },
            });
        },
        [processStep, handleComplete],
    );

    // -----------------------------------------------------------------------
    // Actions
    // -----------------------------------------------------------------------

    /** Upload CSV + config, start the simulation, then connect to the stream. */
    const upload = useCallback(
        async (file: File, config: SimulationUploadConfig) => {
            setStatus('uploading');
            setError(null);
            setCsvErrors(null);
            setMinEpsilon(config.minEpsilon);

            try {
                const sim = await startSimulation(file, config);
                setSimulationId(sim.id);
                simulationIdRef.current = sim.id;
                setTotalSteps(sim.config.datasetRowCount);
                lastStepRef.current = 0;

                setStatus('connecting');
                openStream(sim.id);
            } catch (err: unknown) {
                setStatus('failed');
                // Check for CSV validation errors with detail lines
                if (
                    err &&
                    typeof err === 'object' &&
                    'code' in err
                ) {
                    const apiErr = err as {
                        code?: string;
                        details?: string[];
                        getMessage?: () => string;
                    };
                    if (
                        apiErr.code === 'CSV_VALIDATION_FAILED' &&
                        apiErr.details
                    ) {
                        setCsvErrors(apiErr.details);
                        setError('CSV validation failed');
                        return;
                    }
                    if (apiErr.code === 'FILE_TOO_LARGE') {
                        setError(
                            apiErr.details?.[0] ??
                                'CSV file exceeds the maximum size of 20 MB.',
                        );
                        return;
                    }
                    if (apiErr.code === 'MAX_SIMULATIONS_REACHED') {
                        setError(
                            'Maximum concurrent simulations reached (3). Cancel or wait for an existing simulation to finish.',
                        );
                        return;
                    }
                }
                // Generic error fallback
                if (err instanceof Error) {
                    setError(err.message);
                } else if (
                    err &&
                    typeof err === 'object' &&
                    'getMessage' in err &&
                    typeof (err as { getMessage: () => string }).getMessage === 'function'
                ) {
                    setError((err as { getMessage: () => string }).getMessage());
                } else {
                    setError('Failed to start simulation');
                }
            }
        },
        [openStream],
    );

    /** Connect (or reconnect) to the SSE stream of the current simulation. */
    const connect = useCallback(() => {
        const simId = simulationIdRef.current;
        if (!simId) return;
        setStatus('connecting');
        openStream(simId);
    }, [openStream]);

    /** Disconnect from the stream (pause). Server-side simulation continues. */
    const disconnect = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        setStatus('paused');
    }, []);

    /** Cancel the running simulation. */
    const cancel = useCallback(async () => {
        const simId = simulationIdRef.current;
        if (!simId) return;

        try {
            await cancelSimulation(simId);
            // Don't set status to cancelled yet — wait for the `complete` event
            // with status: "CANCELLED" to arrive via SSE. If we're disconnected,
            // set it immediately.
            if (statusRef.current === 'paused' || statusRef.current === 'failed') {
                setStatus('cancelled');
            }
        } catch (err: unknown) {
            // SIMULATION_NOT_RUNNING is fine — it already stopped
            if (
                err &&
                typeof err === 'object' &&
                'code' in err &&
                (err as { code?: string }).code === 'SIMULATION_NOT_RUNNING'
            ) {
                setStatus('cancelled');
                return;
            }
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    }, []);

    /** Reset all state to idle. */
    const reset = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        setSimulationId(null);
        simulationIdRef.current = null;
        setStatus('idle');
        setError(null);
        setCsvErrors(null);
        setStep(0);
        setTotalSteps(0);
        setHistory([]);
        setTreatmentCounts(new Array(TREATMENTS.length).fill(0));
        setRunningEstimates(new Array(TREATMENTS.length).fill(0));
        setCumulativeReward(0);
        setCumulativeRegret(0);
        setRunningAccuracy(0);
        setEpsilon(0);
        setPhase('Exploring');
        setMinEpsilon(0.01);
        setFinalAggregates(null);
        setSimulationAggregates(null);
        lastStepRef.current = 0;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortRef.current?.abort();
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, []);

    return {
        simulationId,
        status,
        error,
        csvErrors,
        step,
        totalSteps,
        history,
        treatmentCounts,
        runningEstimates,
        cumulativeReward,
        cumulativeRegret,
        runningAccuracy,
        epsilon,
        phase,
        bestTreatmentIdx,
        treatments: TREATMENTS,
        minEpsilon,
        finalAggregates,
        simulationAggregates,
        upload,
        connect,
        disconnect,
        cancel,
        reset,
    };
}
