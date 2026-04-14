/**
 * Users API — admin-only user management (spec §5 Module: Users).
 */

import { apiClient } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/lib/constants';
import {
    CreateUserRequest,
    UpdateUserRequest,
    ListUsersParams,
    User,
    UsersListResponse,
} from './users.types';

export const usersApi = {
    /**
     * Create a new user
     * POST /users
     * Errors: EMAIL_EXISTS (409), USERNAME_EXISTS (409), VALIDATION_ERROR (400)
     */
    create: (data: CreateUserRequest): Promise<User> => {
        return apiClient.post<User, CreateUserRequest>(
            API_ROUTES.USERS.BASE,
            data
        );
    },

    /**
     * List users with pagination and filters
     * GET /users — spec §3.2 returns camelCase pagination keys (pageSize,
     * totalPages). The shared ApiClient.getPaginated helper is still typed
     * with the legacy snake_case fallback (see Shared gaps in fix.md), so we
     * normalize here to the spec shape.
     */
    list: async (params?: ListUsersParams): Promise<UsersListResponse> => {
        const { items, pagination } = await apiClient.getPaginated<User>(
            API_ROUTES.USERS.BASE,
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
            users: items,
            pagination: {
                page: p.page ?? 1,
                pageSize: p.pageSize ?? p.page_size ?? 20,
                total: p.total ?? 0,
                totalPages: p.totalPages ?? p.total_pages ?? 0,
            },
        };
    },

    /**
     * Get user by ID
     * GET /users/:id
     * Errors: USER_NOT_FOUND (404)
     */
    getById: (userId: string): Promise<User> => {
        return apiClient.get<User>(
            API_ROUTES.USERS.BY_ID(userId)
        );
    },

    /**
     * Update user (partial)
     * PATCH /users/:id — spec §5 uses PATCH, not PUT.
     * Errors: USER_NOT_FOUND (404), USERNAME_EXISTS (409)
     */
    update: (userId: string, data: UpdateUserRequest): Promise<User> => {
        return apiClient.patch<User, UpdateUserRequest>(
            API_ROUTES.USERS.BY_ID(userId),
            data
        );
    },

    /**
     * Delete user permanently (no restore endpoint per spec)
     * DELETE /users/:id
     * Errors: USER_NOT_FOUND (404)
     */
    delete: (userId: string): Promise<null> => {
        return apiClient.delete<null>(
            API_ROUTES.USERS.BY_ID(userId)
        );
    },
};
