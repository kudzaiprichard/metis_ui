/**
 * Module augmentation for axios — adds the project's custom retry flags so
 * they type-check on `AxiosRequestConfig` everywhere without `as any` casts.
 *
 * The interceptor in `src/lib/api-client.ts` reads these flags to decide
 * whether a 401 should trigger a refresh-and-retry cycle (`_skipAuthRetry`)
 * and to dedupe its own retries (`_retry`).
 */

import 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig {
        /**
         * When `true`, the response interceptor will not attempt to refresh
         * the token and replay the request on a 401. Use for endpoints
         * where a 401 means "wrong credentials" (login, register) rather
         * than "expired token".
         */
        _skipAuthRetry?: boolean;

        /**
         * Internal flag set by the interceptor to mark a request that is
         * already a retry. Prevents infinite refresh loops.
         */
        _retry?: boolean;
    }

    export interface InternalAxiosRequestConfig {
        _skipAuthRetry?: boolean;
        _retry?: boolean;
    }
}
