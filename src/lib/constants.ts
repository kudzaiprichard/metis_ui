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

// User Roles
export const USER_ROLES = {
    DOCTOR: 'DOCTOR',
    ML_ENGINEER: 'ML_ENGINEER',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Route Permissions - Single source of truth for route access control
export const ROUTE_PERMISSIONS = {
    // Dashboard - accessible by all authenticated users
    '/dashboard': [USER_ROLES.DOCTOR, USER_ROLES.ML_ENGINEER],

    // Doctor routes (both roles can access)
    '/patients': [USER_ROLES.DOCTOR, USER_ROLES.ML_ENGINEER],
    '/predictions': [USER_ROLES.DOCTOR, USER_ROLES.ML_ENGINEER],
    '/monitoring': [USER_ROLES.DOCTOR, USER_ROLES.ML_ENGINEER],
    '/similar-patients': [USER_ROLES.DOCTOR, USER_ROLES.ML_ENGINEER],

    // ML Team routes (ML_ENGINEER only)
    '/users': [USER_ROLES.ML_ENGINEER],
    '/models': [USER_ROLES.ML_ENGINEER],
    '/training': [USER_ROLES.ML_ENGINEER],
    '/playground': [USER_ROLES.ML_ENGINEER],
} as const;

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
        MEDICAL_DATA: (patientId: string) => `/patients/${patientId}/medical-data`,
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

// Cookie Names (for secure token storage)
export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
} as const;

// Cookie Options
export const COOKIE_OPTIONS = {
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
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