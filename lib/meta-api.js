// lib/meta-api.js
// Meta Graph API — Campaign data fetcher
// Docs: https://developers.facebook.com/docs/marketing-api/insights
// Requires: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID (set in Settings → Integrations or .env)

const META_BASE = 'https://graph.facebook.com/v19.0';

/**
 * Fetch campaign insights from Meta Graph API
 * @param {string} adAccountId - e.g. "act_1234567890"
 * @param {string} accessToken
 * @param {{ since: string, until: string }} dateRange - YYYY-MM-DD
 * @returns {Promise<Array>} normalized campaign rows
 */
export async function fetchMetaCampaigns(adAccountId, accessToken, dateRange = {}) {
  const since = dateRange.since || getDefaultSince();
  const until  = dateRange.until  || getTodayStr();

  const params = new URLSearchParams({
    access_token: accessToken,
    level: 'campaign',
    fields: 'campaign_name,spend,impressions,clicks,cpm,cpc,ctr,conversions,date_start,date_stop',
    time_range: JSON.stringify({ since, until }),
    time_increment: 1,
    limit: 500,
  });

  const url = `${META_BASE}/${adAccountId}/insights?${params}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Meta API error: ${err?.error?.message || res.status}`);
  }

  const json = await res.json();
  const rows  = json.data || [];

  // Normalize to our internal schema
  return rows.map(row => ({
    Platform: 'Meta (Facebook)',
    'Campaign Name': row.campaign_name || '',
    'Amount spent (INR)': parseFloat(row.spend || 0),
    Impressions: parseInt(row.impressions || 0),
    'Clicks (all)': parseInt(row.clicks || 0),
    CPM: parseFloat(row.cpm || 0),
    CPC: parseFloat(row.cpc || 0),
    CTR: parseFloat(row.ctr || 0),
    Results: parseInt(row.conversions?.[0]?.value || 0),
    'Reporting starts': row.date_start,
    'Reporting ends': row.date_stop,
    source: 'meta_api',
  }));
}

/**
 * Test Meta API credentials
 * @param {string} accessToken
 * @returns {Promise<{ valid: boolean, name?: string, error?: string }>}
 */
export async function testMetaConnection(accessToken) {
  try {
    const url = `${META_BASE}/me?access_token=${accessToken}&fields=name,id`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.error) return { valid: false, error: json.error.message };
    return { valid: true, name: json.name, id: json.id };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

function getDefaultSince() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}
