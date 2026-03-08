import { cookies } from 'next/headers';


export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');
    const username = cookieStore.get('session_user');
    const role = cookieStore.get('user_role');
    const clientId = cookieStore.get('client_id');

    if (!token || token.value !== 'valid_token') {
      return Response.json({ authenticated: false });
    }

    return Response.json({
      authenticated: true,
      username: username?.value || 'admin',
      role: role?.value || 'super_admin',
      clientId: clientId?.value || null,
    });
  } catch (error) {
    return Response.json({ authenticated: false });
  }
}
