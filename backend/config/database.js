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
        arsip_id INTEGER,
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (arsip_id) REFERENCES arsip(id) ON DELETE CASCADE
      )
    `);

    // Tabel arsip untuk menyimpan file Excel
    db.exec(`
      CREATE TABLE IF NOT EXISTS arsip (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_data BLOB NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        year TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

export default db;