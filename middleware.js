
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

  // Allow access to login page
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // For all other routes, check authentication
  const token = request.cookies.get('admin_token');
  
  if (!token || token.value !== 'valid_token') {
    // Redirect to login if no valid token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next()
}
 
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
}
