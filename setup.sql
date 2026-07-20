-- =====================================================
-- GALERI WEB - FULL DATABASE SETUP (Jalankan sekaligus)
-- =====================================================

-- 1. BUAT TABEL
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY,
  site_title VARCHAR,
  author_name VARCHAR,
  hero_title VARCHAR,
  hero_description TEXT,
  footer_text TEXT,
  contact_email VARCHAR,
  social_links JSONB,
  zenofm_station_id VARCHAR,
  lastfm_username VARCHAR,
  lastfm_api_key VARCHAR,
  cloudinary_cloud_name VARCHAR,
  site_logo_url VARCHAR,
  theme_config JSONB
);

CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS gears (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  description TEXT,
  image_url VARCHAR,
  public_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE,
  story TEXT,
  location VARCHAR,
  status VARCHAR DEFAULT 'Draft',
  license_type VARCHAR DEFAULT 'Copyright',
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  public_id VARCHAR NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  copyright_name VARCHAR,
  license_type VARCHAR DEFAULT 'Copyright',
  show_watermark BOOLEAN DEFAULT TRUE,
  sort_order INTEGER NOT NULL,
  bytes BIGINT,
  format VARCHAR,
  original_filename VARCHAR
);

CREATE TABLE IF NOT EXISTS exif_data (
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  camera VARCHAR,
  lens VARCHAR,
  focal_length VARCHAR,
  aperture VARCHAR,
  iso VARCHAR,
  shutter_speed VARCHAR,
  date_taken TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 2. DATA DEFAULT WAJIB (Agar Admin Panel tidak error)
INSERT INTO site_settings (id, site_title, author_name, hero_title)
VALUES ('00000000-0000-0000-0000-000000000000', 'Galeri', 'Admin', 'Jurnal Visual')
ON CONFLICT (id) DO NOTHING;

-- 3. AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE exif_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE gears ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 4. ATURAN BACA (SELECT) - TERBUKA UNTUK PUBLIK
CREATE POLICY "Publik Boleh Baca posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Publik Boleh Baca photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Publik Boleh Baca exif_data" ON exif_data FOR SELECT USING (true);
CREATE POLICY "Publik Boleh Baca collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Publik Boleh Baca tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Publik Boleh Baca post_tags" ON post_tags FOR SELECT USING (true);
CREATE POLICY "Publik Boleh Baca gears" ON gears FOR SELECT USING (true);
CREATE POLICY "Publik Boleh Baca site_settings" ON site_settings FOR SELECT USING (true);

-- 5. ATURAN TULIS - HANYA UNTUK ADMIN (Authenticated)
CREATE POLICY "Admin full akses posts" ON posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses photos" ON photos FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses exif_data" ON exif_data FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses collections" ON collections FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses tags" ON tags FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses post_tags" ON post_tags FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses gears" ON gears FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full akses site_settings" ON site_settings FOR ALL TO authenticated USING (true);
