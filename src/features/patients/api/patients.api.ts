/**
 * Patients API — spec §5 "Module: Patients".
 *
 * Endpoints covered:
 *   POST   /patients
 *   GET    /patients
 *   GET    /patients/{id}                         (returns PatientDetailResponse)
 *   PATCH  /patients/{id}
 *   DELETE /patients/{id}                         (permanent; no restore)
 *   POST   /patients/{id}/medical-records
 *   GET    /patients/{id}/medical-records
 *   GET    /patients/{id}/medical-records/{record_id}
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    CreatePatientRequest,
    UpdatePatientRequest,
    CreateMedicalRecordRequest,
    ListPatientsParams,
    ListMedicalRecordsParams,
    Patient,
    PatientDetail,
    MedicalRecord,
    PatientsListResponse,
} from './patients.types';

export const patientsApi = {
    // =========================================================================
    // PATIENT CRUD
    // =========================================================================

    /**
     * Create a new patient demographic record.
     * POST /patients → 201 PatientResponse
     */
    create: (data: CreatePatientRequest): Promise<Patient> => {
        return apiClient.post<Patient, CreatePatientRequest>(
            API_ROUTES.PATIENTS.BASE,
            data
        );
    },

    /**
     * List patients with pagination.
     * GET /patients — spec §3.2 returns camelCase pagination keys. The shared
     * ApiClient.getPaginated helper is still typed with the legacy snake_case
     * fallback, so we normalize here to the spec shape.
     */
    list: async (params?: ListPatientsParams): Promise<PatientsListResponse> => {
        const { items, pagination } = await apiClient.getPaginated<Patient>(
            API_ROUTES.PATIENTS.BASE,
            { params }
        );

        const p = pagination as unknown as Partial<{
            page: number;
            pageSize: number;
            page_size: number;
            total: number;
            totalPages: number;
            total_pages: number;
        }>;

        return {
            patients: items,
            pagination: {
                page: p.page ?? 1,
                pageSize: p.pageSize ?? p.page_size ?? 20,
                total: p.total ?? 0,
                totalPages: p.totalPages ?? p.total_pages ?? 0,
            },
        };
    },

    /**
     * Get a patient with all medical records eagerly loaded.
     * GET /patients/:id → 200 PatientDetailResponse
     * Errors: NOT_FOUND (404)
     */
    getById: (patientId: string): Promise<PatientDetail> => {
        return apiClient.get<PatientDetail>(
            API_ROUTES.PATIENTS.BY_ID(patientId)
        );
    },

    /**
     * Update patient demographic fields (partial).
     * PATCH /patients/:id — spec §5 uses PATCH, not PUT.
     * Errors: NOT_FOUND (404)
     */
    update: (patientId: string, data: UpdatePatientRequest): Promise<Patient> => {
        return apiClient.patch<Patient, UpdatePatientRequest>(
            API_ROUTES.PATIENTS.BY_ID(patientId),
            data
        );
    },

    /**
     * Permanently delete a patient and all their medical records (cascade).
     * DELETE /patients/:id — spec §5: no restore endpoint exists.
     * Errors: NOT_FOUND (404)
     */
    delete: (patientId: string): Promise<null> => {
        return apiClient.delete<null>(
            API_ROUTES.PATIENTS.BY_ID(patientId)
        );
    },

    // =========================================================================
    // MEDICAL RECORDS
    // =========================================================================

    /**
     * Add a clinical medical record to a patient.
     * POST /patients/:id/medical-records → 201 MedicalRecordResponse
     */
    createMedicalRecord: (
        patientId: string,
        data: CreateMedicalRecordRequest
    ): Promise<MedicalRecord> => {
        return apiClient.post<MedicalRecord, CreateMedicalRecordRequest>(
            API_ROUTES.PATIENTS.MEDICAL_RECORDS(patientId),
            data
        );
    },

    /**
     * List medical records for a patient.
     * GET /patients/:id/medical-records → 200 MedicalRecordResponse[]
     * Query params: skip (≥0, default 0), limit (1–100, default 50).
     * Errors: NOT_FOUND (404)
     */
    listMedicalRecords: (
        patientId: string,
        params?: ListMedicalRecordsParams
    ): Promise<MedicalRecord[]> => {
        return apiClient.get<MedicalRecord[]>(
            API_ROUTES.PATIENTS.MEDICAL_RECORDS(patientId),
            { params }
        );
    },

    /**
     * Get a single medical record.
     * GET /patients/:id/medical-records/:recordId → 200 MedicalRecordResponse
     * Errors: NOT_FOUND (404)
     */
    getMedicalRecord: (patientId: string, recordId: string): Promise<MedicalRecord> => {
        return apiClient.get<MedicalRecord>(
            API_ROUTES.PATIENTS.MEDICAL_RECORD_BY_ID(patientId, recordId)
        );
    },
};
