
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Simple hardcoded check for demonstration
    // In a real app, you'd check against a database and hash passwords
    if (username === 'admin' && password === 'admin123') {
      // Set a cookie
      cookies().set('admin_token', 'valid_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
