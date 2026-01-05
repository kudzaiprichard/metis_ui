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
const patientsKeys = {
    all: ['patients'] as const,
    lists: () => [...patientsKeys.all, 'list'] as const,
    list: (params?: ListPatientsParams) => [...patientsKeys.lists(), params] as const,
    details: () => [...patientsKeys.all, 'detail'] as const,
    detail: (id: string) => [...patientsKeys.details(), id] as const,
    medicalData: (patientId: string) => [...patientsKeys.all, 'medical-data', patientId] as const,
};

/**
 * Hook to list patients with pagination and filters
 */
export const usePatients = (params?: ListPatientsParams) => {
    return useQuery({
        queryKey: patientsKeys.list(params),
        queryFn: () => patientsApi.list(params),
        staleTime: 3 * 60 * 1000, // 3 minutes
    });
};

/**
 * Hook to get a single patient by ID with medical data
 */
export const usePatient = (patientId: string) => {
    return useQuery({
        queryKey: patientsKeys.detail(patientId),
        queryFn: () => patientsApi.getById(patientId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!patientId, // Only fetch if patientId exists
    });
};

/**
 * Hook to get patient medical data
 */
export const usePatientMedicalData = (patientId: string) => {
    return useQuery({
        queryKey: patientsKeys.medicalData(patientId),
        queryFn: () => patientsApi.getMedicalData(patientId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!patientId,
    });
};

/**
 * Hook to create a new patient
 */
export const useCreatePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePatientRequest) => patientsApi.create(data),
        onSuccess: () => {
            // Invalidate patients list to refetch with new patient
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
        onSuccess: (updatedPatient) => {
            // Invalidate patients list
            queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });

            // Invalidate patient detail cache
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(updatedPatient.id) });
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
            // Invalidate patients list to refetch
            queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
        },
        onError: (error: ApiError) => {
            console.error('Delete patient failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to create medical data for a patient
 */
export const useCreatePatientMedicalData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePatientMedicalDataRequest) => patientsApi.createMedicalData(data),
        onSuccess: (medicalData) => {
            // Invalidate patient detail to refetch with medical data
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(medicalData.patient_id) });

            // Invalidate medical data cache
            queryClient.invalidateQueries({ queryKey: patientsKeys.medicalData(medicalData.patient_id) });
        },
        onError: (error: ApiError) => {
            console.error('Create medical data failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to update patient medical data
 */
export const useUpdatePatientMedicalData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: string; data: UpdatePatientMedicalDataRequest }) =>
            patientsApi.updateMedicalData(patientId, data),
        onSuccess: (medicalData) => {
            // Invalidate patient detail
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(medicalData.patient_id) });

            // Update medical data cache
            queryClient.setQueryData(patientsKeys.medicalData(medicalData.patient_id), medicalData);
        },
        onError: (error: ApiError) => {
            console.error('Update medical data failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to delete patient medical data
 */
export const useDeletePatientMedicalData = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (patientId: string) => patientsApi.deleteMedicalData(patientId),
        onSuccess: (_, patientId) => {
            // Invalidate patient detail
            queryClient.invalidateQueries({ queryKey: patientsKeys.detail(patientId) });

            // Invalidate medical data cache
            queryClient.invalidateQueries({ queryKey: patientsKeys.medicalData(patientId) });
        },
        onError: (error: ApiError) => {
            console.error('Delete medical data failed:', error.getFullMessage());
        },
    });
};