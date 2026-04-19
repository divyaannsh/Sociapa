import { getDb } from '../../../../lib/mongodb';
import { getCurrentUser } from '../../../../lib/auth';

// GET — list all schedules (filtered by client if viewer/manager)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const schedules = await db.collection('reportSchedules')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return Response.json({ schedules });
}

// POST — create a new schedule
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || !['super_admin', 'manager'].includes(user.role)) {
    return Response.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { clientId, clientName, email, period, dayOfWeek } = body;

    if (!clientId || !email || !period) {
      return Response.json({ message: 'clientId, email, and period are required' }, { status: 400 });
    }

    const db = await getDb();
    const doc = {
      clientId,
      clientName: clientName || 'Unknown Client',
      email,
      period,
      dayOfWeek: dayOfWeek || 'monday',
      status: 'active',
      lastSent: new Date(),
      createdAt: new Date(),
      createdBy: user.username,
    };

    const result = await db.collection('reportSchedules').insertOne(doc);
    return Response.json({ success: true, scheduleId: result.insertedId, schedule: { ...doc, _id: result.insertedId } });
  } catch (err) {
    return Response.json({ message: 'Failed to save schedule', error: err.message }, { status: 500 });
  }
}

// DELETE — remove a schedule by id
export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user || !['super_admin', 'manager'].includes(user.role)) {
    return Response.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ message: 'id required' }, { status: 400 });

  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  await db.collection('reportSchedules').deleteOne({ _id: new ObjectId(id) });
  return Response.json({ success: true });
}

// PATCH — toggle status active/paused
export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user || !['super_admin', 'manager'].includes(user.role)) {
    return Response.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { id, status } = body;
  if (!id) return Response.json({ message: 'id required' }, { status: 400 });

  const db = await getDb();
  const { ObjectId } = await import('mongodb');
  await db.collection('reportSchedules').updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  );
  return Response.json({ success: true });
}
