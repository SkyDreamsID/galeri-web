# 📸 Galeri - Premium Visual Journal & CMS

Sebuah platform galeri foto premium dan jurnal visual, dibangun menggunakan teknologi modern untuk fotografer yang ingin memamerkan mahakaryanya dengan elegan.

Proyek ini bukan sekadar *image viewer*, melainkan **Aplikasi Full-Stack dengan CMS (Content Management System) Internal**, ekstraksi data EXIF otomatis, *showcase* perlengkapan (Gear Management), dan integrasi radio streaming interaktif.

> 🌐 **Web Preview:** [jurnalvisual.vercel.app](https://jurnalvisual.vercel.app)

## ✨ Fitur Utama

- 🎨 **Kustomisasi Tema Dinamis**: Ubah skema warna web (Primary, Light Bg, Dark Bg) langsung dari Dasbor Admin tanpa menyentuh kode!
- ⚙️ **Web CMS (Pengaturan Dinamis)**: Ubah nama website, teks footer, logo, dan tautan media sosial secara instan.
- 🖼️ **Masonry Grid & Smart Crop**: Menampilkan foto dalam *grid* rapi dengan pengoptimalan orientasi cerdas (integrasi Cloudinary).
- 📸 **Auto-EXIF Extraction**: Mengunggah foto secara otomatis mengekstrak metadata kamera (Kamera, Lensa, Focal Length, Aperture, ISO, Shutter Speed).
- ©️ **Per-Photo Copyright & Watermark Dinamis**: Hak cipta per-foto dinamis. Watermark nama copyright di-*render* langsung via Cloudinary URL (tanpa merusak gambar asli) dan dapat dikontrol per-foto dari Admin.
- 🎒 **Gear Showcase**: Integrasi komponen yang memamerkan inventaris kamera & lensa yang digunakan.
- 📻 **Gallery Radio**: Widget pemutar musik *real-time* (mendukung link ZenoFM, Icecast, Shoutcast).
- ⚡ **Optimasi Kecepatan & SEO**: Menggunakan *Infinite Scroll*, Server Actions (Next.js 14+), PWA Support, dan SEO Tags cerdas.
- 📱 **Fluid Responsive & Pixel-Perfect**: Tata letak yang dioptimalkan untuk segala skenario orientasi perangkat lengkap dengan *Custom Components*.
- 🔒 **Admin Dashboard**: Panel kontrol terisolasi yang dilindungi Middleware untuk mengunggah foto, manajemen galeri, dan pengaturan situs (Mobile Friendly!).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + React 19
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS v4 & [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Media Storage**: [Cloudinary](https://cloudinary.com/)
- **Animasi**: Framer Motion, Embla Carousel
- **Lainnya**: `next-pwa`, `next-themes`, `sonner`, `react-zoom-pan-pinch`, `exifr`

---

## 🚀 Panduan Instalasi Lengkap (Tutorial untuk Forker)

Jika Anda melakukan *fork* atau *clone* pada repositori ini, ikuti panduan komprehensif ini untuk menjalankan proyek ini di komputer Anda.

### Tahap 1: Persiapan
Pastikan Anda sudah menginstal tool berikut di komputer Anda:
- **Node.js v18.18 atau lebih baru** ([Download Node.js](https://nodejs.org/)) — *Wajib! Proyek ini tidak akan bisa dijalankan di Node.js di bawah v18.18.*
- **Git** ([Download Git](https://git-scm.com/))
- Akun [Supabase](https://supabase.com/) (gratis)
- Akun [Cloudinary](https://cloudinary.com/) (gratis)

> 💡 Cek versi Node.js Anda dengan perintah: `node -v`

### Tahap 2: Clone & Instalasi Dependencies
```bash
git clone https://github.com/SkyDreamsID/galeri-web.git
cd galeri-web
npm install
```

### Tahap 3: Konfigurasi Supabase (Database & Keamanan)
Proyek ini menyimpan semua teks dan relasi data di Supabase.
1. Buat proyek baru di [Supabase](https://supabase.com/).
2. Masuk ke menu **SQL Editor**, buat **New Query**, *copy-paste* seluruh kode SQL di bawah ini, lalu klik **RUN**.

```sql
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
```

### Tahap 4: Buat Akun Login Admin
1. Di dasbor Supabase, masuk ke menu **Authentication > Providers > Email**.
2. **MATIKAN (Disable)** opsi `Confirm email` agar Anda tidak perlu repot verifikasi email. Klik Save.
3. Masuk ke menu **Authentication > Users**, lalu klik **Add User** > **Create new user**.
4. Masukkan Email dan Password. **Catatan:** Email boleh ngasal/fiktif (contoh: `admin@galeri.com`), yang penting Anda ingat karena ini dipakai mutlak untuk masuk ke Panel Admin web ini.
5. Ceklis kotak `Auto Confirm User?` (jika muncul), lalu klik **Create User**.

### Tahap 5: Konfigurasi Cloudinary (Penyimpanan Foto)
1. Buat akun di [Cloudinary](https://cloudinary.com/).
2. Ambil `Cloud Name`, `API Key`, dan `API Secret` dari dasbor Cloudinary (ada di halaman Dashboard utama). Rahasiakan ini dengan baik.

### Tahap 6: Setup Environment Variables (.env.local)
Ubah nama file `.env.example` menjadi `.env.local` di *root* folder proyek Anda, lalu isi dengan kredensial yang sudah Anda dapatkan:

```env
# ==========================================
# SUPABASE CONFIGURATION (Wajib Diisi)
# ==========================================
# Ambil dari: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# ==========================================
# CLOUDINARY CONFIGURATION (Untuk Fitur Upload Foto)
# ==========================================
# Ambil dari: Cloudinary Dashboard
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

> **⚠️ PERINGATAN KEAMANAN**: Jangan pernah membagikan nilai `CLOUDINARY_API_SECRET`. Jangan commit `.env.local` ke repositori publik!

> **💡 Tips**: `Cloud Name` dan konfigurasi tambahan lainnya (seperti URL radio) juga bisa diatur langsung dari **Admin Panel → Pengaturan** setelah aplikasi berjalan.

### Tahap 7: Jalankan Aplikasi
```bash
npm run dev
```
Buka `http://localhost:3000` untuk melihat web publik Anda, dan buka `http://localhost:3000/admin` untuk masuk ke Panel Admin.

---

## ⚙️ Menggunakan Web CMS (Pengaturan Admin)

Setelah berhasil login ke `/admin`, navigasikan ke menu **Pengaturan**. Di sini Anda bisa:
- **Kustomisasi Tema**: Ubah warna *Primary*, warna Latar Belakang (Dark & Light) menggunakan kode Hex tanpa perlu membuka editor kode.
- **Identitas Web**: Mengubah Nama Author, Judul Hero, Teks Footer, Logo Situs.
- **Logo Media Sosial**: Anda dapat mengunggah ikon logo (gambar PNG/SVG) kustom untuk setiap tautan media sosial yang ditambahkan.
- **Widget Radio Streaming**: Masukkan URL *streaming* langsung (contoh: Icecast URL atau ZenoFM URL) untuk memunculkan pemutar musik *chill/lo-fi* di web Anda.
- **Pengaturan Cloudinary**: Masukkan Cloud Name dari akun Cloudinary Anda (alternatif dari `.env.local`).

### Mengelola Watermark Per-Foto
Saat upload atau mengedit foto, tersedia checkbox **"Tampilkan watermark"** di bawah opsi lisensi tiap foto. Jika dicentang, nama copyright akan ditampilkan sebagai watermark transparan di pojok kanan bawah foto (diproses via Cloudinary, tanpa merusak file asli).

---

## 🚀 Deployment ke Vercel

1. Push kode Anda ke GitHub.
2. Buka [Vercel](https://vercel.com/) dan buat proyek baru dengan cara import repo GitHub tersebut.
3. Di bagian konfigurasi Vercel, masuk ke **Environment Variables** dan tambahkan semua variabel yang ada di file `.env.local` Anda.
4. Klik **Deploy** dan website anda akan online dan siap diakses publik!

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE). Anda bebas menggunakan dan memodifikasinya, **dengan syarat tetap mencantumkan kredit ke repositori asal** ([galeri-web](https://github.com/SkyDreamsID/galeri-web)) dan tidak menghapus atribusi *"Designed by SkyDreamsID"* yang muncul secara otomatis di footer jika Anda mengganti nama author.

---
*Built with logic, passion, and AI assistance by a Tech Enthusiast.*
