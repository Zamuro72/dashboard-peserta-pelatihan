import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { parseExcel, extractYearFromPelatihan } from '../utils/excelParser.js';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'peserta-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel (.xlsx, .xls) yang diperbolehkan'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Create archive directory structure
const createArchiveDir = (year) => {
  const archiveBaseDir = path.join(__dirname, '..', 'arsip');
  const yearDir = path.join(archiveBaseDir, year);
  
  if (!fs.existsSync(archiveBaseDir)) {
    fs.mkdirSync(archiveBaseDir, { recursive: true });
  }
  
  if (!fs.existsSync(yearDir)) {
    fs.mkdirSync(yearDir, { recursive: true });
  }
  
  return yearDir;
};

// Move file to archive
const moveToArchive = (sourceFile, year, originalName) => {
  const yearDir = createArchiveDir(year);
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const archiveFileName = `${baseName}-${timestamp}${ext}`;
  const destPath = path.join(yearDir, archiveFileName);
  
  fs.copyFileSync(sourceFile, destPath);
  
  return {
    path: destPath,
    fileName: archiveFileName,
    year: year
  };
};

// Upload Excel file
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'File tidak ditemukan' 
      });
    }

    // Parse Excel file
    const data = await parseExcel(req.file.path);

    if (!data || data.length === 0) {
      // Delete uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        error: 'File Excel kosong atau format tidak sesuai' 
      });
    }

    // Detect year from first row
    const firstRow = data[0];
    const year = extractYearFromPelatihan(firstRow.pelatihan, firstRow.ujikom_praktek);

    // Move file to archive before processing
    const archiveInfo = moveToArchive(req.file.path, year, req.file.originalname);

    // Prepare statement untuk insert
    const insertStmt = db.prepare(`
      INSERT INTO peserta (
        no, nama_peserta, nama_perusahaan, pelatihan, ujikom_praktek,
        materi_skema, kso_lsp, skl_sertifikat, tanggal_invoice,
        sertifikat_dari_kso, sertifikat_diterima_kandel, sertifikat_diterima_peserta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Use transaction untuk performa lebih baik
    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        try {
          insertStmt.run(
            row.no || null,
            row.nama_peserta || '',
            row.nama_perusahaan || '',
            row.pelatihan || '',
            row.ujikom_praktek || '',
            row.materi_skema || '',
            row.kso_lsp || '',
            row.skl_sertifikat || '',
            row.tanggal_invoice || '',
            row.sertifikat_dari_kso || '',
            row.sertifikat_diterima_kandel || '',
            row.sertifikat_diterima_peserta || ''
          );
          successCount++;
        } catch (err) {
          errorCount++;
          errors.push({
            row: row.no || row.nama_peserta || 'unknown',
            error: err.message
          });
        }
      }
    });

    // Execute transaction
    insertMany(data);

    // Delete temporary upload file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      message: 'Upload berhasil',
      summary: {
        total: data.length,
        success: successCount,
        failed: errorCount,
        year: year,
        archived: archiveInfo.fileName
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Gagal mengupload file',
      message: error.message 
    });
  }
});

// Get list of archived years
router.get('/arsip/years', authenticateToken, (req, res) => {
  try {
    const archiveBaseDir = path.join(__dirname, '..', 'arsip');
    
    if (!fs.existsSync(archiveBaseDir)) {
      return res.json({ success: true, years: [] });
    }
    
    const years = fs.readdirSync(archiveBaseDir)
      .filter(item => {
        const itemPath = path.join(archiveBaseDir, item);
        return fs.statSync(itemPath).isDirectory();
      })
      .sort((a, b) => b.localeCompare(a)); // Sort descending
    
    res.json({
      success: true,
      years: years
    });
    
  } catch (error) {
    console.error('Get years error:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil data arsip',
      message: error.message 
    });
  }
});

// Get files in specific year
router.get('/arsip/:year', authenticateToken, (req, res) => {
  try {
    const { year } = req.params;
    const yearDir = path.join(__dirname, '..', 'arsip', year);
    
    if (!fs.existsSync(yearDir)) {
      return res.json({ success: true, files: [] });
    }
    
    const files = fs.readdirSync(yearDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.xlsx', '.xls'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(yearDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          uploadedAt: stats.mtime,
          year: year
        };
      })
      .sort((a, b) => b.uploadedAt - a.uploadedAt); // Sort by newest first
    
    res.json({
      success: true,
      year: year,
      files: files
    });
    
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil data file',
      message: error.message 
    });
  }
});

// Download archived file
router.get('/arsip/:year/:filename', authenticateToken, (req, res) => {
  try {
    const { year, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'arsip', year, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'File tidak ditemukan' 
      });
    }
    
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ 
          error: 'Gagal mendownload file' 
        });
      }
    });
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'Gagal mendownload file',
      message: error.message 
    });
  }
});

// Delete archived file
router.delete('/arsip/:year/:filename', authenticateToken, (req, res) => {
  try {
    const { year, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'arsip', year, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: 'File tidak ditemukan' 
      });
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    // Check if folder is empty, delete folder too
    const yearDir = path.join(__dirname, '..', 'arsip', year);
    const remainingFiles = fs.readdirSync(yearDir);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(yearDir);
    }
    
    res.json({
      success: true,
      message: 'File berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ 
      error: 'Gagal menghapus file',
      message: error.message 
    });
  }
});

// Download template Excel (optional)
router.get('/template', (req, res) => {
  const templatePath = path.join(__dirname, '../templates/template_peserta.xlsx');
  res.download(templatePath, 'template_peserta.xlsx', (err) => {
    if (err) {
      console.error('Download template error:', err);
      res.status(404).json({ 
        error: 'Template tidak ditemukan' 
      });
    }
  });
});

export default router;