import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/assets/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Allow access to login pages
  if (pathname === '/login' || pathname === '/client-portal/login') {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // BYPASS LOGIN: Automatically inject super_admin cookies 
  // if they are not present, instead of redirecting to /login
  const token = request.cookies.get('admin_token');
  if (!token || token.value !== 'valid_token') {
    response.cookies.set('admin_token', 'valid_token', { path: '/' });
    response.cookies.set('session_user', 'admin', { path: '/' });
    response.cookies.set('user_role', 'super_admin', { path: '/' });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
}
