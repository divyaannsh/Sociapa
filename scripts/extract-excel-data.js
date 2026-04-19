/**
 * scripts/extract-excel-data.js
 * Run once:  node scripts/extract-excel-data.js
 * Writes:    public/data/gyan.json
 */
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const OUT_DIR = path.join(BASE_DIR, 'public', 'data');
const OUT_FILE = path.join(OUT_DIR, 'gyan.json');

const FILES = [
    {
        file: 'Gyan-all-data-report-Sep-1-2025-to-Sep-30-2025.xlsx',
        id: 'gyan-sep-2025',
        name: 'Gyan — September 2025',
        period: 'Sep 2025',
    },
    {
        file: 'Gyan-all-data-report-Oct-1-2025-to-Oct-31-2025.xlsx',
        id: 'gyan-oct-2025',
        name: 'Gyan — October 2025',
        period: 'Oct 2025',
    },
];

function n(v) { return typeof v === 'number' ? v : (parseFloat(String(v).replace(/,/g, '')) || 0); }

function parseExcel(filePath) {
    const wb = xlsx.readFile(filePath);

    // Try "Raw Data Report" first (the detailed sheet)
    const sheetName = wb.SheetNames.includes('Raw Data Report')
        ? 'Raw Data Report'
        : wb.SheetNames[0];

    const ws = wb.Sheets[sheetName];
    const raw = xlsx.utils.sheet_to_json(ws);
    if (!raw.length) return [];

    // Row 0 is the header-mapping row for this export format
    const headerRow = raw[0];
    const colMap = {};
    for (const [key, val] of Object.entries(headerRow)) {
        if (val) colMap[key] = String(val).trim();
    }
    const firstKey = Object.keys(headerRow)[0];
    if (!colMap[firstKey]) colMap[firstKey] = 'Objective';

    return raw.slice(1).map(row => {
        const mapped = {};
        for (const [key, colName] of Object.entries(colMap)) {
            mapped[colName] = row[key] !== undefined ? row[key] : '';
        }
        return mapped;
    });
}

function summarise(rows) {
    // Keep only rows that have a real campaign name (exclude the "All" totals row)
    const data = rows.filter(r =>
        r['Campaign name'] &&
        r['Campaign name'] !== 'All' &&
        n(r['Amount spent (INR)']) > 0
    );

    const totals = data.reduce((acc, r) => {
        acc.spend += n(r['Amount spent (INR)']);
        acc.impressions += n(r['Impressions']);
        acc.clicks += n(r['Clicks (all)']);
        acc.linkClicks += n(r['Link clicks']);
        acc.reach += n(r['Reach']);
        acc.views += n(r['Views'] || r['Video plays'] || 0);
        return acc;
    }, { spend: 0, impressions: 0, clicks: 0, linkClicks: 0, reach: 0, views: 0 });

    totals.cpm = totals.impressions ? (totals.spend / totals.impressions) * 1000 : 0;
    totals.cpc = totals.linkClicks ? totals.spend / totals.linkClicks : 0;
    totals.ctr = totals.impressions ? (totals.linkClicks / totals.impressions) * 100 : 0;

    // Per-campaign breakdown
    const byCampaign = {};
    data.forEach(r => {
        const key = r['Campaign name'];
        if (!byCampaign[key]) byCampaign[key] = { name: key, spend: 0, impressions: 0, clicks: 0, linkClicks: 0, reach: 0 };
        byCampaign[key].spend += n(r['Amount spent (INR)']);
        byCampaign[key].impressions += n(r['Impressions']);
        byCampaign[key].clicks += n(r['Clicks (all)']);
        byCampaign[key].linkClicks += n(r['Link clicks']);
        byCampaign[key].reach += n(r['Reach']);
    });

    // Per-platform breakdown (rows have Platform column)
    const byPlatform = {};
    data.forEach(r => {
        const key = r['Platform'] || 'Meta';
        if (!byPlatform[key]) byPlatform[key] = { name: key, spend: 0, impressions: 0, clicks: 0 };
        byPlatform[key].spend += n(r['Amount spent (INR)']);
        byPlatform[key].impressions += n(r['Impressions']);
        byPlatform[key].clicks += n(r['Clicks (all)']);
    });

    return {
        totals,
        campaigns: Object.values(byCampaign).sort((a, b) => b.spend - a.spend),
        platforms: Object.values(byPlatform).sort((a, b) => b.spend - a.spend),
        rawRows: data,
    };
}

// ── Main ──────────────────────────────────────────────────────────────────────
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const output = {
    client: { id: 'gyan', name: 'Gyan', industry: 'E-commerce / Consumer Goods' },
    campaigns: FILES.map(({ file, id, name, period }) => {
        const filePath = path.join(BASE_DIR, file);
        if (!fs.existsSync(filePath)) {
            console.warn('⚠️  File not found:', filePath);
            return null;
        }
        console.log('Parsing', file, '...');
        const rows = parseExcel(filePath);
        const summary = summarise(rows);
        console.log(`  → ${summary.campaigns.length} campaigns | spend ₹${summary.totals.spend.toFixed(0)}`);
        return { id, name, period, ...summary };
    }).filter(Boolean),
};

fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
console.log('\n✅ Written to', OUT_FILE);
console.log('   Total campaigns extracted:', output.campaigns.length);
