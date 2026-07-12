-- Hapus tabel lama jika ada (Hati-hati, ini akan menghapus data lama!)
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS exif_data CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- 1. Table: collections (Kategori Spesifik / Album)
CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT
);

-- 2. Table: tags (Sistem Tagging)
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE
);

-- 3. Table: posts (Induk Cerita / Momen)
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  story TEXT,
  location VARCHAR,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  license_type VARCHAR DEFAULT 'Copyright',
  status VARCHAR DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: photos (Gambar & Metadata Cloudinary)
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  public_id VARCHAR NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  sort_order INTEGER NOT NULL
);

-- 5. Table: exif_data (Data Kamera per Foto)
CREATE TABLE exif_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  camera VARCHAR,
  lens VARCHAR,
  focal_length VARCHAR,
  aperture VARCHAR,
  iso VARCHAR,
  shutter_speed VARCHAR,
  date_taken TIMESTAMPTZ
);

-- 6. Table: post_tags (Pivot Many-to-Many)
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Aktifkan RLS untuk semua tabel
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE exif_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- POLICY: Publik cuma bisa BACA (SELECT) postingan yang statusnya 'Published'
CREATE POLICY "Publik bisa melihat post Published" ON posts
  FOR SELECT USING (status = 'Published');

CREATE POLICY "Publik bisa melihat foto dari post Published" ON photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = photos.post_id AND posts.status = 'Published')
  );

CREATE POLICY "Publik bisa melihat exif dari post Published" ON exif_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM photos 
      JOIN posts ON photos.post_id = posts.id 
      WHERE photos.id = exif_data.photo_id AND posts.status = 'Published'
    )
  );

-- Koleksi dan Tag bisa dilihat semua orang (bebas)
CREATE POLICY "Publik bisa melihat koleksi" ON collections FOR SELECT USING (true);
CREATE POLICY "Publik bisa melihat tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Publik bisa melihat post_tags" ON post_tags FOR SELECT USING (true);

-- POLICY: HANYA Admin (Authenticated) yang bisa TULIS (INSERT, UPDATE, DELETE)
-- (Catatan: Anda harus login pakai Supabase Auth biar dianggap Authenticated)
CREATE POLICY "Admin full akses posts" ON posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses photos" ON photos FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses exif_data" ON exif_data FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses collections" ON collections FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses tags" ON tags FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses post_tags" ON post_tags FOR ALL TO authenticated USING (true);
