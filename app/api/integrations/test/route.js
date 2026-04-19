import { getDb } from '../../../../lib/mongodb';
import { getCurrentUser } from '../../../../lib/auth';
import { testMetaConnection } from '../../../../lib/meta-api';
import { testLinkedInConnection } from '../../../../lib/linkedin-api';
import { getGoogleAccessToken, testGoogleAdsConnection } from '../../../../lib/google-ads-api';

function decode(text) {
  if (!text) return '';
  try { return Buffer.from(text, 'base64').toString('utf8'); } catch { return ''; }
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') {
    return Response.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { platform } = await request.json();
  if (!platform) return Response.json({ message: 'platform required' }, { status: 400 });

  const db = await getDb();
  const doc = await db.collection('integrations').findOne({ type: 'platform_credentials' });
  if (!doc) return Response.json({ valid: false, error: 'No credentials saved yet' });

  try {
    if (platform === 'meta') {
      const token = decode(doc.meta?.accessToken);
      if (!token) return Response.json({ valid: false, error: 'No access token saved' });
      const result = await testMetaConnection(token);
      if (result.valid) {
        await db.collection('integrations').updateOne(
          { type: 'platform_credentials' },
          { $set: { 'meta.status': 'connected', 'meta.accountName': result.name } }
        );
      }
      return Response.json(result);
    }

    if (platform === 'google') {
      const { customerId, devToken } = doc.google || {};
      const clientId     = decode(doc.google?.clientId);
      const clientSecret = decode(doc.google?.clientSecret);
      const refreshToken = decode(doc.google?.refreshToken);
      if (!customerId || !refreshToken) return Response.json({ valid: false, error: 'Missing Google credentials' });
      const accessToken = await getGoogleAccessToken(clientId, clientSecret, refreshToken);
      const result = await testGoogleAdsConnection(customerId, decode(devToken), accessToken);
      if (result.valid) {
        await db.collection('integrations').updateOne(
          { type: 'platform_credentials' },
          { $set: { 'google.status': 'connected', 'google.accountName': result.name } }
        );
      }
      return Response.json(result);
    }

    if (platform === 'linkedin') {
      const token = decode(doc.linkedin?.accessToken);
      if (!token) return Response.json({ valid: false, error: 'No access token saved' });
      const result = await testLinkedInConnection(token);
      if (result.valid) {
        await db.collection('integrations').updateOne(
          { type: 'platform_credentials' },
          { $set: { 'linkedin.status': 'connected', 'linkedin.accountName': result.name } }
        );
      }
      return Response.json(result);
    }

    return Response.json({ message: 'Invalid platform' }, { status: 400 });
  } catch (err) {
    return Response.json({ valid: false, error: err.message });
  }
}
