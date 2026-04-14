/**
 * Users Feature Types — matches backend UserResponse / CreateUserRequest /
 * UpdateUserRequest / list query params (spec §5 Module: Users).
 *
 * Convention: response DTOs are camelCase on the wire; request bodies use
 * snake_case (Pydantic serializes the Python model directly). List-endpoint
 * query parameters are camelCase (`pageSize`, `isActive`).
 */

import { UserRole } from '@/src/lib/constants';

// ============================================================================
// USER RESPONSE (camelCase on wire)
// ============================================================================

export interface User {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string; // "ADMIN" | "DOCTOR"
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// REQUEST BODIES (snake_case on wire)
// ============================================================================

export interface CreateUserRequest {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    role: UserRole;
}

export interface UpdateUserRequest {
    first_name?: string;
    last_name?: string;
    username?: string;
    role?: UserRole;
    is_active?: boolean;
}

// ============================================================================
// LIST QUERY PARAMS (camelCase on wire — spec §3.2 / §5)
// ============================================================================

export interface ListUsersParams {
    page?: number;
    pageSize?: number;
    role?: UserRole;
    isActive?: boolean;
}

// ============================================================================
// RESPONSE ENVELOPES
// ============================================================================

export interface UsersListResponse {
    users: User[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}
