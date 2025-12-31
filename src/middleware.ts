import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTE_PERMISSIONS } from '@/lib/constants';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register'];

/**
 * Decode JWT token (basic implementation - only reads payload)
 * Note: This doesn't verify signature, just reads the token
 */
function decodeToken(token: string): { role?: string; exp?: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return payload;
    } catch {
        return null;
    }
}

/**
 * Check if token is expired
 */
function isTokenExpired(exp?: number): boolean {
    if (!exp) return true;
    return Date.now() >= exp * 1000;
}

/**
 * Check if user has permission to access route
 */
function hasPermission(userRole: string, pathname: string): boolean {
    // Find matching route pattern from ROUTE_PERMISSIONS
    for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
        if (pathname.startsWith(route)) {
            return allowedRoles.includes(userRole as never);
        }
    }

    // If no specific permission defined, allow access
    return true;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    // Allow static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Get access token from cookies
    const token = request.cookies.get('access_token')?.value;

    // Redirect to login if no token
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Decode and validate token
    const decoded = decodeToken(token);

    if (!decoded) {
        // Invalid token - redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check if token is expired
    if (isTokenExpired(decoded.exp)) {
        // Token expired - redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check role-based permissions using ROUTE_PERMISSIONS from constants
    const userRole = decoded.role;
    if (userRole && !hasPermission(userRole, pathname)) {
        // User doesn't have permission - redirect to unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Allow request to proceed
    return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    ],
};