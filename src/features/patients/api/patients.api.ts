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
    // =========================================================================
    // PATIENT CRUD
    // =========================================================================

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
     * List patients with pagination and search
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
     * Get patient basic info
     * GET /patients/:id
     */
    getById: (patientId: string): Promise<Patient> => {
        return apiClient.get<Patient>(
            API_ROUTES.PATIENTS.BY_ID(patientId)
        );
    },

    /**
     * Get patient with all medical records and their predictions
     * GET /patients/:id/detail
     */
    getDetail: (patientId: string): Promise<PatientDetail> => {
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
     * Restore a soft-deleted patient
     * POST /patients/:id/restore
     */
    restore: (patientId: string): Promise<Patient> => {
        return apiClient.post<Patient>(
            API_ROUTES.PATIENTS.RESTORE(patientId)
        );
    },

    // =========================================================================
    // MEDICAL DATA
    // =========================================================================

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
     * Get all medical records for a patient
     * GET /patients/:patientId/medical-data
     */
    getMedicalRecords: (patientId: string): Promise<PatientMedicalData[]> => {
        return apiClient.get<PatientMedicalData[]>(
            API_ROUTES.PATIENTS.MEDICAL_DATA(patientId)
        );
    },

    /**
     * Get the latest medical data record for a patient
     * GET /patients/:patientId/medical-data/latest
     */
    getLatestMedicalData: (patientId: string): Promise<PatientMedicalData> => {
        return apiClient.get<PatientMedicalData>(
            API_ROUTES.PATIENTS.MEDICAL_DATA_LATEST(patientId)
        );
    },

    /**
     * Get a specific medical data record by ID
     * GET /patients/medical-data/:medicalDataId
     */
    getMedicalDataById: (medicalDataId: string): Promise<PatientMedicalData> => {
        return apiClient.get<PatientMedicalData>(
            API_ROUTES.PATIENTS.MEDICAL_DATA_BY_ID(medicalDataId)
        );
    },

    /**
     * Update a specific medical data record
     * PUT /patients/medical-data/:medicalDataId
     */
    updateMedicalData: (
        medicalDataId: string,
        data: UpdatePatientMedicalDataRequest
    ): Promise<PatientMedicalData> => {
        return apiClient.put<PatientMedicalData, UpdatePatientMedicalDataRequest>(
            API_ROUTES.PATIENTS.MEDICAL_DATA_BY_ID(medicalDataId),
            data
        );
    },

    /**
     * Delete a specific medical data record (soft delete)
     * DELETE /patients/medical-data/:medicalDataId
     */
    deleteMedicalData: (medicalDataId: string): Promise<DeleteMedicalDataResponse> => {
        return apiClient.delete<DeleteMedicalDataResponse>(
            API_ROUTES.PATIENTS.MEDICAL_DATA_BY_ID(medicalDataId)
        );
    },
};