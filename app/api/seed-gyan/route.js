import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// ── Parse Excel — row 0 is the header-mapping row ─────────────────────────────
function parseExcel(filePath) {
    const wb = xlsx.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = xlsx.utils.sheet_to_json(ws);
    if (!raw.length) return [];

    const headerRow = raw[0];
    const colMap = {};
    for (const [key, val] of Object.entries(headerRow)) {
        if (val) colMap[key] = String(val).trim();
    }
    // The very first column maps to 'Objective' (it's the file-title column)
    const firstKey = Object.keys(headerRow)[0];
    if (!colMap[firstKey]) colMap[firstKey] = 'Objective';

    return raw.slice(1).map(row => {
        const mapped = {};
        for (const [key, colName] of Object.entries(colMap)) {
            const v = row[key];
            mapped[colName] = v !== undefined ? v : '';
        }
        return mapped;
    });
}

export async function POST(req) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB_NAME || 'dashboard');

        const usersCol = db.collection('users');
        const campaignsCol = db.collection('campaigns');

        // ── 1. Upsert Gyan user ────────────────────────────────────────────────────
        let gyanUser = await usersCol.findOne({ username: 'gyan' });
        if (!gyanUser) {
            const passwordHash = await bcrypt.hash('gyan123', 10);
            const result = await usersCol.insertOne({
                username: 'gyan',
                passwordHash,
                role: 'client',
                companyName: 'Gyan',
                industry: 'E-commerce / Consumer Goods',
                contactEmail: 'gyan@example.com',
                seeded: true,
                createdAt: new Date(),
            });
            gyanUser = { _id: result.insertedId };
        }

        const clientId = gyanUser._id.toString();

        // ── 2. Clear old seeded campaigns ─────────────────────────────────────────
        await campaignsCol.deleteMany({ clientId, seeded: true });

        // ── 3. Parse Excel ─────────────────────────────────────────────────────────
        const base = process.cwd();
        const sepRows = parseExcel(path.join(base, 'Gyan-all-data-report-Sep-1-2025-to-Sep-30-2025.xlsx'));
        const octRows = parseExcel(path.join(base, 'Gyan-all-data-report-Oct-1-2025-to-Oct-31-2025.xlsx'));

        const filterRows = rows => rows.filter(r =>
            r['Campaign name'] &&
            r['Campaign name'] !== 'All' &&
            (parseFloat(r['Amount spent (INR)']) || 0) > 0
        );

        const sepFiltered = filterRows(sepRows);
        const octFiltered = filterRows(octRows);

        // ── 4. Insert campaign documents ──────────────────────────────────────────
        await campaignsCol.insertMany([
            {
                clientId,
                name: 'Gyan — September 2025',
                platform: 'Meta (Facebook)',
                period: 'Sep 2025',
                uploadedAt: new Date('2025-09-30T00:00:00.000Z'),
                seeded: true,
                rows: sepFiltered,
            },
            {
                clientId,
                name: 'Gyan — October 2025',
                platform: 'Meta (Facebook)',
                period: 'Oct 2025',
                uploadedAt: new Date('2025-10-31T00:00:00.000Z'),
                seeded: true,
                rows: octFiltered,
            },
        ]);

        // ── 5. Build summary ──────────────────────────────────────────────────────
        const allRows = [...sepFiltered, ...octFiltered];
        const totalSpend = allRows.reduce((s, r) => s + (parseFloat(r['Amount spent (INR)']) || 0), 0);
        const totalImp = allRows.reduce((s, r) => s + (parseFloat(r['Impressions']) || 0), 0);
        const totalClicks = allRows.reduce((s, r) => s + (parseFloat(r['Clicks (all)']) || 0), 0);

        return NextResponse.json({
            success: true,
            clientId,
            sep: sepFiltered.length,
            oct: octFiltered.length,
            summary: {
                totalSpend: Math.round(totalSpend),
                totalImpressions: Math.round(totalImp),
                totalClicks: Math.round(totalClicks),
            },
            message: 'Seeded! Select client "Gyan" in the analytics dashboard to see the graphs.',
        });

    } catch (err) {
        console.error('[seed-gyan] error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'POST to this endpoint to seed Gyan data.' });
}
