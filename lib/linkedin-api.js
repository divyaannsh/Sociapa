// lib/linkedin-api.js
// LinkedIn Marketing API — Campaign analytics fetcher
// Docs: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/analytics
// Requires: LINKEDIN_ACCESS_TOKEN, LINKEDIN_AD_ACCOUNT_ID

const LINKEDIN_BASE = 'https://api.linkedin.com/v2';

/**
 * Fetch campaign analytics from LinkedIn Marketing API
 * @param {string} adAccountId - e.g. "urn:li:sponsoredAccount:12345678"
 * @param {string} accessToken
 * @param {{ since: string, until: string }} dateRange - YYYY-MM-DD
 * @returns {Promise<Array>} normalized campaign rows
 */
export async function fetchLinkedInCampaigns(adAccountId, accessToken, dateRange = {}) {
  const since = dateRange.since || getDefaultSince();
  const until  = dateRange.until  || getTodayStr();

  // Step 1: Get campaign IDs for this account
  const campaignsRes = await fetch(
    `${LINKEDIN_BASE}/adCampaignsV2?q=search&search.account.values[0]=${encodeURIComponent(adAccountId)}&count=100`,
    { headers: { Authorization: `Bearer ${accessToken}`, 'LinkedIn-Version': '202401' } }
  );
  if (!campaignsRes.ok) {
    const err = await campaignsRes.json().catch(() => ({}));
    throw new Error(`LinkedIn Campaigns error: ${err?.message || campaignsRes.status}`);
  }
  const campaignsJson = await campaignsRes.json();
  const campaigns = campaignsJson.elements || [];

  if (!campaigns.length) return [];

  // Step 2: Fetch analytics for all campaigns
  const campaignUrns = campaigns.map(c => c.id).slice(0, 20); // API limit
  const analyticsParams = new URLSearchParams({
    q: 'analytics',
    pivot: 'CAMPAIGN',
    dateRange: JSON.stringify({
      start: { year: since.slice(0,4), month: since.slice(5,7), day: since.slice(8,10) },
      end:   { year: until.slice(0,4), month: until.slice(5,7), day: until.slice(8,10) },
    }),
    timeGranularity: 'DAILY',
    count: 500,
  });
  campaignUrns.forEach(id => analyticsParams.append('campaigns[0]', id));

  const analyticsRes = await fetch(
    `${LINKEDIN_BASE}/adAnalyticsV2?${analyticsParams}`,
    { headers: { Authorization: `Bearer ${accessToken}`, 'LinkedIn-Version': '202401' } }
  );
  if (!analyticsRes.ok) {
    const err = await analyticsRes.json().catch(() => ({}));
    throw new Error(`LinkedIn Analytics error: ${err?.message || analyticsRes.status}`);
  }

  const analyticsJson = await analyticsRes.json();
  const rows = analyticsJson.elements || [];

  // Normalize to our internal schema
  return rows.map(row => ({
    Platform: 'LinkedIn',
    'Campaign Name': campaigns.find(c => c.id === row.pivotValues?.[0])?.name || '',
    'Amount spent (INR)': parseFloat(row.costInLocalCurrency || 0),
    Impressions: parseInt(row.impressions || 0),
    'Clicks (all)': parseInt(row.clicks || 0),
    CPM: parseFloat(row.costInLocalCurrency || 0) > 0 && parseInt(row.impressions || 0) > 0
      ? (parseFloat(row.costInLocalCurrency) / parseInt(row.impressions)) * 1000 : 0,
    CPC: parseInt(row.clicks || 0) > 0
      ? parseFloat(row.costInLocalCurrency || 0) / parseInt(row.clicks) : 0,
    CTR: parseInt(row.impressions || 0) > 0
      ? (parseInt(row.clicks || 0) / parseInt(row.impressions)) * 100 : 0,
    Results: parseInt(row.conversions || 0),
    'Reporting starts': row.dateRange?.start
      ? `${row.dateRange.start.year}-${String(row.dateRange.start.month).padStart(2,'0')}-${String(row.dateRange.start.day).padStart(2,'0')}`
      : since,
    'Reporting ends': until,
    source: 'linkedin_api',
  }));
}

/**
 * Test LinkedIn API credentials
 */
export async function testLinkedInConnection(accessToken) {
  try {
    const res = await fetch(`${LINKEDIN_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}`, 'LinkedIn-Version': '202401' },
    });
    const json = await res.json();
    if (!res.ok) return { valid: false, error: json?.message || `HTTP ${res.status}` };
    const name = [json.localizedFirstName, json.localizedLastName].filter(Boolean).join(' ');
    return { valid: true, name: name || 'LinkedIn User' };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

function getDefaultSince() {
  const d = new Date(); d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}
function getTodayStr() { return new Date().toISOString().split('T')[0]; }
