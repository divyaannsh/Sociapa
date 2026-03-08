import { getDb } from '../../../lib/mongodb';
import { getCurrentUser } from '../../../lib/auth';

export async function GET(request) {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['super_admin', 'manager'].includes(currentUser.role)) {
        return Response.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const db = await getDb();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const page = parseInt(searchParams.get('page') || '1');
        const action = searchParams.get('action');

        const query = {};
        if (action) query.action = action;

        const logs = await db.collection('audit_logs')
            .find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        const total = await db.collection('audit_logs').countDocuments(query);

        return Response.json({ logs, total, page, limit });
    } catch (error) {
        console.error(error);
        return Response.json({ logs: [], total: 0 });
    }
}
