import { getDb } from '../../../../lib/mongodb';
import { getCurrentUser } from '../../../../lib/auth';

const PLATFORM_COLORS = {
  'Meta (Facebook)': '#1877f2',
  'Google Ads': '#ea4335',
  'LinkedIn': '#0a66c2',
  'Other': '#a0aec0',
};

function classifyPlatform(raw = '') {
  const p = raw.toLowerCase();
  if (p.includes('google'))                                              return 'Google Ads';
  if (p.includes('facebook') || p.includes('meta') || p.includes('instagram')) return 'Meta (Facebook)';
  if (p.includes('linkedin'))                                            return 'LinkedIn';
  return 'Other';
}

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');
  if (!clientId) return Response.json({ message: 'clientId required' }, { status: 400 });

  try {
    let clientDoc = null;
    let campaigns = [];
    let budgetDoc = null;
    let useStatic = false;

    if (clientId === 'gyan-static-id') {
      const fs = require('fs');
      const path = require('path');
      const staticDataPath = path.join(process.cwd(), 'public', 'gyan_static_data.json');
      if (fs.existsSync(staticDataPath)) {
        const staticDb = JSON.parse(fs.readFileSync(staticDataPath, 'utf-8'));
        clientDoc = staticDb.clients.find(c => c._id === 'gyan-static-id');
        campaigns = staticDb.campaignData['gyan-static-id'] || [];
        useStatic = true;
      }
    }

    if (!useStatic) {
      const db = await getDb();
      const { ObjectId } = await import('mongodb');

      // 1. Fetch client
      clientDoc = await db.collection('clients').findOne({ _id: new ObjectId(clientId) });
      if (!clientDoc) return Response.json({ message: 'Client not found' }, { status: 404 });

      // 2. Fetch campaigns
      campaigns = await db.collection('campaigns')
        .find({ clientId: new ObjectId(clientId) })
        .toArray();

      budgetDoc = await db.collection('budgetTargets').findOne({ clientId });
    }

    // 3. Aggregate totals
    let spend = 0, impressions = 0, clicks = 0, conversions = 0;
    const platformMap = {};
    const timelineMap = {};

    campaigns.forEach(c => {
      (c.rows || []).forEach(row => {
        const s  = parseFloat(row['Amount spent (INR)'] || row['Amount spent'] || 0) || 0;
        const im = parseFloat(row['Impressions'] || 0) || 0;
        const cl = parseFloat(row['Clicks (all)'] || row['Clicks'] || 0) || 0;
        const cv = parseFloat(row['Results'] || row['Conversions'] || 0) || 0;

        spend       += s;
        impressions += im;
        clicks      += cl;
        conversions += cv;

        // Platform breakdown
        const platform = classifyPlatform(row['Platform'] || row['platform'] || '');
        if (!platformMap[platform]) platformMap[platform] = { spend: 0, impressions: 0, clicks: 0 };
        platformMap[platform].spend       += s;
        platformMap[platform].impressions += im;
        platformMap[platform].clicks      += cl;

        // Timeline
        const ds = row['Reporting starts'] || row['Date'] || row['date'] || c.uploadedAt;
        if (ds) {
          const key = new Date(ds).toISOString().split('T')[0];
          if (!isNaN(new Date(key))) {
            if (!timelineMap[key]) timelineMap[key] = { date: key, spend: 0, clicks: 0 };
            timelineMap[key].spend  += s;
            timelineMap[key].clicks += cl;
          }
        }
      });
    });

    // 4. Compute derived metrics
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
    const cpc = clicks > 0 ? (spend / clicks).toFixed(2) : '0.00';
    const cpm = impressions > 0 ? ((spend / impressions) * 1000).toFixed(2) : '0.00';
    const cpa = conversions > 0 ? (spend / conversions).toFixed(2) : '0.00';

    // 5. Platform array
    const totalSpend = spend;
    const platforms = Object.entries(platformMap).map(([platform, d]) => ({
      platform,
      color: PLATFORM_COLORS[platform] || '#a0aec0',
      spend: d.spend,
      impressions: d.impressions,
      clicks: d.clicks,
      ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0,
      cpm: d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0,
      share: totalSpend > 0 ? (d.spend / totalSpend) * 100 : 0,
    })).sort((a, b) => b.spend - a.spend);

    // 6. Timeline array
    const timeline = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));

    // 7. Load saved budget targets
    // 7. Load saved budget targets (already fetched if using DB, null if static)
    const budgets = (budgetDoc?.budgets || [
      { platform: 'Meta (Facebook)', budget: 50000 },
      { platform: 'Google Ads',      budget: 40000 },
      { platform: 'LinkedIn',        budget: 30000 },
      { platform: 'Other',           budget: 20000 },
    ]).map(b => ({
      ...b,
      spent: platformMap[b.platform]?.spend || 0,
    }));

    return Response.json({
      data: {
        clientName: clientDoc.companyName || clientDoc.username,
        campaignCount: campaigns.length,
        spend, impressions, clicks, conversions,
        ctr, cpc, cpm, cpa,
        platforms, timeline, budgets,
      }
    });
  } catch (err) {
    console.error('PDF data API error:', err);
    return Response.json({ message: 'Failed to fetch report data', error: err.message }, { status: 500 });
  }
}
