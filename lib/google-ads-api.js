// lib/google-ads-api.js
// Google Ads REST API — Campaign performance fetcher
// Docs: https://developers.google.com/google-ads/api/rest/reference
// Requires: GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_DEV_TOKEN, GOOGLE_ACCESS_TOKEN (from OAuth refresh)

const GOOGLE_ADS_BASE = 'https://googleads.googleapis.com/v16';

/**
 * Exchange a refresh token for a fresh access token
 */
export async function getGoogleAccessToken(clientId, clientSecret, refreshToken) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Google OAuth error: ${json.error_description || json.error || res.status}`);
  }
  return json.access_token;
}

/**
 * Fetch campaign performance from Google Ads API
 * @param {string} customerId - 10-digit customer ID (no dashes)
 * @param {string} devToken - Google Ads developer token
 * @param {string} accessToken - fresh OAuth access token
 * @param {{ since: string, until: string }} dateRange
 * @returns {Promise<Array>} normalized campaign rows
 */
export async function fetchGoogleCampaigns(customerId, devToken, accessToken, dateRange = {}) {
  const since = dateRange.since || getDefaultSince();
  const until  = dateRange.until  || getTodayStr();

  // Google Ads Query Language (GAQL)
  const query = `
    SELECT
      campaign.name,
      segments.date,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.cpm,
      metrics.average_cpc,
      metrics.ctr,
      metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${since}' AND '${until}'
      AND campaign.status = 'ENABLED'
    ORDER BY segments.date DESC
    LIMIT 1000
  `;

  const url = `${GOOGLE_ADS_BASE}/customers/${customerId}/googleAds:searchStream`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': devToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Google Ads API error: ${JSON.stringify(err)}`);
  }

  // searchStream returns NDJSON (one JSON object per line)
  const text = await res.text();
  const rows = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    try {
      const batch = JSON.parse(line);
      for (const result of batch.results || []) {
        const m = result.metrics || {};
        rows.push({
          Platform: 'Google Ads',
          'Campaign Name': result.campaign?.name || '',
          'Amount spent (INR)': (parseInt(m.cost_micros || 0) / 1_000_000),
          Impressions: parseInt(m.impressions || 0),
          'Clicks (all)': parseInt(m.clicks || 0),
          CPM: parseFloat(m.cpm || 0),
          CPC: parseFloat(m.average_cpc || 0) / 1_000_000,
          CTR: parseFloat(m.ctr || 0) * 100,
          Results: parseFloat(m.conversions || 0),
          'Reporting starts': result.segments?.date,
          'Reporting ends': result.segments?.date,
          source: 'google_ads_api',
        });
      }
    } catch { /* skip malformed lines */ }
  }

  return rows;
}

/**
 * Test Google Ads API credentials
 */
export async function testGoogleAdsConnection(customerId, devToken, accessToken) {
  try {
    const url = `${GOOGLE_ADS_BASE}/customers/${customerId}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}`, 'developer-token': devToken },
    });
    const json = await res.json();
    if (!res.ok) return { valid: false, error: json?.error?.message || `HTTP ${res.status}` };
    return { valid: true, name: json.descriptiveName || customerId };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

function getDefaultSince() {
  const d = new Date(); d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}
function getTodayStr() { return new Date().toISOString().split('T')[0]; }
