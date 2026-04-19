import { getDb } from '../../../../lib/mongodb';
import { getCurrentUser } from '../../../../lib/auth';
import { fetchMetaCampaigns } from '../../../../lib/meta-api';
import { fetchGoogleCampaigns, getGoogleAccessToken } from '../../../../lib/google-ads-api';
import { fetchLinkedInCampaigns } from '../../../../lib/linkedin-api';

function decode(text) {
  if (!text) return '';
  try { return Buffer.from(text, 'base64').toString('utf8'); } catch { return ''; }
}

async function runSync(db) {
  const creds = await db.collection('integrations').findOne({ type: 'platform_credentials' });
  if (!creds) return { skipped: 'No integrations configured', platforms: {} };

  const results = { meta: null, google: null, linkedin: null };
  const errors  = {};
  const dateRange = { since: getDefaultSince(), until: getTodayStr() };

  // ─── META ────────────────────────────────────────────
  if (creds.meta?.status === 'connected' || creds.meta?.status === 'configured') {
    try {
      const token     = decode(creds.meta.accessToken);
      const accountId = creds.meta.adAccountId;
      if (token && accountId) {
        const rows = await fetchMetaCampaigns(accountId, token, dateRange);
        await upsertSyncedRows(db, 'meta', rows, dateRange);
        await db.collection('integrations').updateOne(
          { type: 'platform_credentials' },
          { $set: { 'meta.lastSynced': new Date(), 'meta.status': 'connected' } }
        );
        results.meta = { rows: rows.length, synced: new Date() };
      } else {
        errors.meta = 'Missing token or account ID';
      }
    } catch (err) {
      errors.meta = err.message;
      await db.collection('integrations').updateOne(
        { type: 'platform_credentials' },
        { $set: { 'meta.status': 'error', 'meta.lastError': err.message } }
      );
    }
  }

  // ─── GOOGLE ADS ───────────────────────────────────────
  if (creds.google?.status === 'connected' || creds.google?.status === 'configured') {
    try {
      const customerId   = creds.google.customerId;
      const devToken     = decode(creds.google.devToken);
      const clientId     = decode(creds.google.clientId);
      const clientSecret = decode(creds.google.clientSecret);
      const refreshToken = decode(creds.google.refreshToken);
      if (customerId && refreshToken) {
        const accessToken = await getGoogleAccessToken(clientId, clientSecret, refreshToken);
        const rows = await fetchGoogleCampaigns(customerId, devToken, accessToken, dateRange);
        await upsertSyncedRows(db, 'google', rows, dateRange);
        await db.collection('integrations').updateOne(
          { type: 'platform_credentials' },
          { $set: { 'google.lastSynced': new Date(), 'google.status': 'connected' } }
        );
        results.google = { rows: rows.length, synced: new Date() };
      } else {
        errors.google = 'Missing customerId or refreshToken';
      }
    } catch (err) {
      errors.google = err.message;
      await db.collection('integrations').updateOne(
        { type: 'platform_credentials' },
        { $set: { 'google.status': 'error', 'google.lastError': err.message } }
      );
    }
  }

  // ─── LINKEDIN ─────────────────────────────────────────
  if (creds.linkedin?.status === 'connected' || creds.linkedin?.status === 'configured') {
    try {
      const token     = decode(creds.linkedin.accessToken);
      const accountId = creds.linkedin.adAccountId;
      if (token && accountId) {
        const rows = await fetchLinkedInCampaigns(accountId, token, dateRange);
        await upsertSyncedRows(db, 'linkedin', rows, dateRange);
        await db.collection('integrations').updateOne(
          { type: 'platform_credentials' },
          { $set: { 'linkedin.lastSynced': new Date(), 'linkedin.status': 'connected' } }
        );
        results.linkedin = { rows: rows.length, synced: new Date() };
      } else {
        errors.linkedin = 'Missing token or account ID';
      }
    } catch (err) {
      errors.linkedin = err.message;
      await db.collection('integrations').updateOne(
        { type: 'platform_credentials' },
        { $set: { 'linkedin.status': 'error', 'linkedin.lastError': err.message } }
      );
    }
  }

  return { results, errors, syncedAt: new Date() };
}

async function upsertSyncedRows(db, platform, rows, dateRange) {
  if (!rows.length) return;
  // Store as a single synced campaign document (replacing previous sync window)
  await db.collection('syncedCampaigns').updateOne(
    { platform, 'dateRange.since': dateRange.since, 'dateRange.until': dateRange.until },
    { $set: { platform, dateRange, rows, syncedAt: new Date() } },
    { upsert: true }
  );
}

// POST — Manual sync trigger
export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'super_admin') {
    return Response.json({ message: 'Unauthorized' }, { status: 403 });
  }
  const db = await getDb();
  try {
    const outcome = await runSync(db);
    return Response.json({ success: true, ...outcome });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// GET — Sync status
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const creds = await db.collection('integrations').findOne({ type: 'platform_credentials' });
  const synced = await db.collection('syncedCampaigns').find({}).sort({ syncedAt: -1 }).toArray();

  return Response.json({
    meta: {
      status: creds?.meta?.status || 'not_connected',
      lastSynced: creds?.meta?.lastSynced || null,
      lastError: creds?.meta?.lastError || null,
    },
    google: {
      status: creds?.google?.status || 'not_connected',
      lastSynced: creds?.google?.lastSynced || null,
      lastError: creds?.google?.lastError || null,
    },
    linkedin: {
      status: creds?.linkedin?.status || 'not_connected',
      lastSynced: creds?.linkedin?.lastSynced || null,
      lastError: creds?.linkedin?.lastError || null,
    },
    recentSyncs: synced.slice(0, 10).map(s => ({
      platform: s.platform, rows: s.rows?.length || 0, syncedAt: s.syncedAt
    })),
  });
}

function getDefaultSince() {
  const d = new Date(); d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}
function getTodayStr() { return new Date().toISOString().split('T')[0]; }
