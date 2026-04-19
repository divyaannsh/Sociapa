/**
 * seed-gyan.js  —  Creates the "Gyan" client and seeds Sep + Oct 2025 campaign data
 * Run:  node scripts/seed-gyan.js
 */
const xlsx = require('xlsx');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// ── Read MONGODB_URI from .env manually ───────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env');
let MONGODB_URI = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^MONGODB_URI=(.+)$/m);
    if (match) MONGODB_URI = match[1].trim();
} catch { }
if (!MONGODB_URI) {
    console.error('❌  Could not read MONGODB_URI from .env');
    process.exit(1);
}

// ── Parse an Excel file — row 0 is the header map row ────────────────────────
function parseExcel(filePath) {
    const wb = xlsx.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = xlsx.utils.sheet_to_json(ws);

    const headerRow = raw[0];
    const colMap = {};
    for (const [key, val] of Object.entries(headerRow)) {
        if (val) colMap[key] = String(val).trim();
    }
    // The very first column key maps to 'Objective'
    const firstKey = Object.keys(raw[0])[0];
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

async function seed() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('dashboard');
    const usersCol = db.collection('users');
    const campaignsCol = db.collection('campaigns');

    // ── 1. Upsert the Gyan client/user ──────────────────────────────────────────
    let gyanUser = await usersCol.findOne({ username: 'gyan' });
    if (!gyanUser) {
        const result = await usersCol.insertOne({
            username: 'gyan',
            // Simple plaintext fallback — the admin creates proper hashed users via /users
            passwordHash: '$2a$10$J6Yo1v8wNOOCHaGzM1O4Ze2j5bZ.EKVk2XqVJMZl6jb6i0d1wR.uu', // gyan123
            role: 'client',
            companyName: 'Gyan',
            industry: 'E-commerce / Consumer Goods',
            contactEmail: 'gyan@example.com',
            seeded: true,
            createdAt: new Date(),
        });
        gyanUser = { _id: result.insertedId };
        console.log('✅ Created Gyan client user (login: gyan / gyan123)');
    } else {
        console.log('ℹ️  Gyan user already exists — reusing client ID', gyanUser._id);
    }

    const clientId = gyanUser._id.toString();

    // ── 2. Clear existing seeded campaigns ──────────────────────────────────────
    const del = await campaignsCol.deleteMany({ clientId, seeded: true });
    if (del.deletedCount > 0) console.log(`🗑️  Cleared ${del.deletedCount} old seeded campaigns`);

    // ── 3. Parse Excel files ────────────────────────────────────────────────────
    const baseDir = path.join(__dirname, '..');
    const sepRows = parseExcel(path.join(baseDir, 'Gyan-all-data-report-Sep-1-2025-to-Sep-30-2025.xlsx'));
    const octRows = parseExcel(path.join(baseDir, 'Gyan-all-data-report-Oct-1-2025-to-Oct-31-2025.xlsx'));

    // Keep individual campaign rows (exclude the "All" aggregate row at top)
    const filter = rows => rows.filter(r =>
        r['Campaign name'] &&
        r['Campaign name'] !== 'All' &&
        (parseFloat(r['Amount spent (INR)']) || 0) > 0
    );

    const sepFiltered = filter(sepRows);
    const octFiltered = filter(octRows);

    console.log(`📊 Sep rows: ${sepFiltered.length}  |  Oct rows: ${octFiltered.length}`);

    // ── 4. Insert campaign documents (one per month) ────────────────────────────
    const docs = [
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
    ];

    const ins = await campaignsCol.insertMany(docs);
    console.log(`✅ Inserted ${ins.insertedCount} campaign documents`);

    // ── 5. Print summary ─────────────────────────────────────────────────────────
    const allRows = [...sepFiltered, ...octFiltered];
    const totalSpend = allRows.reduce((s, r) => s + (parseFloat(r['Amount spent (INR)']) || 0), 0);
    const totalImp = allRows.reduce((s, r) => s + (parseFloat(r['Impressions']) || 0), 0);
    const totalClicks = allRows.reduce((s, r) => s + (parseFloat(r['Clicks (all)']) || 0), 0);
    console.log(`\n📈 Summary for Gyan (Sep + Oct 2025):`);
    console.log(`   Total Spend:      ₹${totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
    console.log(`   Total Impressions: ${totalImp.toLocaleString('en-IN')}`);
    console.log(`   Total Clicks:      ${totalClicks.toLocaleString('en-IN')}`);
    console.log(`\n🎉 Go to the dashboard → Select client "Gyan" → View graphs!`);

    await client.close();
}

seed().catch(e => { console.error('❌ Seed error:', e.message); process.exit(1); });
