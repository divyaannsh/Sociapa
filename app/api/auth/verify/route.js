import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const token = cookies().get('admin_token');
    
    if (token && token.value === 'valid_token') {
      return new Response(JSON.stringify({ authenticated: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
