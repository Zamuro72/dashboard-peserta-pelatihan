-- Buat database
CREATE DATABASE IF NOT EXISTS dashboard_peserta;
USE dashboard_peserta;

-- Tabel users untuk admin
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel peserta
CREATE TABLE IF NOT EXISTS peserta (
    id INT PRIMARY KEY AUTO_INCREMENT,
    no INT,
    nama_peserta VARCHAR(255),
    nama_perusahaan VARCHAR(255),
    pelatihan VARCHAR(255),
    ujikom_praktek VARCHAR(255),
    materi_skema TEXT,
    kso_lsp VARCHAR(255),
    skl_sertifikat VARCHAR(10),
    tanggal_invoice VARCHAR(255),
    sertifikat_dari_kso VARCHAR(255),
    sertifikat_diterima_kandel VARCHAR(255),
    sertifikat_diterima_peserta VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert admin user (password: kandelsekecosukses)
INSERT INTO users (username, password) VALUES 
('kandel', 'kandelsekecosukses')
ON DUPLICATE KEY UPDATE username=username;

-- Insert sample data
INSERT INTO peserta (no, nama_peserta, nama_perusahaan, pelatihan, ujikom_praktek, materi_skema, kso_lsp, skl_sertifikat, tanggal_invoice, sertifikat_dari_kso, sertifikat_diterima_kandel, sertifikat_diterima_peserta) VALUES
(1, 'Oktaviana', 'PT Standard Indonesia Industry', 'Tuesday, 26 August 2025', '', 'OPLB3 BNSP', 'LSP LAMINDO', 'v', '', '', '', '17 September 2025'),
(2, 'Raisa Nehemia', 'RSUD Kemayoran (PT Arah Enviromental)', 'Tuesday, 26 August 2025', '', 'OPLB3 BNSP', 'LSP LAMINDO', 'v', '', '', '', ''),
(3, 'Maylita', 'PT Tempo nagadi', '14 - 18 Juli 2025', 'Saturday, 19 July 2025', 'Petugas K3 Kimia Kemnaker RI Teknisi K3 Listrik Kemnaker RI', 'Provider KEM', 'x', '', '', '', ''),
(4, 'Juheri', 'PT TAISHO', '14 - 20 Juli 2025', 'Monday, 21 July 2025', 'Petugas K3 Kimia Kemnaker RI Teknisi K3 Listrik Kemnaker RI', 'Provider KEM', 'x', '', '', '', ''),
(5, 'Taufiq Eko', 'PT Primacom Interbuana', '25 - 28 Juli 2025', 'Tuesday, 29 July 2025', 'OHC 3 Kemnaker RI', 'Midiatama', 'v', '', '', '', ''),
(6, 'Angga Yudhistira', 'PT Primacom Interbuana', '25 - 28 Juli 2025', 'Tuesday, 29 July 2025', 'OHC 3 Kemnaker RI', 'Midiatama', 'v', '', '', '', ''),
(7, 'Endro Nurdianto', 'PT Kilap Propertindo', '23 - 25 Juli 2025', 'Friday, 25 July 2025', 'P3K Kemnaker RI Ahli K3 Listrik Kemnaker RI', 'Midiatama', 'v', '', '', '', ''),
(8, 'Ivan Susanto', 'PT Paramount Bed Indonesia', '7 -28 Mei 2025', '', 'P3K Kemnaker RI Ahli K3 Listrik Kemnaker RI', 'Midiatama', 'v', '', '', '', ''),
(9, 'Jenly Makaluk', 'PT Minahasa Cahaya Lestari', '7 - 27 Agustus 2025', 'Dijadwalkan', 'Ahli K3 Listrik Kemnaker RI', 'Midiatama', 'v', '', '', '', ''),
(10, 'Sasi Kirana', 'PT Minahasa Cahaya Lestari', '18 - 30 Agustus 2025', 'Dijadwalkan', 'Ahli K3 Umum Kemnaker RI', 'KEM', 'v', '', '', '', ''),
(11, 'Daffa Yaya', 'PT Minahasa Cahaya Lestari', '18 - 30 Agustus 2025', 'Dijadwalkan', 'Ahli K3 Umum Kemnaker RI', 'KEM', 'v', '', '', '', ''),
(12, 'Hendra Gunawan', 'PT Standard Indonesia Industry', '19 Agustus - 01 September 2025', 'Dijadwalkan', 'Ahli K3 Umum Kemnaker RI', 'KEM', 'v', '', '', '', ''),
(13, 'Eko Filyawan', 'PT Minahasa Cahaya Lestari', '20 - 22 Agustus 2025', 'Friday, 22 August 2025', 'Manager Energi BNSP', 'CAC', 'v', '', '', '', ''),
(14, 'Laksamana Riadi', '', '', '', '', '', '', '', '', '', ''),
(15, 'Andyan Prabowo', '', '', '', '', '', '', '', '', '', ''),
(16, 'Dede Endang Setiawan', 'PT. Supra Ferbindo Farma', '25 - 28 Agustus 2025', '29 Agustus & 09 September 2025', 'OPTP Kelas 1 KEMNAKER', '', '', '', '', '', ''),
(17, 'Zulfikar Ali', '', '', '', '', '', '', '', '', '', ''),
(18, 'Abu Bakar Sidik', '', '', '', '', '', '', '', '', '', '');