// backend/api/reminder.js
import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to parse date from multiple formats
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Try parsing "Friday, 12 September 2025" format
  const longFormatMatch = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (longFormatMatch) {
    const months = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11,
      'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
      'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
    };
    
    const day = parseInt(longFormatMatch[1]);
    const monthName = longFormatMatch[2].toLowerCase();
    const year = parseInt(longFormatMatch[3]);
    const month = months[monthName];
    
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }
  
  // Try parsing DD/MM/YYYY or DD-MM-YYYY format
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const year = parseInt(parts[2]);
    
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  
  // Try standard Date parsing as fallback
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  return null;
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
    
    console.log('📅 Today:', today.toISOString());
    
    // Get all peserta with valid sertifikat_diterima_peserta date
    const rows = db.prepare(`
      SELECT id, nama_peserta, sertifikat_diterima_peserta 
      FROM peserta 
      WHERE sertifikat_diterima_peserta IS NOT NULL 
      AND sertifikat_diterima_peserta != ''
    `).all();
    
    console.log(`📊 Total rows with sertifikat: ${rows.length}`);
    
    let count = 0;
    
    for (const row of rows) {
      const receivedDate = parseDate(row.sertifikat_diterima_peserta);
      
      if (!receivedDate) {
        console.log(`❌ Failed to parse date for ${row.nama_peserta}: "${row.sertifikat_diterima_peserta}"`);
        continue;
      }
      
      // Expired date = 3 years after received
      const expiredDate = new Date(receivedDate);
      expiredDate.setFullYear(expiredDate.getFullYear() + 3);
      
      // Reminder date = 3 months before expired (90 days)
      const reminderDate = new Date(expiredDate);
      reminderDate.setDate(reminderDate.getDate() - 90);
      
      console.log(`✅ ${row.nama_peserta}:`);
      console.log(`   Received: ${receivedDate.toISOString().split('T')[0]}`);
      console.log(`   Expired: ${expiredDate.toISOString().split('T')[0]}`);
      console.log(`   Reminder: ${reminderDate.toISOString().split('T')[0]}`);
      console.log(`   Should remind: ${today >= reminderDate}`);
      
      // Check if today >= reminderDate
      if (today >= reminderDate) {
        count++;
      }
    }
    
    console.log(`🔔 Total reminder count: ${count}`);
    
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
    
    console.log('📅 Fetching reminder data for today:', today.toISOString());
    
    // Get all peserta with valid sertifikat_diterima_peserta date
    const rows = db.prepare(`
      SELECT * FROM peserta 
      WHERE sertifikat_diterima_peserta IS NOT NULL 
      AND sertifikat_diterima_peserta != ''
      ORDER BY sertifikat_diterima_peserta DESC
    `).all();
    
    console.log(`📊 Processing ${rows.length} rows`);
    
    const reminderData = [];
    const expiredData = [];
    
    for (const row of rows) {
      const receivedDate = parseDate(row.sertifikat_diterima_peserta);
      
      if (!receivedDate) {
        console.log(`❌ Skipping ${row.nama_peserta}: cannot parse "${row.sertifikat_diterima_peserta}"`);
        continue;
      }
      
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
        
        // Format expired date
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
        
        console.log(`✅ Added ${row.nama_peserta} - ${item.status} (${item.remaining_text})`);
        
        if (isExpired) {
          expiredData.push(item);
        } else {
          reminderData.push(item);
        }
      }
    }
    
    console.log(`🔔 Reminder: ${reminderData.length}, Expired: ${expiredData.length}`);
    
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