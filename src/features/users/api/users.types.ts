/**
 * Users Feature Types
 */

import { UserRole } from "@/src/lib/constants";

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User entity
 */
export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Data required to create a new user
 */
export interface CreateUserRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: UserRole;
}

/**
 * Data for updating user details
 */
export interface UpdateUserRequest {
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: UserRole;
    password?: string;
}

/**
 * Parameters for filtering and paginating users list
 */
export interface ListUsersParams {
    page?: number;
    per_page?: number;
    role?: UserRole;
    search?: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Paginated list of users
 */
export interface UsersListResponse {
    users: User[];
    pagination: {
        page: number;
        page_size: number;
        total: number;
        total_pages: number;
    };
}

/**
 * Confirmation of user deletion
 */
export interface DeleteUserResponse {
    deleted: boolean;
    user_id: string;
}