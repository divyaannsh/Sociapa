// Vercel Cron target — runs nightly at 2:00 AM IST (8:30 PM UTC)
// Configure in vercel.json:
// { "crons": [{ "path": "/api/cron/nightly-sync", "schedule": "30 20 * * *" }] }

import { getDb } from '../../../../lib/mongodb';
import { fetchMetaCampaigns } from '../../../../lib/meta-api';
import { fetchGoogleCampaigns, getGoogleAccessToken } from '../../../../lib/google-ads-api';
import { fetchLinkedInCampaigns } from '../../../../lib/linkedin-api';

function decode(text) {
  if (!text) return '';
  try { return Buffer.from(text, 'base64').toString('utf8'); } catch { return ''; }
}

export async function GET(request) {
  // Verify this is a legitimate Vercel Cron call
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  const creds = await db.collection('integrations').findOne({ type: 'platform_credentials' });

  if (!creds) {
    console.log('[CRON] No integrations configured — skipping sync');
    return Response.json({ success: true, message: 'No integrations configured' });
  }

  const dateRange = { since: getDefaultSince(), until: getTodayStr() };
  const log = { startedAt: new Date(), results: {}, errors: {} };

  // Meta
  try {
    if (creds.meta?.status === 'connected') {
      const rows = await fetchMetaCampaigns(creds.meta.adAccountId, decode(creds.meta.accessToken), dateRange);
      await upsertRows(db, 'meta', rows, dateRange);
      await db.collection('integrations').updateOne({ type: 'platform_credentials' }, { $set: { 'meta.lastSynced': new Date() } });
      log.results.meta = rows.length;
      console.log(`[CRON] Meta synced ${rows.length} rows`);
    }
  } catch (err) { log.errors.meta = err.message; console.error('[CRON] Meta error:', err.message); }

  // Google
  try {
    if (creds.google?.status === 'connected') {
      const accessToken = await getGoogleAccessToken(
        decode(creds.google.clientId), decode(creds.google.clientSecret), decode(creds.google.refreshToken)
      );
      const rows = await fetchGoogleCampaigns(creds.google.customerId, decode(creds.google.devToken), accessToken, dateRange);
      await upsertRows(db, 'google', rows, dateRange);
      await db.collection('integrations').updateOne({ type: 'platform_credentials' }, { $set: { 'google.lastSynced': new Date() } });
      log.results.google = rows.length;
      console.log(`[CRON] Google synced ${rows.length} rows`);
    }
  } catch (err) { log.errors.google = err.message; console.error('[CRON] Google error:', err.message); }

  // LinkedIn
  try {
    if (creds.linkedin?.status === 'connected') {
      const rows = await fetchLinkedInCampaigns(creds.linkedin.adAccountId, decode(creds.linkedin.accessToken), dateRange);
      await upsertRows(db, 'linkedin', rows, dateRange);
      await db.collection('integrations').updateOne({ type: 'platform_credentials' }, { $set: { 'linkedin.lastSynced': new Date() } });
      log.results.linkedin = rows.length;
      console.log(`[CRON] LinkedIn synced ${rows.length} rows`);
    }
  } catch (err) { log.errors.linkedin = err.message; console.error('[CRON] LinkedIn error:', err.message); }

  // Persist cron log
  await db.collection('cronLogs').insertOne({ ...log, completedAt: new Date() });

  return Response.json({ success: true, ...log });
}

async function upsertRows(db, platform, rows, dateRange) {
  if (!rows.length) return;
  await db.collection('syncedCampaigns').updateOne(
    { platform, 'dateRange.since': dateRange.since, 'dateRange.until': dateRange.until },
    { $set: { platform, dateRange, rows, syncedAt: new Date() } },
    { upsert: true }
  );
}

function getDefaultSince() {
  const d = new Date(); d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}
function getTodayStr() { return new Date().toISOString().split('T')[0]; }
