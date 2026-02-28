/**
 * Patients Hooks
 * React Query hooks for patient management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '../api/patients.api';
import {
    CreatePatientRequest,
    UpdatePatientContactRequest,
    CreatePatientMedicalDataRequest,
    UpdatePatientMedicalDataRequest,
    ListPatientsParams,
} from '../api/patients.types';
import { ApiError } from '@/src/lib/types';

/**
 * Query keys for patients
 */
export const patientsKeys = {
    all: ['patients'] as const,
    lists: () => [...patientsKeys.all, 'list'] as const,
    list: (params?: ListPatientsParams) => [...patientsKeys.lists(), params] as const,
    details: () => [...patientsKeys.all, 'detail'] as const,
    detail: (id: string) => [...patientsKeys.details(), id] as const,
    medicalRecords: (patientId: string) => [...patientsKeys.all, 'medical-records', patientId] as const,
    medicalData: (medicalDataId: string) => [...patientsKeys.all, 'medical-data', medicalDataId] as const,
    latestMedicalData: (patientId: string) => [...patientsKeys.all, 'medical-data-latest', patientId] as const,
};

// =========================================================================
// PATIENT QUERIES
// =========================================================================

/**
 * Hook to list patients with pagination and search
 */
export const usePatients = (params?: ListPatientsParams) => {
    return useQuery({
        queryKey: patientsKeys.list(params),
        queryFn: () => patientsApi.list(params),
        staleTime: 3 * 60 * 1000,
    });
};

/**
 * Hook to get patient basic info
 */
export const usePatient = (patientId: string) => {
    return useQuery({
        queryKey: patientsKeys.detail(patientId),
        queryFn: () => patientsApi.getById(patientId),
        staleTime: 5 * 60 * 1000,
        enabled: !!patientId,
    });
};

/**
 * Hook to get patient with all medical records and predictions
 */
export const usePatientDetail = (patientId: string) => {
    return useQuery({
        queryKey: patientsKeys.detail(patientId),
        queryFn: () => patientsApi.getDetail(patientId),
        staleTime: 5 * 60 * 1000,
        enabled: !!patientId,
    });
};

// =========================================================================
// MEDICAL DATA QUERIES
// =========================================================================

/**
 * Hook to get all medical records for a patient
 */
export const usePatientMedicalRecords = (patientId: string) => {
    return useQuery({
        queryKey: patientsKeys.medicalRecords(patientId),
        queryFn: () => patientsApi.getMedicalRecords(patientId),
        staleTime: 5 * 60 * 1000,
        enabled: !!patientId,
    });
};

/**
 * Hook to get latest medical data for a patient
 */
export const useLatestMedicalData = (patientId: string) => {
    return useQuery({
        queryKey: patientsKeys.latestMedicalData(patientId),
        queryFn: () => patientsApi.getLatestMedicalData(patientId),
        staleTime: 5 * 60 * 1000,
        enabled: !!patientId,
    });
};

/**
 * Hook to get a specific medical data record by ID
 */
export const useMedicalData = (medicalDataId: string) => {
    return useQuery({
        queryKey: patientsKeys.medicalData(medicalDataId),
        queryFn: () => patientsApi.getMedicalDataById(medicalDataId),
        staleTime: 5 * 60 * 1000,
        enabled: !!medicalDataId,
    });
};

// =========================================================================
// PATIENT MUTATIONS
// =========================================================================

/**
 * Hook to create a new patient
 */
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

/**
 * Hook to update patient contact information
 */
export const useUpdatePatientContact = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: string; data: UpdatePatientContactRequest }) =>
            patientsApi.updateContact(patientId, data),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(patientId) });
        },
        onError: (error: ApiError) => {
            console.error('Update patient failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to delete a patient (soft delete)
 */
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

/**
 * Hook to restore a soft-deleted patient
 */
export const useRestorePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (patientId: string) => patientsApi.restore(patientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
        },
        onError: (error: ApiError) => {
            console.error('Restore patient failed:', error.getFullMessage());
        },
    });
};

// =========================================================================
// MEDICAL DATA MUTATIONS
// =========================================================================

/**
 * Hook to create medical data for a patient
 */
export const useCreatePatientMedicalData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePatientMedicalDataRequest) => patientsApi.createMedicalData(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(variables.patient_id) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.medicalRecords(variables.patient_id) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.latestMedicalData(variables.patient_id) });
        },
        onError: (error: ApiError) => {
            console.error('Create medical data failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to update a specific medical data record
 */
export const useUpdatePatientMedicalData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         medicalDataId,
                         patientId,
                         data,
                     }: {
            medicalDataId: string;
            patientId: string;
            data: UpdatePatientMedicalDataRequest;
        }) => patientsApi.updateMedicalData(medicalDataId, data),
        onSuccess: (_, { medicalDataId, patientId }) => {
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(patientId) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.medicalRecords(patientId) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.medicalData(medicalDataId) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.latestMedicalData(patientId) });
        },
        onError: (error: ApiError) => {
            console.error('Update medical data failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to delete a specific medical data record
 */
export const useDeletePatientMedicalData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         medicalDataId,
                         patientId,
                     }: {
            medicalDataId: string;
            patientId: string;
        }) => patientsApi.deleteMedicalData(medicalDataId),
        onSuccess: (_, { medicalDataId, patientId }) => {
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(patientId) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.medicalRecords(patientId) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.medicalData(medicalDataId) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.latestMedicalData(patientId) });
        },
        onError: (error: ApiError) => {
            console.error('Delete medical data failed:', error.getFullMessage());
        },
    });
};