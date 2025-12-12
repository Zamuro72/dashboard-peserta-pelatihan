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

      console.log('📊 First 5 rows:', rawData.slice(0, 5));

      // Find header row (biasanya row ke-2 karena ada merged header di row 1)
      let headerRowIndex = 1; // Default ke row 2 (index 1)
      
      // Cari row yang punya "Nama Peserta" atau kolom identifier lain
      for (let i = 0; i < Math.min(5, rawData.length); i++) {
        const row = rawData[i];
        const rowStr = row.join('|').toLowerCase();
        if (rowStr.includes('nama peserta') || rowStr.includes('perusahaan')) {
          headerRowIndex = i;
          break;
        }
      }

      console.log('📍 Header row index:', headerRowIndex);
      const headers = rawData[headerRowIndex];
      console.log('📋 Headers found:', headers);

      const dataRows = rawData.slice(headerRowIndex + 1);

      // Create column mapping dengan deteksi yang lebih fleksibel
      const colMap = {};
      
      headers.forEach((header, index) => {
        if (!header) return;
        
        const h = header.toString().toLowerCase().trim();
        console.log(`Checking column ${index}: "${header}" -> "${h}"`);
        
        // No urut
        if (h === 'no' || h === 'no.') {
          colMap.no = index;
          console.log('✓ Found NO at column', index);
        }
        
        // Nama peserta
        if (h.includes('nama') && h.includes('peserta')) {
          colMap.nama_peserta = index;
          console.log('✓ Found NAMA_PESERTA at column', index);
        }
        
        // Nama perusahaan
        if (h.includes('nama') && h.includes('perusahaan')) {
          colMap.nama_perusahaan = index;
          console.log('✓ Found NAMA_PERUSAHAAN at column', index);
        }
        
        // Pelatihan - PERBAIKAN: cek berbagai variasi
        if ((h === 'pelatihan' || h.includes('tanggal pelatihan') || h.includes('tgl pelatihan')) 
            && !h.includes('peserta') && !h.includes('ujikom') && !h.includes('praktek')) {
          colMap.pelatihan = index;
          console.log('✓ Found PELATIHAN at column', index);
        }
        
        // Ujikom/Praktek - PERBAIKAN: cek berbagai variasi
        if (h.includes('ujikom') || h.includes('uji praktek') || h.includes('praktek') || 
            (h.includes('uji') && h.includes('praktek'))) {
          colMap.ujikom_praktek = index;
          console.log('✓ Found UJIKOM_PRAKTEK at column', index);
        }
        
        // Materi/Skema
        if (h.includes('materi') || h.includes('skema')) {
          colMap.materi_skema = index;
          console.log('✓ Found MATERI_SKEMA at column', index);
        }
        
        // KSO/LSP
        if ((h.includes('kso') || h.includes('lsp')) && !h.includes('dari') && !h.includes('sertifikat')) {
          colMap.kso_lsp = index;
          console.log('✓ Found KSO_LSP at column', index);
        }
        
        // SKL/E-sertifikat
        if ((h.includes('skl') || (h.includes('e-') && h.includes('sertifikat')) || h.includes('e-sertifikat')) 
            && !h.includes('dari') && !h.includes('diterima')) {
          colMap.skl_sertifikat = index;
          console.log('✓ Found SKL_SERTIFIKAT at column', index);
        }
        
        // Tanggal Invoice
        if (h.includes('tanggal') && h.includes('invoice')) {
          colMap.tanggal_invoice = index;
          console.log('✓ Found TANGGAL_INVOICE at column', index);
        }
        
        // Sertifikat diberikan dari KSO/LSP
        if (h.includes('sertifikat') && h.includes('dari') && (h.includes('kso') || h.includes('lsp'))) {
          colMap.sertifikat_dari_kso = index;
          console.log('✓ Found SERTIFIKAT_DARI_KSO at column', index);
        }
        
        // Sertifikat diterima Kandel - PERBAIKAN: deteksi lebih fleksibel
        if (h.includes('sertifikat') && h.includes('diterima') && 
            (h.includes('kandel') || h.includes('oleh kandel'))) {
          colMap.sertifikat_diterima_kandel = index;
          console.log('✓ Found SERTIFIKAT_DITERIMA_KANDEL at column', index);
        }
        // Alternatif: cek hanya "diterima" dan "kandel" tanpa harus ada "sertifikat"
        else if (h.includes('diterima') && h.includes('kandel') && !h.includes('peserta')) {
          colMap.sertifikat_diterima_kandel = index;
          console.log('✓ Found SERTIFIKAT_DITERIMA_KANDEL at column', index, '(alternative match)');
        }
        
        // Sertifikat diterima peserta
        if (h.includes('sertifikat') && h.includes('diterima') && h.includes('peserta')) {
          colMap.sertifikat_diterima_peserta = index;
          console.log('✓ Found SERTIFIKAT_DITERIMA_PESERTA at column', index);
        }
      });

      // FALLBACK: Jika pelatihan/ujikom tidak ketemu, coba deteksi by position
      // Biasanya struktur: No | Nama | Perusahaan | Pelatihan | Ujikom | ...
      if (!colMap.pelatihan && headers.length > 3) {
        // Cek kolom D (index 3) dan E (index 4)
        console.log('⚠️ Pelatihan not found, checking by position...');
        
        // Kolom D biasanya Pelatihan
        if (!colMap.pelatihan) {
          colMap.pelatihan = 3;
          console.log('✓ Set PELATIHAN to column D (index 3) by fallback');
        }
        
        // Kolom E biasanya Ujikom
        if (!colMap.ujikom_praktek) {
          colMap.ujikom_praktek = 4;
          console.log('✓ Set UJIKOM_PRAKTEK to column E (index 4) by fallback');
        }
      }

      console.log('📍 Final column mapping:', colMap);

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

          // Normalize SKL value (v = ✓, x = ✗)
          if (field === 'skl_sertifikat') {
            const normalized = value.toString().toLowerCase().trim();
            if (normalized === 'v' || normalized === '✓') {
              value = 'v';
            } else if (normalized === 'x' || normalized === '✗') {
              value = 'x';
            } else {
              value = '';
            }
          }

          rowData[field] = value ? value.toString().trim() : '';
        });

        // Only add if nama_peserta is not empty
        if (rowData.nama_peserta && rowData.nama_peserta.trim() !== '') {
          console.log(`Row ${rowIndex + 1}:`, {
            nama: rowData.nama_peserta,
            pelatihan: rowData.pelatihan,
            ujikom: rowData.ujikom_praktek
          });
          mappedData.push(rowData);
        }
      });

      console.log(`✅ Successfully parsed ${mappedData.length} rows`);
      
      // Log sample data
      if (mappedData.length > 0) {
        console.log('📝 Sample data (first row):', mappedData[0]);
      }

      resolve(mappedData);

    } catch (error) {
      console.error('❌ Parse error:', error);
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