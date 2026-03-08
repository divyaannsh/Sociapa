import { getDb } from '../../../lib/mongodb';
import { getCurrentUser, logAudit } from '../../../lib/auth';

export async function GET(request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = await getDb();
        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';

        const query = {};
        if (currentUser.role !== 'super_admin') {
            query.targetUsername = { $in: [currentUser.username, 'all'] };
        }
        if (unreadOnly) {
            query.read = false;
        }

        const notifications = await db.collection('notifications')
            .find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        const count = await db.collection('notifications').countDocuments({ ...query, read: false });

        return Response.json({ notifications, count });
    } catch (error) {
        console.error(error);
        return Response.json({ notifications: [], count: 0 });
    }
}

export async function POST(request) {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['super_admin', 'manager'].includes(currentUser.role)) {
        return Response.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { title, message, type = 'info', clientId, threshold } = body;

        const db = await getDb();
        const result = await db.collection('notifications').insertOne({
            title,
            message,
            type, // info, warning, alert, success
            clientId: clientId || null,
            threshold: threshold || null,
            targetUsername: 'all',
            read: false,
            createdAt: new Date(),
            createdBy: currentUser.username,
        });

        return Response.json({ message: 'Notification created', id: result.insertedId }, { status: 201 });
    } catch (error) {
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const markAll = searchParams.get('all') === 'true';
        const { ObjectId } = await import('mongodb');
        const db = await getDb();

        if (markAll) {
            await db.collection('notifications').updateMany({ read: false }, { $set: { read: true } });
        } else if (id) {
            await db.collection('notifications').updateOne(
                { _id: new ObjectId(id) },
                { $set: { read: true } }
            );
        }

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}
