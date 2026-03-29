/**
 * Auth Feature Types
 * Matches backend DTOs exactly
 */

// ============================================================================
// ROLE TYPES & ENUM
// ============================================================================

/**
 * User role enum — spec §2.1 defines exactly two roles.
 */
export enum UserRole {
    DOCTOR = 'DOCTOR',
    ADMIN = 'ADMIN'
}

/**
 * Normalize role strings from the wire to the enum.
 */
export function normalizeUserRole(role: string): UserRole {
    const normalized = role.toUpperCase().trim();

    if (normalized === 'ADMIN') {
        return UserRole.ADMIN;
    }

    if (normalized === 'DOCTOR' || normalized === 'DR') {
        return UserRole.DOCTOR;
    }

    return UserRole.DOCTOR;
}

// ============================================================================
// TOKEN TYPES
// ============================================================================

/**
 * Tokens response structure — spec §2.2 / §2.5: flat JWT strings.
 */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User response — matches backend UserResponse (spec §2.8).
 */
export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string; // "ADMIN" | "DOCTOR" on the wire; normalize via normalizeUserRole
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Login request (matches backend LoginRequest)
 */
export interface LoginRequest {
    email: string;
    password: string;
}

// `RegisterRequest` is intentionally absent — self-registration was removed
// from the auth surface. Admin-created users go through `CreateUserRequest`
// in `src/features/users/api/users.types.ts`.

/**
 * Refresh token request (matches backend RefreshTokenRequest)
 */
export interface RefreshTokenRequest {
    refresh_token: string;
}

/**
 * Update-profile request — spec §2.8 PATCH /auth/me. All fields optional.
 * Wire fields are snake_case (Pydantic serializes the Python model directly).
 *
 * `email`, `password`, and `current_password` are sent when the user edits
 * their login credentials on the profile page. The backend rejects fields
 * it does not recognise; the client surfaces those errors in a toast.
 */
export interface UpdateProfileRequest {
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    password?: string;
    current_password?: string;
}

/**
 * Logout request (matches backend LogoutRequest)
 */
export interface LogoutRequest {
    user_id: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Login/Register response structure
 * Matches backend response for /auth/login and /auth/register
 */
export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
}

/**
 * Refresh token response — spec §2.5: `value` is the flat token pair, no `tokens` wrapper.
 */
export type RefreshTokenResponse = AuthTokens;