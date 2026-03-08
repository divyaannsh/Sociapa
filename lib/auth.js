import { cookies } from 'next/headers';
import { getDb } from './mongodb';

export async function getCurrentUser() {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');
    const username = cookieStore.get('session_user');
    const role = cookieStore.get('user_role');

    if (!token || token.value !== 'valid_token') return null;

    return {
        username: username?.value || 'admin',
        role: role?.value || 'super_admin',
    };
}

export function requireRole(allowedRoles) {
    return async (req) => {
        const user = await getCurrentUser();
        if (!user) return false;
        return allowedRoles.includes(user.role);
    };
}

export async function logAudit(action, details, username = 'system') {
    try {
        const db = await getDb();
        await db.collection('audit_logs').insertOne({
            username,
            action,
            details,
            timestamp: new Date(),
            ip: null,
        });
    } catch (err) {
        console.error('Audit log error:', err);
    }
}
