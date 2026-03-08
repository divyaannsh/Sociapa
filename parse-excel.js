const xlsx = require('xlsx');
const file1 = 'Gyan-all-data-report-Oct-1-2025-to-Oct-31-2025.xlsx';
const workbook = xlsx.readFile(file1);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
console.log(`File: ${file1}`);
console.log(`Rows: ${data.length}`);
console.log('Sample data:');
console.log(data.slice(0, 2));
