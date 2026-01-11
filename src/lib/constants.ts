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
        BY_ID_DETAIL: (id: string) => `/patients/${id}/detail`, // ← Patient with medical data
        MEDICAL_DATA: (patientId: string) => `/patients/${patientId}/medical-data`,
        RESTORE: (id: string) => `/patients/${id}/restore`,
        TIMELINE: (patientId: string) => `/patients/${patientId}/timeline`,
    },
    PREDICTIONS: {
        BASE: '/predictions',
        BY_ID: (id: string) => `/predictions/${id}`,
    },
    RECOMMENDATION: {
        BASE: '/recommendation',
        GENERATE: '/recommendation/generate',
        BY_ID: (id: string) => `/recommendation/${id}`,
    },
    TREATMENT_DECISIONS: {
        BASE: '/treatment-decisions',
        BY_ID: (id: string) => `/treatment-decisions/${id}`,
        BY_PATIENT: (patientId: string) => `/treatment-decisions/patient/${patientId}`,
        UPDATE_OUTCOME: (id: string) => `/treatment-decisions/${id}/outcome`,
    },
    FOLLOW_UPS: {
        BASE: '/follow-ups',
        SCHEDULE: '/follow-ups/schedule',
        BY_ID: (id: string) => `/follow-ups/${id}`,
        BY_PATIENT: (patientId: string) => `/follow-ups/patient/${patientId}`,
        COMPLETE: (id: string) => `/follow-ups/${id}/complete`,
        CANCEL: (id: string) => `/follow-ups/${id}/cancel`,
        UPCOMING: '/follow-ups/upcoming',
    },
    MONITORING: {
        BASE: '/monitoring',
        BY_ID: (id: string) => `/monitoring/${id}`,
    },
    MODELS: {
        BASE: '/models',
        BY_ID: (id: string) => `/models/${id}`,
    },
    ML_MODELS: {
        BASE: '/ml/models',
        BY_VERSION: (version: string) => `/ml/models/${version}`,
        ACTIVE: '/ml/models/active',
        ACTIVATE: (version: string) => `/ml/models/${version}/activate`,
        STATUS: '/ml/models/status',
        COMPARE: '/ml/models/compare',
        LINEAGE: (version: string) => `/ml/models/${version}/lineage`,
    },
    BATCH_PREDICTIONS: {
        BASE: '/ml/batch-predictions',
        SUMMARY: '/ml/batch-predictions/summary',
    },
    ONLINE_LEARNING: {
        BASE: '/ml/training/online-learning',
        STATUS: '/ml/training/status',
    },
    SIMILAR_PATIENTS: {
        SEARCH: '/similar-patients/search',
        SEARCH_GRAPH: '/similar-patients/search/graph',
        BY_CASE_ID: (caseId: string) => `/similar-patients/${caseId}`,
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