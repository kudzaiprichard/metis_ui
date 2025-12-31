// Backend API Response Types

/**
 * Error detail structure from backend
 */
export interface ErrorDetail {
    title: string;
    code?: string;
    details?: string[];
    status: number;
    field_errors?: Record<string, string[]>;
}

/**
 * Generic API response wrapper (matches backend ApiResponse)
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    value?: T;
    error?: ErrorDetail;
}

/**
 * Paginated response structure (matches backend PaginatedResponse)
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
    pagination?: {
        page: number;
        total: number;
        page_size: number;
        total_pages: number;
    };
}

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
    public statusCode: number;
    public code?: string;
    public details?: string[];
    public fieldErrors?: Record<string, string[]>;

    constructor(error: ErrorDetail, message?: string) {
        super(message || error.title);
        this.name = 'ApiError';
        this.statusCode = error.status;
        this.code = error.code;
        this.details = error.details;
        this.fieldErrors = error.field_errors;

        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * Get all error messages as a single string
     */
    getAllMessages(): string {
        const messages: string[] = [this.message];

        if (this.details && this.details.length > 0) {
            messages.push(...this.details);
        }

        if (this.fieldErrors) {
            Object.entries(this.fieldErrors).forEach(([field, errors]) => {
                errors.forEach(error => {
                    messages.push(`${field}: ${error}`);
                });
            });
        }

        return messages.join('. ');
    }

    /**
     * Check if error has field-specific errors
     */
    hasFieldErrors(): boolean {
        return !!this.fieldErrors && Object.keys(this.fieldErrors).length > 0;
    }
}