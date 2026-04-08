/**
 * Patients hooks — React Query wrappers for spec §5 Patients endpoints.
 *
 * Spec divergence notes:
 *   • No restore endpoint — delete is permanent.
 *   • GET /patients/{id} returns PatientDetailResponse directly (medical
 *     records eager-loaded); there is no separate "detail" endpoint.
 *   • Medical-record update/delete endpoints are not in spec §5 and were
 *     removed along with their hooks.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '../api/patients.api';
import {
    CreatePatientRequest,
    UpdatePatientRequest,
    CreateMedicalRecordRequest,
    ListPatientsParams,
    ListMedicalRecordsParams,
} from '../api/patients.types';
import { ApiError } from '@/src/lib/types';

export const patientsKeys = {
    all: ['patients'] as const,
    lists: () => [...patientsKeys.all, 'list'] as const,
    list: (params?: ListPatientsParams) => [...patientsKeys.lists(), params] as const,
    details: () => [...patientsKeys.all, 'detail'] as const,
    detail: (id: string) => [...patientsKeys.details(), id] as const,
    medicalRecords: (patientId: string, params?: ListMedicalRecordsParams) =>
        [...patientsKeys.all, 'medical-records', patientId, params] as const,
    medicalRecord: (patientId: string, recordId: string) =>
        [...patientsKeys.all, 'medical-records', patientId, recordId] as const,
};

// =========================================================================
// QUERIES
// =========================================================================

export const usePatients = (params?: ListPatientsParams) => {
    return useQuery({
        queryKey: patientsKeys.list(params),
        queryFn: () => patientsApi.list(params),
        staleTime: 3 * 60 * 1000,
    });
};

/**
 * Get a patient with all medical records eagerly loaded (spec §5: there is
 * only one patient-by-id endpoint — it returns `PatientDetailResponse`).
 */
export const usePatient = (patientId: string) => {
    return useQuery({
        queryKey: patientsKeys.detail(patientId),
        queryFn: () => patientsApi.getById(patientId),
        staleTime: 5 * 60 * 1000,
        enabled: !!patientId,
    });
};

export const usePatientMedicalRecords = (
    patientId: string,
    params?: ListMedicalRecordsParams
) => {
    return useQuery({
        queryKey: patientsKeys.medicalRecords(patientId, params),
        queryFn: () => patientsApi.listMedicalRecords(patientId, params),
        staleTime: 5 * 60 * 1000,
        enabled: !!patientId,
    });
};

export const useMedicalRecord = (patientId: string, recordId: string) => {
    return useQuery({
        queryKey: patientsKeys.medicalRecord(patientId, recordId),
        queryFn: () => patientsApi.getMedicalRecord(patientId, recordId),
        staleTime: 5 * 60 * 1000,
        enabled: !!patientId && !!recordId,
    });
};

// =========================================================================
// MUTATIONS
// =========================================================================

export const useCreatePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePatientRequest) => patientsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
        },
        onError: (error: ApiError) => {
            console.error('Create patient failed:', error.getFullMessage());
        },
    });
};

export const useUpdatePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: string; data: UpdatePatientRequest }) =>
            patientsApi.update(patientId, data),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(patientId) });
        },
        onError: (error: ApiError) => {
            console.error('Update patient failed:', error.getFullMessage());
        },
    });
};

export const useDeletePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (patientId: string) => patientsApi.delete(patientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
        },
        onError: (error: ApiError) => {
            console.error('Delete patient failed:', error.getFullMessage());
        },
    });
};

// Legacy alias — PatientDetail uses this name; the canonical export is usePatient.
export const usePatientDetail = usePatient;

export const useCreateMedicalRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: string; data: CreateMedicalRecordRequest }) =>
            patientsApi.createMedicalRecord(patientId, data),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(patientId) });
            queryClient.invalidateQueries({
                queryKey: [...patientsKeys.all, 'medical-records', patientId],
            });
        },
        onError: (error: ApiError) => {
            console.error('Create medical record failed:', error.getFullMessage());
        },
    });
};

// These operations are not supported by the current backend (spec §5).
// Stubs are kept to prevent import errors in legacy UI components.
export const useDeletePatientMedicalData = () =>
    useMutation({
        mutationFn: async (_: { medicalDataId: string; patientId: string }) => {
            throw new Error('Deleting medical records is not supported');
        },
    });

export const useUpdatePatientMedicalData = () =>
    useMutation({
        mutationFn: async (_: { medicalDataId: string; patientId: string; data: unknown }) => {
            throw new Error('Updating medical records is not supported');
        },
    });
