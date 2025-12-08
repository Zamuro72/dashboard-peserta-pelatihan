# Dashboard Peserta Pelatihan — Petunjuk Menjalankan Lokal (XAMPP)

Panduan singkat menjalankan aplikasi di mesin lokal (Windows + XAMPP). Saya sudah menambahkan `.gitignore` root dan `backend/.env.example`. Ikuti langkah berikut.

1) Pastikan XAMPP MySQL berjalan

- Buka XAMPP Control Panel dan Start `MySQL`.
- Buka `http://localhost/phpmyadmin` untuk memastikan MySQL aktif.

2) Siapkan file environment untuk backend

- Salin `backend/.env.example` menjadi `backend/.env` dan isi `DB_PASSWORD` sesuai konfigurasi MySQL Anda (kosongkan jika `root` tanpa password).

  Contoh (backend\.env):
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=dashboard_peserta
  DB_PORT=3306

  PORT=3000
  NODE_ENV=development
  JWT_SECRET=isi_rahasia_anda
  FRONTEND_URL=http://localhost:5173
  ```

3) (Jika database belum ada) Import schema

  - Di cmd (jika `root` tanpa password):
  ```bat
  cd C:\Users\auza\dashboard-peserta-pelatihan\backend\database
  mysql -u root < schema.sql
  ```

  Atau gunakan phpMyAdmin → Import → pilih `backend/database/schema.sql`.

4) Install dependencies

  Backend:
  ```bat
  cd C:\Users\auza\dashboard-peserta-pelatihan\backend
  npm install
  ```

  Frontend:
  ```bat
  cd C:\Users\auza\dashboard-peserta-pelatihan\frontend
  npm install
  ```

5) Jalankan server backend

  ```bat
  cd C:\Users\auza\dashboard-peserta-pelatihan\backend
  npm run dev
  # atau
  npm start
  ```

  Pastikan terminal menampilkan `Server is running on port 3000` dan `Database connected successfully`.

6) Jalankan frontend (Vite)

  ```bat
  cd C:\Users\auza\dashboard-peserta-pelatihan\frontend
  npm run dev
  ```

  Buka `http://localhost:5173` di browser.

7) Upload Excel

- Login (username/password sesuai `schema.sql` jika belum diubah)
- Buka halaman Dashboard → Upload → pilih file Excel (.xlsx) sesuai template → Upload
- Setelah upload selesai, periksa tabel `peserta` di phpMyAdmin untuk melihat data baru.

8) Troubleshooting singkat

- Jika `uploads/` belum ada, buat folder di repo root: `mkdir uploads`.
- Jika error koneksi MySQL: periksa `backend/.env`, pastikan `DB_HOST`, `DB_USER`, `DB_PASSWORD` benar.
- Jika error CORS: ubah sementara `server.js` ke `app.use(cors())` untuk testing.

Jika mau, saya bisa melangkah lagi: mis. menjalankan `apply_patch` lain atau membuat contoh file Excel template. Beritahu saya bagian mana yang mau saya atur selanjutnya.
