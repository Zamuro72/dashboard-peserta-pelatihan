import XLSX from 'xlsx';
import fs from 'fs';

export const parseExcel = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '',
        raw: false 
      });

      // Map Excel columns to database fields
      const mappedData = jsonData.map(row => ({
        no: row['No'] || row['no'] || null,
        nama_peserta: row['Nama Peserta'] || row['nama_peserta'] || '',
        nama_perusahaan: row['Nama Perusahaan'] || row['nama_perusahaan'] || '',
        pelatihan: row['Pelatihan'] || row['pelatihan'] || '',
        ujikom_praktek: row['Ujikom / Uji Praktek'] || row['ujikom_praktek'] || '',
        materi_skema: row['Materi / Skema'] || row['materi_skema'] || '',
        kso_lsp: row['KSO / LSP'] || row['kso_lsp'] || '',
        skl_sertifikat: row['SKL / E-sertifikat'] || row['skl_sertifikat'] || '',
        tanggal_invoice: row['Tanggal Invoice'] || row['tanggal_invoice'] || '',
        sertifikat_dari_kso: row['Sertifikat diberikan dari KSO / LSP'] || row['sertifikat_dari_kso'] || '',
        sertifikat_diterima_kandel: row['Sertifikast diterima oleh Kandel'] || row['sertifikat_diterima_kandel'] || '',
        sertifikat_diterima_peserta: row['Sertifikat diterima peserta pelatihan'] || row['sertifikat_diterima_peserta'] || ''
      }));

      // Clean up: delete uploaded file after parsing
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      resolve(mappedData);

    } catch (error) {
      // Clean up on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(error);
    }
  });
};