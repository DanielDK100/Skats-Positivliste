import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';

async function createDummyExcelFile() {
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  
  // Create a worksheet with sample data
  const ws = XLSX.utils.aoa_to_sheet([
    ['ISIN-kode', 'Navn', 'Kurs'],
    ['DK0010207141', 'Jyske Invest Danske Aktier', '100.5'],
    ['DK0010263052', 'Danske Invest Danmark Indeks', '120.75'],
    ['DK0060580512', 'Nordea Invest Basis 3', '150.25'],
    ['DK0010266311', 'Sparinvest Value Aktier', '85.6'],
    ['DK0010297118', 'BankInvest Europa Small Cap Aktier', '110.3'],
  ]);
  
  // Create a workbook with the current year as sheet name
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, currentYear);
  
  // Write to file
  const filePath = './public/xlsx/skats-positivliste.xlsx';
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  await fs.writeFile(filePath, buffer);
  console.log(`Dummy Excel file created at ${filePath}`);
}

createDummyExcelFile().catch(err => console.error('Error creating dummy file:', err));
