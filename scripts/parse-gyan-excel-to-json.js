const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

const octFile = path.join(__dirname, '../Gyan-all-data-report-Oct-1-2025-to-Oct-31-2025.xlsx');
const sepFile = path.join(__dirname, '../Gyan-all-data-report-Sep-1-2025-to-Sep-30-2025.xlsx');

const octRaw = XLSX.utils.sheet_to_json(XLSX.readFile(octFile).Sheets[XLSX.readFile(octFile).SheetNames[0]], { header: 1 });
const sepRaw = XLSX.utils.sheet_to_json(XLSX.readFile(sepFile).Sheets[XLSX.readFile(sepFile).SheetNames[0]], { header: 1 });

function extractRows(rawData, sourceName) {
  const headers = rawData[2];
  const rows = [];
  let currentPlatform = null;
  
  for (let i = 3; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.every(c => c === undefined || c === null || c === '')) continue;
    
    let platform = row[2] || '';
    const campaignName = row[3] || '';
    
    // Header row for platform
    if (platform && platform !== 'All' && (!campaignName || campaignName === 'All')) {
      currentPlatform = platform;
      continue;
    }
    
    if (platform === 'All' && campaignName === 'All') continue;
    
    if (!platform && campaignName && currentPlatform) {
       // Convert to expected format
       const obj = {};
       headers.forEach((h, idx) => { if(h) obj[h] = row[idx]; });
       
       let displayPlatform = 'Other';
       const pLower = String(currentPlatform).toLowerCase();
       if (pLower === 'facebook' || pLower === 'messenger') displayPlatform = 'Meta (Facebook)';
       else if (pLower === 'instagram' || pLower === 'threads') displayPlatform = 'Meta (Facebook)'; // The UI budget pacing treats 'instagram' as Meta too
       
       obj['Platform'] = displayPlatform;
       obj['source'] = sourceName;
       
       rows.push(obj);
    }
  }
  return rows;
}

const octRows = extractRows(octRaw, 'october');
const sepRows = extractRows(sepRaw, 'september');

const staticData = {
  clients: [
    {
      _id: 'gyan-static-id',
      companyName: 'Gyan (Static DB Fallback)',
      username: 'gyan_static',
      industry: 'FMCG / Dairy',
    }
  ],
  campaignData: {
    'gyan-static-id': [
      {
        _id: 'gyan-camp-sep',
        fileName: 'Gyan-all-data-report-Sep-1-2025-to-Sep-30-2025.xlsx',
        uploadedAt: new Date('2025-10-01T00:00:00Z'),
        rows: sepRows
      },
      {
        _id: 'gyan-camp-oct',
        fileName: 'Gyan-all-data-report-Oct-1-2025-to-Oct-31-2025.xlsx',
        uploadedAt: new Date('2025-11-01T00:00:00Z'),
        rows: octRows
      }
    ]
  }
};

fs.writeFileSync(path.join(__dirname, '../public/gyan_static_data.json'), JSON.stringify(staticData, null, 2));
console.log('Static data generated at public/gyan_static_data.json');
