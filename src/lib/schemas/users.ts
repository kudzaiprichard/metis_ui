/**
 * User CRUD form schemas (admin-side, spec §2.2 / §5).
 * `userCreateSchema` is the create-user payload; `userEditSchema` is the
 * update-user payload (no email/password). The two shapes are intentionally
 * separate because the API treats them as distinct.
 */

import { z } from 'zod';

import { USER_ROLES } from '@/src/lib/constants';
import { email, password, personName, username } from './fields';

const role = z.enum([USER_ROLES.DOCTOR, USER_ROLES.ADMIN]);

export const userCreateSchema = z.object({
    firstName: personName,
    lastName: personName,
    email,
    username,
    password,
    role,
});
export type UserCreateValues = z.infer<typeof userCreateSchema>;

export const userEditSchema = z.object({
    firstName: personName,
    lastName: personName,
    username,
    role,
    isActive: z.boolean(),
});
export type UserEditValues = z.infer<typeof userEditSchema>;
