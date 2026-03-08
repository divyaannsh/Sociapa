import { cookies } from 'next/headers';
import { logAudit } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const username = cookieStore.get('session_user')?.value || 'unknown';

    await logAudit('LOGOUT', `User logged out: ${username}`, username);

    cookieStore.delete('admin_token');
    cookieStore.delete('session_user');
    cookieStore.delete('user_role');
    cookieStore.delete('client_id');

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ message: 'Error logging out' }, { status: 500 });
  }
}
