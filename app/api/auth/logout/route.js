import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Clear the authentication cookie
    cookies().delete('admin_token');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Logout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
