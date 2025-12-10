import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path ke file database
const dbPath = path.join(__dirname, '..', 'database', 'dashboard.db');

// Pastikan folder database ada
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Buat koneksi database
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Inisialisasi tabel
const initTables = () => {
  try {
    // Tabel users
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabel peserta
    db.exec(`
      CREATE TABLE IF NOT EXISTS peserta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        no INTEGER,
        nama_peserta TEXT,
        nama_perusahaan TEXT,
        pelatihan TEXT,
        ujikom_praktek TEXT,
        materi_skema TEXT,
        kso_lsp TEXT,
        skl_sertifikat TEXT,
        tanggal_invoice TEXT,
        sertifikat_dari_kso TEXT,
        sertifikat_diterima_kandel TEXT,
        sertifikat_diterima_peserta TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default user jika belum ada
    const userExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?').get('kandel');
    
    if (!userExists || userExists.count === 0) {
      db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('kandel', 'kandelsekecosukses');
      console.log('✅ Default user created');
    }

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing tables:', error.message);
  }
};

// Jalankan inisialisasi
initTables();

// Helper functions untuk query
export const query = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return [stmt.all(...params), null];
    } else {
      const result = stmt.run(...params);
      return [result, null];
    }
  } catch (error) {
    return [null, error];
  }
};

export const execute = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return [result, null];
  } catch (error) {
    return [null, error];
  }
};

export default db;