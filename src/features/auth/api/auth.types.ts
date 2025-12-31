/**
 * Auth Feature Types
 * Matches backend DTOs exactly
 */

// ============================================================================
// TOKEN TYPES
// ============================================================================

/**
 * Token information (matches backend TokenInfo)
 */
export interface TokenInfo {
    token: string;
    token_type: string;
    expires_at: string;
    created_at: string;
}

/**
 * Tokens response structure
 */
export interface AuthTokens {
    access_token: TokenInfo;
    refresh_token: TokenInfo;
}

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User response (matches backend UserResponse)
 */
export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Login request (matches backend LoginRequest)
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Register request (matches backend RegisterRequest)
 */
export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: 'DOCTOR' | 'ML_ENGINEER';
}

/**
 * Refresh token request (matches backend RefreshTokenRequest)
 */
export interface RefreshTokenRequest {
    refresh_token: string;
}

/**
 * Logout request (matches backend LogoutRequest)
 */
export interface LogoutRequest {
    user_id: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Login/Register response structure
 * Matches backend response for /auth/login and /auth/register
 */
export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
    tokens: AuthTokens;
}