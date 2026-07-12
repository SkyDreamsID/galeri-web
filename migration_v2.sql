-- ==========================================
-- DATABASE MIGRATION V2 (Gallery Project)
-- ==========================================

-- 1. Menambahkan kolom slug untuk SEO di tabel posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug VARCHAR UNIQUE;

-- 2. Menambahkan metadata gambar di tabel photos untuk keamanan migrasi CDN masa depan
ALTER TABLE photos ADD COLUMN IF NOT EXISTS bytes INTEGER;              -- Ukuran file dalam bytes
ALTER TABLE photos ADD COLUMN IF NOT EXISTS format VARCHAR;             -- Ekstensi file (jpg, png, webp, dll)
ALTER TABLE photos ADD COLUMN IF NOT EXISTS original_filename VARCHAR;  -- Nama file asli sebelum diupload
