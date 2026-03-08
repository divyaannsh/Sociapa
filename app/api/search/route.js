import { getDb } from '../../../lib/mongodb';
import { getCurrentUser } from '../../../lib/auth';

export async function GET(request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.trim();

        if (!q || q.length < 2) {
            return Response.json({ results: { clients: [], campaigns: [] } });
        }

        const db = await getDb();
        const regex = new RegExp(q, 'i');

        // Search clients
        const clients = await db.collection('clients')
            .find({ $or: [{ companyName: regex }, { username: regex }] })
            .limit(10)
            .toArray();

        // Search campaigns
        const campaigns = await db.collection('campaigns')
            .find({ $or: [{ fileName: regex }] })
            .limit(10)
            .toArray();

        // Enrich campaigns with client names
        const clientMap = {};
        const allClients = await db.collection('clients').find({}).toArray();
        allClients.forEach(c => { clientMap[c._id.toString()] = c.companyName || c.username; });

        const enrichedCampaigns = campaigns.map(c => ({
            ...c,
            clientName: clientMap[c.clientId?.toString()] || 'Unknown Client',
        }));

        return Response.json({
            results: {
                clients: clients.map(c => ({
                    id: c._id,
                    name: c.companyName || c.username,
                    username: c.username,
                })),
                campaigns: enrichedCampaigns.map(c => ({
                    id: c._id,
                    fileName: c.fileName,
                    clientId: c.clientId,
                    clientName: c.clientName,
                    uploadedAt: c.uploadedAt,
                    rowCount: c.rows?.length || 0,
                })),
            }
        });
    } catch (error) {
        console.error(error);
        return Response.json({ results: { clients: [], campaigns: [] } });
    }
}
