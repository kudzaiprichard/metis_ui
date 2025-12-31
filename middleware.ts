import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTE_PERMISSIONS } from '@/lib/constants';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/unauthorized'];

/**
 * Verify token with backend API
 * Makes an actual request to the backend to validate the token
 */
async function verifyToken(token: string): Promise<{ role?: string } | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Don't cache auth checks
        });

        if (!response.ok) {
            return null;
        }

        const user = await response.json();
        return { role: user.role };
    } catch (error) {
        return null;
    }
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

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') // files with extensions
    ) {
        return NextResponse.next();
    }

    // Get access token from cookies
    const token = request.cookies.get('access_token')?.value;

    // Redirect to unauthorized if no token
    if (!token) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Verify token with backend
    const user = await verifyToken(token);

    // Invalid or expired token - clear cookies and redirect to unauthorized
    if (!user) {
        const response = NextResponse.redirect(new URL('/unauthorized', request.url));
        // Clear invalid tokens from cookies
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');

        return response;
    }

    // Check role-based permissions using ROUTE_PERMISSIONS from constants
    const userRole = user.role;
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
         * Match all paths except:
         * - _next (Next.js internals)
         * - api (API routes)
         * - static files (with extensions)
         * - favicon.ico
         */
        '/((?!_next|api|.*\\..*|favicon.ico).*)',
    ],
};