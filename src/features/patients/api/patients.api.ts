/**
 * Patients API
 * Handles patient management API calls
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    CreatePatientRequest,
    UpdatePatientContactRequest,
    CreatePatientMedicalDataRequest,
    UpdatePatientMedicalDataRequest,
    ListPatientsParams,
    Patient,
    PatientDetail,
    PatientMedicalData,
    PatientsListResponse,
    DeletePatientResponse,
    DeleteMedicalDataResponse,
} from './patients.types';

/**
 * Patients API object with all patient management methods
 */
export const patientsApi = {
    /**
     * Create a new patient
     * POST /patients
     */
    create: (data: CreatePatientRequest): Promise<Patient> => {
        return apiClient.post<Patient, CreatePatientRequest>(
            API_ROUTES.PATIENTS.BASE,
            data
        );
    },

    /**
     * List patients with pagination and filters
     * GET /patients
     */
    list: async (params?: ListPatientsParams): Promise<PatientsListResponse> => {
        const { items, pagination } = await apiClient.getPaginated<Patient>(
            API_ROUTES.PATIENTS.BASE,
            { params }
        );

        return {
            patients: items,
            pagination,
        };
    },

    /**
     * Get patient by ID with medical data
     * GET /patients/:id/detail
     */
    getById: (patientId: string): Promise<PatientDetail> => {
        return apiClient.get<PatientDetail>(
            API_ROUTES.PATIENTS.BY_ID_DETAIL(patientId)
        );
    },

    /**
     * Update patient contact information
     * PUT /patients/:id
     */
    updateContact: (patientId: string, data: UpdatePatientContactRequest): Promise<Patient> => {
        return apiClient.put<Patient, UpdatePatientContactRequest>(
            API_ROUTES.PATIENTS.BY_ID(patientId),
            data
        );
    },

    /**
     * Delete patient (soft delete)
     * DELETE /patients/:id
     */
    delete: (patientId: string): Promise<DeletePatientResponse> => {
        return apiClient.delete<DeletePatientResponse>(
            API_ROUTES.PATIENTS.BY_ID(patientId)
        );
    },

    /**
     * Create medical data for a patient
     * POST /patients/:patientId/medical-data
     */
    createMedicalData: (data: CreatePatientMedicalDataRequest): Promise<PatientMedicalData> => {
        return apiClient.post<PatientMedicalData, CreatePatientMedicalDataRequest>(
            API_ROUTES.PATIENTS.MEDICAL_DATA(data.patient_id),
            data
        );
    },

    /**
     * Get medical data for a patient
     * GET /patients/:patientId/medical-data
     */
    getMedicalData: (patientId: string): Promise<PatientMedicalData> => {
        return apiClient.get<PatientMedicalData>(
            API_ROUTES.PATIENTS.MEDICAL_DATA(patientId)
        );
    },

    /**
     * Update medical data for a patient
     * PUT /patients/:patientId/medical-data
     */
    updateMedicalData: (
        patientId: string,
        data: UpdatePatientMedicalDataRequest
    ): Promise<PatientMedicalData> => {
        return apiClient.put<PatientMedicalData, UpdatePatientMedicalDataRequest>(
            API_ROUTES.PATIENTS.MEDICAL_DATA(patientId),
            data
        );
    },

    /**
     * Delete medical data for a patient
     * DELETE /patients/:patientId/medical-data
     */
    deleteMedicalData: (patientId: string): Promise<DeleteMedicalDataResponse> => {
        return apiClient.delete<DeleteMedicalDataResponse>(
            API_ROUTES.PATIENTS.MEDICAL_DATA(patientId)
        );
    },
};