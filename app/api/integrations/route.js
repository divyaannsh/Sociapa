import { getDb } from '../../../lib/mongodb';
import { getCurrentUser } from '../../../lib/auth';

const ENCRYPTION_KEY = process.env.INTEGRATION_SECRET || 'sociapa-default-key-change-in-prod';

// Simple XOR-based obfuscation (use a proper encryption lib in production)
function encode(text) {
  if (!text) return '';
  return Buffer.from(text).toString('base64');
}
function decode(text) {
  if (!text) return '';
  try { return Buffer.from(text, 'base64').toString('utf8'); }
  catch { return ''; }
}

// GET — load integration settings (tokens masked)
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') {
    return Response.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const db = await getDb();
  const doc = await db.collection('integrations').findOne({ type: 'platform_credentials' });

  if (!doc) return Response.json({ integrations: null });

  // Return masked tokens (only show last 6 chars)
  const mask = v => v ? '••••••' + decode(v).slice(-6) : '';

  return Response.json({
    integrations: {
      meta: {
        appId: doc.meta?.appId || '',
        appSecret: mask(doc.meta?.appSecret),
        accessToken: mask(doc.meta?.accessToken),
        adAccountId: doc.meta?.adAccountId || '',
        lastSynced: doc.meta?.lastSynced || null,
        status: doc.meta?.status || 'not_connected',
      },
      google: {
        customerId: doc.google?.customerId || '',
        devToken: mask(doc.google?.devToken),
        clientId: doc.google?.clientId || '',
        clientSecret: mask(doc.google?.clientSecret),
        refreshToken: mask(doc.google?.refreshToken),
        lastSynced: doc.google?.lastSynced || null,
        status: doc.google?.status || 'not_connected',
      },
      linkedin: {
        clientId: doc.linkedin?.clientId || '',
        clientSecret: mask(doc.linkedin?.clientSecret),
        accessToken: mask(doc.linkedin?.accessToken),
        adAccountId: doc.linkedin?.adAccountId || '',
        lastSynced: doc.linkedin?.lastSynced || null,
        status: doc.linkedin?.status || 'not_connected',
      },
    }
  });
}

// POST — save integration credentials
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') {
    return Response.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { platform, credentials } = body;

  if (!platform || !credentials) {
    return Response.json({ message: 'platform and credentials required' }, { status: 400 });
  }

  const db = await getDb();

  // Encode sensitive fields
  const encodeField = (val, existing) => {
    if (val && !val.startsWith('••••••')) return encode(val); // new value
    return existing || '';                                      // keep existing if masked
  };

  const existing = await db.collection('integrations').findOne({ type: 'platform_credentials' });
  const ex = existing?.[platform] || {};

  let update = {};

  if (platform === 'meta') {
    update = {
      'meta.appId': credentials.appId || ex.appId || '',
      'meta.appSecret': encodeField(credentials.appSecret, ex.appSecret),
      'meta.accessToken': encodeField(credentials.accessToken, ex.accessToken),
      'meta.adAccountId': credentials.adAccountId || ex.adAccountId || '',
      'meta.status': 'configured',
    };
  } else if (platform === 'google') {
    update = {
      'google.customerId': credentials.customerId || ex.customerId || '',
      'google.devToken': encodeField(credentials.devToken, ex.devToken),
      'google.clientId': credentials.clientId || ex.clientId || '',
      'google.clientSecret': encodeField(credentials.clientSecret, ex.clientSecret),
      'google.refreshToken': encodeField(credentials.refreshToken, ex.refreshToken),
      'google.status': 'configured',
    };
  } else if (platform === 'linkedin') {
    update = {
      'linkedin.clientId': credentials.clientId || ex.clientId || '',
      'linkedin.clientSecret': encodeField(credentials.clientSecret, ex.clientSecret),
      'linkedin.accessToken': encodeField(credentials.accessToken, ex.accessToken),
      'linkedin.adAccountId': credentials.adAccountId || ex.adAccountId || '',
      'linkedin.status': 'configured',
    };
  } else {
    return Response.json({ message: 'Invalid platform' }, { status: 400 });
  }

  await db.collection('integrations').updateOne(
    { type: 'platform_credentials' },
    { $set: { ...update, updatedAt: new Date(), updatedBy: user.username } },
    { upsert: true }
  );

  return Response.json({ success: true, message: `${platform} credentials saved` });
}
