// API Configuration
export const API_CONFIG = {
    DEV_BASE_URL: 'http://127.0.0.1:8000/api/v1',
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    TIMEOUT: 30000, // 30 seconds
} as const;

// Honor NEXT_PUBLIC_API_BASE_URL in every environment so devs can point at a
// non-default backend (e.g. a teammate's port, a staging host) via .env.local.
// Fall back to the dev default only when the env var is unset and we're not
// in a production build — a missing prod URL is a misconfiguration, not a
// reason to silently target localhost.
export const getApiBaseUrl = (): string => {
    if (API_CONFIG.BASE_URL) return API_CONFIG.BASE_URL;
    return process.env.NODE_ENV === 'development' ? API_CONFIG.DEV_BASE_URL : '';
};

// User Roles
export const USER_ROLES = {
    DOCTOR: 'DOCTOR',
    ADMIN: 'ADMIN',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Route Permissions - Single source of truth for route access control
export const ROUTE_PERMISSIONS = {
    // Dashboard - accessible by all authenticated users
    '/dashboard': [USER_ROLES.DOCTOR, USER_ROLES.ADMIN],

    // Doctor routes (ADMIN inherits all DOCTOR access per spec §2.1)
    '/patients': [USER_ROLES.DOCTOR, USER_ROLES.ADMIN],
    '/predictions': [USER_ROLES.DOCTOR, USER_ROLES.ADMIN],
    '/monitoring': [USER_ROLES.DOCTOR, USER_ROLES.ADMIN],
    '/similar-patients': [USER_ROLES.DOCTOR, USER_ROLES.ADMIN],

    // Admin-only routes (user management + simulations per spec §2.1 and §6).
    // Keys must match the actual URL paths the proxy sees — the `(system)`
    // route group is invisible in the URL, so the simulations page lives at
    // `/ml-engineer/bandit-demo`, not `/playground`.
    '/users': [USER_ROLES.ADMIN],
    '/models': [USER_ROLES.ADMIN],
    '/training': [USER_ROLES.ADMIN],
    '/ml-engineer/bandit-demo': [USER_ROLES.ADMIN],
} as const;

// API Routes
export const API_ROUTES = {
    AUTH: {
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
        // Spec §5: GET /patients/{id} returns PatientDetailResponse with
        // medicalRecords eagerly loaded — no /detail suffix, no /timeline,
        // and delete is permanent (no restore endpoint).
        BY_ID: (id: string) => `/patients/${id}`,
        MEDICAL_RECORDS: (patientId: string) => `/patients/${patientId}/medical-records`,
        MEDICAL_RECORD_BY_ID: (patientId: string, recordId: string) =>
            `/patients/${patientId}/medical-records/${recordId}`,
    },
    PREDICTIONS: {
        BASE: '/predictions',
        BY_ID: (id: string) => `/predictions/${id}`,
        DECISION: (id: string) => `/predictions/${id}/decision`,
        BY_PATIENT: (patientId: string) => `/predictions/patient/${patientId}`,
    },
    INFERENCE: {
        PREDICT: '/inference/predict',
        PREDICT_WITH_EXPLANATION: '/inference/predict-with-explanation',
        EXPLAIN: '/inference/explain',
        PREDICT_BATCH: '/inference/predict-batch',
    },
    SIMILAR_PATIENTS: {
        SEARCH: '/similar-patients/search',
        SEARCH_GRAPH: '/similar-patients/search/graph',
        BY_CASE_ID: (caseId: string) => `/similar-patients/${caseId}`,
    },
    SIMULATIONS: {
        BASE: '/simulations',
        BY_ID: (id: string) => `/simulations/${id}`,
        STREAM: (id: string) => `/simulations/${id}/stream`,
        CANCEL: (id: string) => `/simulations/${id}/cancel`,
        STEPS: (id: string) => `/simulations/${id}/steps`,
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

// Spec §4 machine-readable error codes. Branch on these — HTTP status alone
// cannot distinguish e.g. INVALID_CREDENTIALS from TOKEN_REVOKED (both 401).
// NETWORK_ERROR / REQUEST_FAILED are client-only synthesized codes.
export const ERROR_CODES = {
    // 400
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    BAD_REQUEST: 'BAD_REQUEST',
    RECORD_PATIENT_MISMATCH: 'RECORD_PATIENT_MISMATCH',
    TREATMENT_REQUIRED: 'TREATMENT_REQUIRED',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    INVALID_ENCODING: 'INVALID_ENCODING',
    CSV_VALIDATION_FAILED: 'CSV_VALIDATION_FAILED',
    // 401
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    AUTH_FAILED: 'AUTH_FAILED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    INVALID_TOKEN_TYPE: 'INVALID_TOKEN_TYPE',
    TOKEN_REVOKED: 'TOKEN_REVOKED',
    // 403
    ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
    FORBIDDEN: 'FORBIDDEN',
    INSUFFICIENT_ROLE: 'INSUFFICIENT_ROLE',
    // 404
    NOT_FOUND: 'NOT_FOUND',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
    PREDICTION_NOT_FOUND: 'PREDICTION_NOT_FOUND',
    SIMULATION_NOT_FOUND: 'SIMULATION_NOT_FOUND',
    // 409
    EMAIL_EXISTS: 'EMAIL_EXISTS',
    USERNAME_EXISTS: 'USERNAME_EXISTS',
    CONFLICT: 'CONFLICT',
    MAX_SIMULATIONS_REACHED: 'MAX_SIMULATIONS_REACHED',
    SIMULATION_NOT_RUNNING: 'SIMULATION_NOT_RUNNING',
    SIMULATION_NOT_CANCELLABLE: 'SIMULATION_NOT_CANCELLABLE',
    SIMULATION_RUNNING: 'SIMULATION_RUNNING',
    // 500 / 503
    MODEL_NOT_FOUND: 'MODEL_NOT_FOUND',
    EXPLANATION_FAILED: 'EXPLANATION_FAILED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    // Client-synthesized
    NETWORK_ERROR: 'NETWORK_ERROR',
    REQUEST_FAILED: 'REQUEST_FAILED',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];