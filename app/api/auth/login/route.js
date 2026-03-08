import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from '../../../../lib/mongodb';
import { logAudit } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json({ message: 'Username and password required' }, { status: 400 });
    }

    // Check legacy admin/sociapa (fallback superuser)
    if (username === 'admin' && password === 'sociapa') {
      const cookieStore = cookies();
      cookieStore.set('admin_token', 'valid_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      cookieStore.set('session_user', 'admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      cookieStore.set('user_role', 'super_admin', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      await logAudit('LOGIN', 'Admin login (legacy)', 'admin');
      return Response.json({ success: true, role: 'super_admin', username: 'admin' });
    }

    // Check DB users
    const db = await getDb();
    const user = await db.collection('users').findOne({ username: username.toLowerCase() });

    if (!user) {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return Response.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const cookieStore = cookies();
    cookieStore.set('admin_token', 'valid_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    cookieStore.set('session_user', user.username, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    cookieStore.set('user_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    // If client role, store their clientId for portal filtering
    if (user.clientId) {
      cookieStore.set('client_id', user.clientId.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    await logAudit('LOGIN', `User login: ${user.username} (${user.role})`, user.username);

    return Response.json({ success: true, role: user.role, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
