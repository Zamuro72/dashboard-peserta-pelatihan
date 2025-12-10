import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

export const parseExcel = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath, { cellStyles: true });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Get merges info
      const merges = worksheet['!merges'] || [];
      
      // Convert to JSON with raw values
      const rawData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '',
        raw: false,
        header: 1 // Get as array of arrays
      });

      // Find header row (biasanya row pertama atau kedua)
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(5, rawData.length); i++) {
        const row = rawData[i];
        if (row.some(cell => 
          cell && (
            cell.toString().toLowerCase().includes('nama') || 
            cell.toString().toLowerCase().includes('peserta')
          )
        )) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = rawData[headerRowIndex];
      const dataRows = rawData.slice(headerRowIndex + 1);

      // Create column mapping
      const colMap = {};
      headers.forEach((header, index) => {
        const h = header.toString().toLowerCase().trim();
        if (h.includes('no')) colMap.no = index;
        if (h.includes('nama') && h.includes('peserta')) colMap.nama_peserta = index;
        if (h.includes('perusahaan')) colMap.nama_perusahaan = index;
        if (h.includes('pelatihan') && !h.includes('peserta')) colMap.pelatihan = index;
        if (h.includes('ujikom') || h.includes('praktek')) colMap.ujikom_praktek = index;
        if (h.includes('materi') || h.includes('skema')) colMap.materi_skema = index;
        if (h.includes('kso') || h.includes('lsp')) colMap.kso_lsp = index;
        if (h.includes('skl') || h.includes('sertifikat')) colMap.skl_sertifikat = index;
        if (h.includes('tanggal') && h.includes('invoice')) colMap.tanggal_invoice = index;
        if (h.includes('dari') && h.includes('kso')) colMap.sertifikat_dari_kso = index;
        if (h.includes('kandel')) colMap.sertifikat_diterima_kandel = index;
        if (h.includes('diterima') && h.includes('peserta')) colMap.sertifikat_diterima_peserta = index;
      });

      // Process data with merged cells handling
      const mappedData = [];
      let lastValues = {}; // Store last non-empty values for merged cells

      dataRows.forEach((row, rowIndex) => {
        // Skip empty rows
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
          return;
        }

        // Check if this row is in a merged cell range
        const actualRowIndex = headerRowIndex + 1 + rowIndex;
        
        const rowData = {};
        
        // Process each column
        Object.keys(colMap).forEach(field => {
          const colIndex = colMap[field];
          let value = row[colIndex] || '';
          
          // Check if this cell is part of a merged range
          const isMerged = merges.some(merge => {
            return actualRowIndex >= merge.s.r && 
                   actualRowIndex <= merge.e.r && 
                   colIndex >= merge.s.c && 
                   colIndex <= merge.e.c;
          });

          // If merged and empty, use last value
          if (isMerged && (!value || value.toString().trim() === '')) {
            value = lastValues[field] || '';
          } else if (value && value.toString().trim() !== '') {
            // Store non-empty value for future merged cells
            lastValues[field] = value;
          }

          rowData[field] = value ? value.toString().trim() : '';
        });

        // Only add if nama_peserta is not empty
        if (rowData.nama_peserta && rowData.nama_peserta.trim() !== '') {
          mappedData.push(rowData);
        }
      });

      resolve(mappedData);

    } catch (error) {
      reject(error);
    }
  });
};

// Extract tahun from pelatihan/ujikom_praktek column
export const extractYearFromPelatihan = (pelatihan, ujikom_praktek) => {
  const text = `${pelatihan || ''} ${ujikom_praktek || ''}`;
  
  // Try to find year (2023, 2024, 2025, etc)
  const yearMatch = text.match(/20\d{2}/);
  if (yearMatch) {
    return yearMatch[0];
  }
  
  // Default to current year
  return new Date().getFullYear().toString();
};