import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseExcel } from '../utils/excelParser.js';
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
      return res.status(400).json({ 
        error: 'File Excel kosong atau format tidak sesuai' 
      });
    }

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
            row: row.no || 'unknown',
            error: err.message
          });
        }
      }
    });

    // Execute transaction
    insertMany(data);

    res.json({
      success: true,
      message: 'Upload berhasil',
      summary: {
        total: data.length,
        success: successCount,
        failed: errorCount
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Gagal mengupload file',
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