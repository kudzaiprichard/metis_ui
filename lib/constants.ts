// API Configuration
export const API_CONFIG = {
    DEV_BASE_URL: 'http://127.0.0.1:1234/api/v1',
    PROD_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    TIMEOUT: 30000, // 30 seconds
} as const;

// Get the appropriate base URL based on environment
export const getApiBaseUrl = (): string => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment ? API_CONFIG.DEV_BASE_URL : API_CONFIG.PROD_BASE_URL;
};

// API Routes
export const API_ROUTES = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
    },
    USERS: {
        BASE: '/users',
        BY_ID: (id: string) => `/users/${id}`,
        BY_EMAIL: (email: string) => `/users/email/${email}`,
        RESTORE: (id: string) => `/users/${id}/restore`,
    },
    PATIENTS: {
        BASE: '/patients',
        BY_ID: (id: string) => `/patients/${id}`,
    },
    PREDICTIONS: {
        BASE: '/predictions',
        BY_ID: (id: string) => `/predictions/${id}`,
    },
    MONITORING: {
        BASE: '/monitoring',
        BY_ID: (id: string) => `/monitoring/${id}`,
    },
    MODELS: {
        BASE: '/models',
        BY_ID: (id: string) => `/models/${id}`,
    },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// User Roles
export const USER_ROLES = {
    DOCTOR: 'DOCTOR',
    ML_ENGINEER: 'ML_ENGINEER',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];