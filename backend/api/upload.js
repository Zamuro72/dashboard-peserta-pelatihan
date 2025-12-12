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

    // Read file as buffer to save in database
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileName = `upload-${Date.now()}${path.extname(req.file.originalname)}`;
    
    // Save file to database
    const saveFileStmt = db.prepare(`
      INSERT INTO arsip (filename, original_name, file_data, file_size, mime_type, year)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const fileResult = saveFileStmt.run(
      fileName,
      req.file.originalname,
      fileBuffer,
      req.file.size,
      req.file.mimetype,
      year
    );

    // Prepare statement untuk insert peserta
    const insertStmt = db.prepare(`
      INSERT INTO peserta (
        arsip_id, no, nama_peserta, nama_perusahaan, pelatihan, ujikom_praktek,
        materi_skema, kso_lsp, skl_sertifikat, tanggal_invoice,
        sertifikat_dari_kso, sertifikat_diterima_kandel, sertifikat_diterima_peserta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Use transaction untuk performa lebih baik
    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        try {
          insertStmt.run(
            fileResult.lastInsertRowid, // Link ke arsip
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
        archived: req.file.originalname
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
    const years = db.prepare(`
      SELECT DISTINCT year 
      FROM arsip 
      ORDER BY year DESC
    `).all();
    
    res.json({
      success: true,
      years: years.map(y => y.year)
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
    
    const files = db.prepare(`
      SELECT 
        a.id, 
        a.filename, 
        a.original_name, 
        a.file_size, 
        a.uploaded_at, 
        a.year,
        COUNT(p.id) as peserta_count
      FROM arsip a
      LEFT JOIN peserta p ON p.arsip_id = a.id
      WHERE a.year = ?
      GROUP BY a.id
      ORDER BY a.uploaded_at DESC
    `).all(year);
    
    res.json({
      success: true,
      year: year,
      files: files.map(f => ({
        id: f.id,
        name: f.original_name,
        filename: f.filename,
        size: f.file_size,
        uploadedAt: f.uploaded_at,
        year: f.year,
        pesertaCount: f.peserta_count
      }))
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
router.get('/arsip/:year/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const file = db.prepare(`
      SELECT * FROM arsip WHERE id = ?
    `).get(id);
    
    if (!file) {
      return res.status(404).json({ 
        error: 'File tidak ditemukan' 
      });
    }
    
    // Send file as download
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Length', file.file_size);
    res.send(file.file_data);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'Gagal mendownload file',
      message: error.message 
    });
  }
});

// Delete archived file
router.delete('/arsip/:year/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    const result = db.prepare(`
      DELETE FROM arsip WHERE id = ?
    `).run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ 
        error: 'File tidak ditemukan' 
      });
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