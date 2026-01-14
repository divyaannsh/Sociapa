
import { NextResponse } from 'next/server'
 
export function middleware(request) {
  // Check if the user is accessing the protected dashboard
  if (request.nextUrl.pathname.startsWith('/analytics/dashboard')) {
    // Check for the admin_token cookie
    const token = request.cookies.get('admin_token')
 
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: '/analytics/dashboard/:path*',
}
