/**
 * DeleteSimulationDialog — implements the spec's cancel-first delete rule.
 *
 * Spec §6 "Common Integration Mistakes" row 6:
 *   DELETE /simulations/{id} returns SIMULATION_RUNNING (409) while
 *   status === 'RUNNING'. The client must orchestrate:
 *
 *     1. POST /simulations/{id}/cancel   (202, async)
 *     2. Poll GET /simulations/{id} until status leaves RUNNING
 *     3. DELETE /simulations/{id}
 *
 * The hooks expose the primitives:
 *   • useCancelSimulation  — the 202 cancel request
 *   • useSimulation(id, { refetchIntervalMs }) — the polling primitive
 *   • useDeleteSimulation  — the final DELETE
 *
 * Why in the UI layer: the wait is user-visible and we want progress feedback
 * (spinner text changes from "Cancelling" → "Deleting"). Dropping the server
 * rejection into a toast would hide the in-flight orchestration.
 *
 * Error handling:
 *   • SIMULATION_NOT_FOUND (404) on delete → treat as success (already gone).
 *   • SIMULATION_RUNNING (409) on delete → our observed status was stale; fall
 *     back to the cancel-first path and retry once.
 *   • SIMULATION_NOT_RUNNING (409) on cancel → status already transitioned
 *     between render and click; proceed straight to delete.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/src/components/shadcn/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/src/components/shadcn/dialog';
import { useToast } from '@/src/components/shared/ui/toast';
import { ERROR_CODES } from '@/src/lib/constants';
import { ApiError } from '@/src/lib/types';

import {
    useCancelSimulation,
    useDeleteSimulation,
    useSimulation,
} from '../../hooks';
import type { SimulationResponse } from '../../types';

type Phase = 'idle' | 'cancelling' | 'waiting' | 'deleting';

const POLL_INTERVAL_MS = 1000;

interface DeleteSimulationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    simulation: SimulationResponse | null;
}

export function DeleteSimulationDialog({
    isOpen,
    onClose,
    simulation,
}: DeleteSimulationDialogProps) {
    const { showToast } = useToast();
    const cancelMutation = useCancelSimulation();
    const deleteMutation = useDeleteSimulation();

    const [phase, setPhase] = useState<Phase>('idle');
    const hasDeletedRef = useRef(false);

    // Only poll while we're waiting for the RUNNING → terminal transition.
    const { data: polled } = useSimulation(simulation?.id ?? '', {
        refetchIntervalMs: phase === 'waiting' ? POLL_INTERVAL_MS : false,
    });

    // Observed status: prefer the live-polled value once we've started polling,
    // otherwise the prop that opened the dialog.
    const liveStatus = polled?.status ?? simulation?.status;

    // Drive the delete once status leaves RUNNING during the waiting phase.
    useEffect(() => {
        if (phase !== 'waiting' || !simulation) return;
        if (liveStatus === 'RUNNING') return;
        if (hasDeletedRef.current) return;

        hasDeletedRef.current = true;
        setPhase('deleting');
        runDelete(simulation.id);
    // Run when phase + polled status change. runDelete is defined below and
    // is stable w.r.t. the mutation object reference for a given mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, liveStatus, simulation?.id]);

    if (!simulation) return null;

    const isBusy = phase !== 'idle';
    const isRunning = liveStatus === 'RUNNING';

    function handleClose() {
        if (isBusy) return; // lock dialog while the orchestration is in flight
        resetState();
        onClose();
    }

    function resetState() {
        setPhase('idle');
        hasDeletedRef.current = false;
    }

    function runDelete(id: string) {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                showToast(
                    'Simulation deleted',
                    'The simulation and its step records have been removed.',
                    'success',
                );
                resetState();
                onClose();
            },
            onError: (error: ApiError) => {
                // Treat a missing simulation as success — the intent was "make
                // it gone" and it's gone.
                if (error.code === ERROR_CODES.SIMULATION_NOT_FOUND) {
                    showToast(
                        'Already deleted',
                        'This simulation was no longer on the server.',
                        'info',
                    );
                    resetState();
                    onClose();
                    return;
                }

                // Status check raced — server saw RUNNING when we thought
                // otherwise. Retry through the cancel path.
                if (error.code === ERROR_CODES.SIMULATION_RUNNING) {
                    hasDeletedRef.current = false;
                    startCancelThenDelete(id);
                    return;
                }

                showToast('Delete failed', error.getMessage(), 'error');
                resetState();
            },
        });
    }

    function startCancelThenDelete(id: string) {
        setPhase('cancelling');
        cancelMutation.mutate(id, {
            onSuccess: () => setPhase('waiting'),
            onError: (error: ApiError) => {
                // If the server says it's no longer cancellable, the status
                // has already moved — proceed straight to delete.
                if (
                    error.code === ERROR_CODES.SIMULATION_NOT_RUNNING ||
                    error.code === ERROR_CODES.SIMULATION_NOT_CANCELLABLE
                ) {
                    setPhase('deleting');
                    runDelete(id);
                    return;
                }

                showToast('Cancel failed', error.getMessage(), 'error');
                resetState();
            },
        });
    }

    function handleConfirm() {
        if (!simulation) return;
        hasDeletedRef.current = false;
        if (isRunning) {
            startCancelThenDelete(simulation.id);
        } else {
            setPhase('deleting');
            runDelete(simulation.id);
        }
    }

    const confirmLabel = (() => {
        switch (phase) {
            case 'cancelling':
                return 'Cancelling run…';
            case 'waiting':
                return 'Waiting for cancellation…';
            case 'deleting':
                return 'Deleting…';
            default:
                return isRunning ? 'Cancel & Delete' : 'Delete Simulation';
        }
    })();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="rounded-lg border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl max-w-[460px] p-0 gap-0">
                <DialogHeader className="p-5 pb-4 border-b border-white/10">
                    <DialogTitle className="text-lg font-semibold text-foreground">
                        Delete simulation?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        This permanently removes the simulation and all step records. It cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-5 space-y-3">
                    <div className="flex gap-3 p-3.5 bg-rose-500/[0.08] border border-rose-500/20 rounded-lg">
                        <Trash2 className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
                        <div className="min-w-0">
                            <p className="text-base font-medium text-foreground mb-0.5 truncate">
                                {simulation.config.datasetFilename}
                            </p>
                            <p className="text-xs text-muted-foreground tabular-nums">
                                ID {simulation.id.slice(0, 8)}… ·{' '}
                                {simulation.config.datasetRowCount.toLocaleString()} rows · status{' '}
                                <span className="font-semibold text-foreground">{liveStatus}</span>
                            </p>
                        </div>
                    </div>

                    {isRunning && (
                        <div className="p-3 border border-warning/20 bg-warning/[0.06] text-sm leading-relaxed text-warning/90 rounded-lg">
                            This simulation is still running. It will be cancelled first, then deleted once the server confirms the cancellation.
                        </div>
                    )}
                </div>

                <DialogFooter className="p-5 pt-4 border-t border-white/10 flex gap-2.5 sm:flex-row">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={isBusy}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground h-10 text-base font-semibold"
                    >
                        Keep
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isBusy}
                        className="flex-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white border-0 h-10 text-base font-semibold"
                    >
                        {isBusy ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                {confirmLabel}
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                {confirmLabel}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
