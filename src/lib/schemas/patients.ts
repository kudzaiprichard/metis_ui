/**
 * Patient + medical-record form schemas (spec §5).
 */

import { z } from 'zod';

import { email, personName } from './fields';
import { clinicalFeaturesSchema } from './clinical';

const gender = z.enum(['male', 'female', 'other'], {
    message: 'Gender is required',
});

export const patientCreateSchema = z.object({
    firstName: personName,
    lastName: personName,
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender,
    email: z.union([email, z.literal('')]).optional(),
    phone: z.string().max(20, 'Phone must be ≤ 20 characters').optional(),
    address: z.string().max(500, 'Address must be ≤ 500 characters').optional(),
});
export type PatientCreateValues = z.infer<typeof patientCreateSchema>;

const NOTES_MAX = 1000;

export const medicalRecordCreateSchema = clinicalFeaturesSchema.extend({
    notes: z.string().max(NOTES_MAX, `Notes must be ≤ ${NOTES_MAX} characters`),
});
export type MedicalRecordCreateValues = z.infer<typeof medicalRecordCreateSchema>;
