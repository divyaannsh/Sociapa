import { getDb } from '../../../../lib/mongodb';
import { getCurrentUser } from '../../../../lib/auth';

// GET — fetch budget targets for a client
export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  if (!clientId) return Response.json({ message: 'clientId required' }, { status: 400 });

  try {
    if (clientId === 'gyan-static-id') {
      return Response.json({ budgets: null }); // Fallback to default budgets on client
    }
    const db = await getDb();
    const doc = await db.collection('budgetTargets').findOne({ clientId });
    return Response.json({ budgets: doc?.budgets || null });
  } catch (e) {
    console.warn("DB Error fetching budget targets:", e);
    return Response.json({ budgets: null });
  }
}

// POST — save budget targets for a client
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || !['super_admin', 'manager'].includes(user.role)) {
    return Response.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { clientId, budgets } = body;
  if (!clientId || !budgets) return Response.json({ message: 'clientId and budgets required' }, { status: 400 });

  const db = await getDb();
  await db.collection('budgetTargets').updateOne(
    { clientId },
    { $set: { clientId, budgets, updatedAt: new Date() } },
    { upsert: true }
  );
  return Response.json({ success: true });
}
