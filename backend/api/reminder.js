// backend/api/reminder.js
import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to parse date from DD/MM/YYYY or DD-MM-YYYY
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2]);
  
  return new Date(year, month, day);
}

// Helper function to calculate days difference
function daysDiff(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date1 - date2) / oneDay);
}

// Get reminder count
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all peserta with valid sertifikat_diterima_peserta date
    const rows = db.prepare(`
      SELECT sertifikat_diterima_peserta 
      FROM peserta 
      WHERE sertifikat_diterima_peserta IS NOT NULL 
      AND sertifikat_diterima_peserta != ''
    `).all();
    
    let count = 0;
    
    for (const row of rows) {
      const receivedDate = parseDate(row.sertifikat_diterima_peserta);
      if (!receivedDate) continue;
      
      // Expired date = 3 years after received
      const expiredDate = new Date(receivedDate);
      expiredDate.setFullYear(expiredDate.getFullYear() + 3);
      
      // Reminder date = 3 months before expired (90 days)
      const reminderDate = new Date(expiredDate);
      reminderDate.setDate(reminderDate.getDate() - 90);
      
      // Check if today >= reminderDate
      if (today >= reminderDate) {
        count++;
      }
    }
    
    res.json({
      success: true,
      count: count
    });
    
  } catch (error) {
    console.error('Get reminder count error:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil jumlah reminder',
      message: error.message 
    });
  }
});

// Get reminder data (sertifikat yang akan atau sudah expired)
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all peserta with valid sertifikat_diterima_peserta date
    const rows = db.prepare(`
      SELECT * FROM peserta 
      WHERE sertifikat_diterima_peserta IS NOT NULL 
      AND sertifikat_diterima_peserta != ''
      ORDER BY sertifikat_diterima_peserta DESC
    `).all();
    
    const reminderData = [];
    const expiredData = [];
    
    for (const row of rows) {
      const receivedDate = parseDate(row.sertifikat_diterima_peserta);
      if (!receivedDate) continue;
      
      // Expired date = 3 years after received
      const expiredDate = new Date(receivedDate);
      expiredDate.setFullYear(expiredDate.getFullYear() + 3);
      
      // Reminder date = 3 months before expired (90 days)
      const reminderDate = new Date(expiredDate);
      reminderDate.setDate(reminderDate.getDate() - 90);
      
      // Check if today >= reminderDate
      if (today >= reminderDate) {
        const daysRemaining = daysDiff(expiredDate, today);
        const isExpired = daysRemaining < 0;
        
        // Format expired date as DD/MM/YYYY
        const expiredDateStr = `${String(expiredDate.getDate()).padStart(2, '0')}/${String(expiredDate.getMonth() + 1).padStart(2, '0')}/${expiredDate.getFullYear()}`;
        
        const item = {
          ...row,
          expired_date: expiredDateStr,
          days_remaining: Math.abs(daysRemaining),
          is_expired: isExpired,
          remaining_text: isExpired 
            ? `Expired ${Math.abs(daysRemaining)} hari lalu` 
            : `${daysRemaining} hari lagi`,
          status: isExpired 
            ? 'EXPIRED' 
            : daysRemaining <= 30 
              ? 'SEGERA EXPIRED' 
              : daysRemaining <= 60 
                ? 'PERLU PERHATIAN' 
                : 'REMINDER'
        };
        
        if (isExpired) {
          expiredData.push(item);
        } else {
          reminderData.push(item);
        }
      }
    }
    
    res.json({
      success: true,
      reminder: reminderData,
      expired: expiredData
    });
    
  } catch (error) {
    console.error('Get reminder data error:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil data reminder',
      message: error.message 
    });
  }
});

export default router;