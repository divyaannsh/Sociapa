import bcrypt from 'bcryptjs';
import { getDb } from '../../../lib/mongodb';
import { getCurrentUser, logAudit } from '../../../lib/auth';

export async function GET(request) {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['super_admin', 'manager'].includes(currentUser.role)) {
        return Response.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const db = await getDb();
        const users = await db.collection('users').find({}, { projection: { passwordHash: 0 } }).toArray();
        return Response.json({ users });
    } catch (error) {
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
        return Response.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { username, password, role, displayName, clientId } = body;

        if (!username || !password || !role) {
            return Response.json({ message: 'username, password, and role are required' }, { status: 400 });
        }

        const validRoles = ['super_admin', 'manager', 'viewer', 'client'];
        if (!validRoles.includes(role)) {
            return Response.json({ message: 'Invalid role' }, { status: 400 });
        }

        const db = await getDb();
        const existing = await db.collection('users').findOne({ username: username.toLowerCase() });
        if (existing) {
            return Response.json({ message: 'Username already exists' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const result = await db.collection('users').insertOne({
            username: username.toLowerCase(),
            passwordHash,
            role,
            displayName: displayName || username,
            clientId: clientId || null,
            createdAt: new Date(),
            createdBy: currentUser.username,
        });

        await logAudit('USER_CREATE', `Created user: ${username} with role: ${role}`, currentUser.username);

        return Response.json({ message: 'User created successfully', userId: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error(error);
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
        return Response.json({ message: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');
        const { ObjectId } = await import('mongodb');

        const db = await getDb();
        await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

        await logAudit('USER_DELETE', `Deleted user ID: ${userId}`, currentUser.username);

        return Response.json({ message: 'User deleted' });
    } catch (error) {
        return Response.json({ message: 'Internal server error' }, { status: 500 });
    }
}
