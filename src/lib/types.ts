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
 * Structured error messages returned by getAllMessages()
 */
export interface ApiErrorMessages {
    message: string;                              // Main error message from backend
    details: string[];                            // Array of detail messages
    fieldErrors: Record<string, string[]>;        // Field-specific errors
}

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
    public statusCode: number;
    public code?: string;
    public details?: string[];
    public fieldErrors?: Record<string, string[]>;
    public backendMessage?: string;  // The main message from backend

    constructor(error: ErrorDetail, message?: string) {
        // Use the title as the Error.message for stack traces
        super(error.title);
        this.name = 'ApiError';
        this.statusCode = error.status;
        this.code = error.code;
        this.details = error.details;
        this.fieldErrors = error.field_errors;
        this.backendMessage = message;  // Store backend message separately

        // Maintains proper stack trace for where our error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * Get the primary error message (for display in toasts, alerts, etc.)
     * This is the main user-facing message from the backend
     *
     * @returns The main error message
     *
     * @example
     * ```typescript
     * showToast('Error', error.getMessage(), 'error');
     * ```
     */
    getMessage(): string {
        return this.backendMessage || this.message;
    }

    /**
     * Get all error messages as a structured object
     * Useful when you need access to both the main message and details
     *
     * @returns Object containing message, details, and field errors
     *
     * @example
     * ```typescript
     * const { message, details, fieldErrors } = error.getAllMessages();
     * console.log('Main:', message);
     * console.log('Details:', details);
     * ```
     */
    getAllMessages(): ApiErrorMessages {
        return {
            message: this.getMessage(),
            details: this.details || [],
            fieldErrors: this.fieldErrors || {},
        };
    }

    /**
     * Get all messages as a single concatenated string
     * Useful for logging or when you need everything in one string
     *
     * @returns All messages joined with '. '
     *
     * @example
     * ```typescript
     * console.error('Full error:', error.getFullMessage());
     * // Output: "Login failed. Invalid email or password. Email must be valid"
     * ```
     */
    getFullMessage(): string {
        const messages: string[] = [this.getMessage()];

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
     * Check if error has additional detail messages
     *
     * @returns true if there are detail messages beyond the main message
     */
    hasDetails(): boolean {
        return (this.details && this.details.length > 0) || false;
    }

    /**
     * Check if error has field-specific errors
     *
     * @returns true if there are field validation errors
     */
    hasFieldErrors(): boolean {
        return !!this.fieldErrors && Object.keys(this.fieldErrors).length > 0;
    }

    /**
     * Get errors for a specific field
     * Useful for form validation
     *
     * @param fieldName - The field name to get errors for
     * @returns Array of error messages for the field, or empty array
     *
     * @example
     * ```typescript
     * const emailErrors = error.getFieldErrors('email');
     * // Returns: ["Email must be valid", "Email is required"]
     * ```
     */
    getFieldErrors(fieldName: string): string[] {
        return this.fieldErrors?.[fieldName] || [];
    }
}