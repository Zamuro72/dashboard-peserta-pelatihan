import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all peserta dengan filter dan search
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, filter } = req.query;
    let query = 'SELECT * FROM peserta WHERE 1=1';
    const params = [];

    // Filter berdasarkan tipe sertifikat
    if (filter === 'bnsp') {
      query += ' AND materi_skema LIKE ?';
      params.push('%BNSP%');
    } else if (filter === 'kemnaker') {
      query += ' AND (materi_skema LIKE ? OR materi_skema LIKE ?)';
      params.push('%Kemnaker%', '%KEMNAKER%');
    }

    // Search
    if (search) {
      query += ` AND (
        nama_peserta LIKE ? OR 
        nama_perusahaan LIKE ? OR 
        materi_skema LIKE ? OR 
        kso_lsp LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY no ASC';

    const rows = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });

  } catch (error) {
    console.error('Get peserta error:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil data peserta',
      message: error.message 
    });
  }
});

// Get peserta by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const row = db.prepare('SELECT * FROM peserta WHERE id = ?').get(id);

    if (!row) {
      return res.status(404).json({ 
        error: 'Peserta tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      data: row
    });

  } catch (error) {
    console.error('Get peserta by ID error:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil data peserta',
      message: error.message 
    });
  }
});

// Create new peserta
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      no, nama_peserta, nama_perusahaan, pelatihan, ujikom_praktek,
      materi_skema, kso_lsp, skl_sertifikat, tanggal_invoice,
      sertifikat_dari_kso, sertifikat_diterima_kandel, sertifikat_diterima_peserta
    } = req.body;

    const result = db.prepare(`
      INSERT INTO peserta (
        no, nama_peserta, nama_perusahaan, pelatihan, ujikom_praktek,
        materi_skema, kso_lsp, skl_sertifikat, tanggal_invoice,
        sertifikat_dari_kso, sertifikat_diterima_kandel, sertifikat_diterima_peserta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      no, nama_peserta, nama_perusahaan, pelatihan, ujikom_praktek,
      materi_skema, kso_lsp, skl_sertifikat, tanggal_invoice,
      sertifikat_dari_kso, sertifikat_diterima_kandel, sertifikat_diterima_peserta
    );

    res.status(201).json({
      success: true,
      message: 'Peserta berhasil ditambahkan',
      id: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Create peserta error:', error);
    res.status(500).json({ 
      error: 'Gagal menambahkan peserta',
      message: error.message 
    });
  }
});

// Update peserta
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      no, nama_peserta, nama_perusahaan, pelatihan, ujikom_praktek,
      materi_skema, kso_lsp, skl_sertifikat, tanggal_invoice,
      sertifikat_dari_kso, sertifikat_diterima_kandel, sertifikat_diterima_peserta
    } = req.body;

    const result = db.prepare(`
      UPDATE peserta SET
        no = ?, nama_peserta = ?, nama_perusahaan = ?, pelatihan = ?,
        ujikom_praktek = ?, materi_skema = ?, kso_lsp = ?, skl_sertifikat = ?,
        tanggal_invoice = ?, sertifikat_dari_kso = ?, 
        sertifikat_diterima_kandel = ?, sertifikat_diterima_peserta = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      no, nama_peserta, nama_perusahaan, pelatihan, ujikom_praktek,
      materi_skema, kso_lsp, skl_sertifikat, tanggal_invoice,
      sertifikat_dari_kso, sertifikat_diterima_kandel, 
      sertifikat_diterima_peserta, id
    );

    if (result.changes === 0) {
      return res.status(404).json({ 
        error: 'Peserta tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      message: 'Peserta berhasil diupdate'
    });

  } catch (error) {
    console.error('Update peserta error:', error);
    res.status(500).json({ 
      error: 'Gagal mengupdate peserta',
      message: error.message 
    });
  }
});

// Delete peserta
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM peserta WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ 
        error: 'Peserta tidak ditemukan' 
      });
    }

    res.json({
      success: true,
      message: 'Peserta berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete peserta error:', error);
    res.status(500).json({ 
      error: 'Gagal menghapus peserta',
      message: error.message 
    });
  }
});

// Get statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as total FROM peserta').get();
    const bnsp = db.prepare("SELECT COUNT(*) as total FROM peserta WHERE materi_skema LIKE '%BNSP%'").get();
    const kemnaker = db.prepare("SELECT COUNT(*) as total FROM peserta WHERE materi_skema LIKE '%Kemnaker%' OR materi_skema LIKE '%KEMNAKER%'").get();

    res.json({
      success: true,
      stats: {
        total: total.total,
        bnsp: bnsp.total,
        kemnaker: kemnaker.total
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil statistik',
      message: error.message 
    });
  }
});

export default router;