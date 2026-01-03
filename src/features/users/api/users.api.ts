/**
 * Users API
 * Handles user management API calls
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    CreateUserRequest,
    UpdateUserRequest,
    ListUsersParams,
    User,
    UsersListResponse,
    DeleteUserResponse,
} from './users.types';

/**
 * Users API object with all user management methods
 */
export const usersApi = {
    /**
     * Create a new user
     * POST /users
     */
    create: (data: CreateUserRequest): Promise<User> => {
        return apiClient.post<User, CreateUserRequest>(
            API_ROUTES.USERS.BASE,
            data
        );
    },

    /**
     * List users with pagination and filters
     * GET /users
     */
    list: async (params?: ListUsersParams): Promise<UsersListResponse> => {
        const { items, pagination } = await apiClient.getPaginated<User>(
            API_ROUTES.USERS.BASE,
            { params }
        );

        return {
            users: items,
            pagination,
        };
    },

    /**
     * Get user by ID
     * GET /users/:id
     */
    getById: (userId: string): Promise<User> => {
        return apiClient.get<User>(
            API_ROUTES.USERS.BY_ID(userId)
        );
    },

    /**
     * Get user by email
     * GET /users/email/:email
     */
    getByEmail: (email: string): Promise<User> => {
        return apiClient.get<User>(
            API_ROUTES.USERS.BY_EMAIL(email)
        );
    },

    /**
     * Update user
     * PUT /users/:id
     */
    update: (userId: string, data: UpdateUserRequest): Promise<User> => {
        return apiClient.put<User, UpdateUserRequest>(
            API_ROUTES.USERS.BY_ID(userId),
            data
        );
    },

    /**
     * Delete user (soft delete)
     * DELETE /users/:id
     */
    delete: (userId: string): Promise<DeleteUserResponse> => {
        return apiClient.delete<DeleteUserResponse>(
            API_ROUTES.USERS.BY_ID(userId)
        );
    },

    /**
     * Restore soft-deleted user
     * POST /users/:id/restore
     */
    restore: (userId: string): Promise<User> => {
        return apiClient.post<User>(
            API_ROUTES.USERS.RESTORE(userId)
        );
    },
};