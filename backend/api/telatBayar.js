// backend/api/telatBayar.js
import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get count telat bayar
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const count = db.prepare('SELECT COUNT(*) as total FROM peserta WHERE telat_bayar = 1').get();
    
    res.json({
      success: true,
      count: count.total
    });
  } catch (error) {
    console.error('Get telat bayar count error:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil jumlah peserta telat bayar',
      message: error.message 
    });
  }
});

// Get all peserta telat bayar
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM peserta WHERE telat_bayar = 1';
    const params = [];

    // Search
    if (search) {
      query += ` AND (
        nama_peserta LIKE ? OR 
        nama_perusahaan LIKE ? OR 
        nomor_whatsapp LIKE ? OR
        catatan_telat_bayar LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY updated_at DESC';

    const rows = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });

  } catch (error) {
    console.error('Get telat bayar data error:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil data peserta telat bayar',
      message: error.message 
    });
  }
});

// Mark peserta as telat bayar
router.post('/mark/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const result = db.prepare(`
      UPDATE peserta 
      SET telat_bayar = 1, 
          catatan_telat_bayar = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(catatan || '', id);

    if (result.changes === 0) {
      return res.status(404).json({ 
        error: 'Peserta tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      message: 'Peserta berhasil ditandai sebagai telat bayar'
    });

  } catch (error) {
    console.error('Mark telat bayar error:', error);
    res.status(500).json({ 
      error: 'Gagal menandai peserta',
      message: error.message 
    });
  }
});

// Unmark peserta as telat bayar
router.post('/unmark/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare(`
      UPDATE peserta 
      SET telat_bayar = 0, 
          catatan_telat_bayar = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
      return res.status(404).json({ 
        error: 'Peserta tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      message: 'Tanda telat bayar berhasil dihapus'
    });

  } catch (error) {
    console.error('Unmark telat bayar error:', error);
    res.status(500).json({ 
      error: 'Gagal menghapus tanda',
      message: error.message 
    });
  }
});

export default router;