import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const FILES = [
    {
        id: 'gyan-sep-2025',
        label: 'September 2025',
        file: 'Gyan-all-data-report-Sep-1-2025-to-Sep-30-2025.xlsx',
    },
    {
        id: 'gyan-oct-2025',
        label: 'October 2025',
        file: 'Gyan-all-data-report-Oct-1-2025-to-Oct-31-2025.xlsx',
    },
];

function n(v) {
    if (typeof v === 'number') return v;
    return parseFloat(String(v).replace(/,/g, '')) || 0;
}

function parseExcelFile(filePath) {
    const wb = xlsx.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = xlsx.utils.sheet_to_json(ws);
    if (!raw.length) return [];

    // Row 0 is the column-name mapping row (Meta export format)
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

function buildSummary(rows) {
    const data = rows.filter(r =>
        r['Campaign name'] &&
        r['Campaign name'] !== 'All' &&
        n(r['Amount spent (INR)']) > 0
    );

    let spend = 0, impressions = 0, clicks = 0, linkClicks = 0, reach = 0;
    const byCampaign = {};
    const byPlatform = {};

    data.forEach(r => {
        const s = n(r['Amount spent (INR)']);
        const im = n(r['Impressions']);
        const cl = n(r['Clicks (all)']);
        const lc = n(r['Link clicks']);
        const re = n(r['Reach']);

        spend += s;
        impressions += im;
        clicks += cl;
        linkClicks += lc;
        reach += re;

        // by campaign
        const cn = r['Campaign name'];
        if (!byCampaign[cn]) byCampaign[cn] = { name: cn, spend: 0, impressions: 0, clicks: 0, linkClicks: 0, reach: 0 };
        byCampaign[cn].spend += s;
        byCampaign[cn].impressions += im;
        byCampaign[cn].clicks += cl;
        byCampaign[cn].linkClicks += lc;
        byCampaign[cn].reach += re;

        // by platform
        const pl = r['Platform'] || 'Meta';
        if (!byPlatform[pl]) byPlatform[pl] = { name: pl, spend: 0, impressions: 0, clicks: 0 };
        byPlatform[pl].spend += s;
        byPlatform[pl].impressions += im;
        byPlatform[pl].clicks += cl;
    });

    const cpm = impressions ? (spend / impressions) * 1000 : 0;
    const cpc = linkClicks ? spend / linkClicks : 0;
    const ctr = impressions ? (linkClicks / impressions) * 100 : 0;

    return {
        totals: { spend, impressions, clicks, linkClicks, reach, cpm, cpc, ctr },
        campaigns: Object.values(byCampaign).sort((a, b) => b.spend - a.spend),
        platforms: Object.values(byPlatform).sort((a, b) => b.spend - a.spend),
    };
}

let _cache = null;

export async function GET() {
    try {
        if (_cache) return NextResponse.json(_cache);

        const base = process.cwd();
        const periods = [];

        for (const { id, label, file } of FILES) {
            const filePath = path.join(base, file);
            if (!fs.existsSync(filePath)) continue;
            const rows = parseExcelFile(filePath);
            const summary = buildSummary(rows);
            periods.push({ id, label, ...summary });
        }

        _cache = {
            client: { id: 'gyan', name: 'Gyan', industry: 'E-commerce / Consumer Goods' },
            periods,
        };

        return NextResponse.json(_cache);
    } catch (err) {
        console.error('[excel-data]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
