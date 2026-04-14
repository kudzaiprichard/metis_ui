/**
 * Users Hooks
 * React Query hooks for user management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import {
    CreateUserRequest,
    UpdateUserRequest,
    ListUsersParams,
} from '../api/users.types';
import {ApiError} from "@/src/lib/types";

/**
 * Query keys for users
 */
const usersKeys = {
    all: ['users'] as const,
    lists: () => [...usersKeys.all, 'list'] as const,
    list: (params?: ListUsersParams) => [...usersKeys.lists(), params] as const,
    details: () => [...usersKeys.all, 'detail'] as const,
    detail: (id: string) => [...usersKeys.details(), id] as const,
};

/**
 * Hook to list users with pagination and filters
 */
export const useUsers = (params?: ListUsersParams) => {
    return useQuery({
        queryKey: usersKeys.list(params),
        queryFn: () => usersApi.list(params),
        staleTime: 3 * 60 * 1000, // 3 minutes
    });
};

/**
 * Hook to get a single user by ID
 */
export const useUser = (userId: string) => {
    return useQuery({
        queryKey: usersKeys.detail(userId),
        queryFn: () => usersApi.getById(userId),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!userId, // Only fetch if userId exists
    });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateUserRequest) => usersApi.create(data),
        onSuccess: () => {
            // Invalidate users list to refetch with new user
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        },
        onError: (error: ApiError) => {
            console.error('Create user failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to update a user
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
            usersApi.update(userId, data),
        onSuccess: (updatedUser) => {
            // Invalidate users list
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() });

            // Update specific user detail cache
            queryClient.setQueryData(usersKeys.detail(updatedUser.id), updatedUser);
        },
        onError: (error: ApiError) => {
            console.error('Update user failed:', error.getFullMessage());
        },
    });
};

/**
 * Hook to delete a user permanently (spec §5: DELETE is not reversible)
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => usersApi.delete(userId),
        onSuccess: () => {
            // Invalidate users list to refetch
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        },
        onError: (error: ApiError) => {
            console.error('Delete user failed:', error.getFullMessage());
        },
    });
};