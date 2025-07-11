
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const PROTECTED_ROUTE = '/admin';
const LOGIN_ROUTE = '/admin/login';
const AUTH_COOKIE_NAME = 'auth_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If the request is for the login page, let it through.
  if (pathname === LOGIN_ROUTE) {
    return NextResponse.next();
  }

  // Check for the auth cookie if the route is protected.
  if (pathname.startsWith(PROTECTED_ROUTE)) {
    const cookieStore = cookies();
    const authToken = cookieStore.get(AUTH_COOKIE_NAME);

    // If there's no valid token, redirect to the login page.
    if (!authToken) {
      const loginUrl = new URL(LOGIN_ROUTE, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes under /admin, except for static assets and API routes.
  matcher: ['/admin/:path*'],
};
