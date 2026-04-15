/**
 * Auth form schemas — login, profile-edit, password-change.
 * Self-registration was removed from this build; admin-created accounts
 * use `userCreateSchema` in `./users.ts` instead.
 */

import { z } from 'zod';

import { email, password, personName, username } from './fields';

export const loginSchema = z.object({
    email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * PATCH /auth/me — every field optional; only changed fields are sent.
 * Email is included so users can update their login email from the
 * profile page; password change has its own dedicated schema below.
 */
export const profileSchema = z.object({
    firstName: personName,
    lastName: personName,
    username,
    email,
});
export type ProfileFormValues = z.infer<typeof profileSchema>;

/**
 * Profile-side password change. The current password is required (the
 * backend should re-verify it before issuing a new credential), the new
 * password follows the standard 8-128 char rule, and the confirm field
 * must match.
 */
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Enter your current password'),
        newPassword: password,
        confirmPassword: z.string().min(1, 'Confirm your new password'),
    })
    .refine((v) => v.newPassword === v.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
    .refine((v) => v.newPassword !== v.currentPassword, {
        message: 'Choose a new password — this matches the current one',
        path: ['newPassword'],
    });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
