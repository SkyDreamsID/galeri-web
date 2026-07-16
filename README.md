# 📸 Galeri - Premium Visual Journal & CMS

Sebuah platform galeri foto premium dan jurnal visual, dibangun menggunakan teknologi modern untuk fotografer yang ingin memamerkan mahakaryanya dengan elegan. 

Proyek ini bukan sekadar *image viewer*, melainkan **Aplikasi Full-Stack dengan CMS (Content Management System) Internal**, ekstraksi data EXIF otomatis, *showcase* perlengkapan (Gear Management), dan integrasi radio streaming interaktif.

![Web Preview](public/preview.png) *(Silakan ganti dengan screenshot web Anda)*

## ✨ Fitur Utama

- 🎨 **Kustomisasi Tema Dinamis**: Ubah skema warna web (Primary, Light Bg, Dark Bg) langsung dari Dasbor Admin tanpa menyentuh kode!
- ⚙️ **Web CMS (Pengaturan Dinamis)**: Ubah nama website, teks footer, dan logo tautan media sosial secara instan.
- 🖼️ **Masonry Grid & Smart Crop**: Menampilkan foto dalam *grid* rapi dengan pengoptimalan orientasi cerdas (integrasi Cloudinary).
- 📸 **Auto-EXIF Extraction**: Mengunggah foto secara otomatis mengekstrak metadata kamera (Kamera, Lensa, Focal Length, Aperture, ISO, Shutter Speed).
- ©️ **Per-Photo Copyright**: Hak cipta per-foto dinamis (cocok untuk *agency* yang menaungi banyak fotografer). 
- 🎒 **Gear Showcase**: Integrasi komponen yang memamerkan inventaris kamera & lensa yang digunakan.
- 📻 **Gallery Radio**: Widget pemutar musik *real-time* (mendukung link ZenoFM, Icecast, Shoutcast).
- ⚡ **Optimasi Kecepatan & SEO**: Menggunakan *Infinite Scroll*, Server Actions (Next.js 14+), PWA Support, dan SEO Tags cerdas.
- 🔒 **Admin Dashboard**: Panel kontrol terisolasi yang dilindungi Middleware untuk mengunggah foto, manajemen galeri, dan pengaturan situs (Mobile Friendly!).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14/15 (App Router)](https://nextjs.org/)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Media Storage**: [Cloudinary](https://cloudinary.com/)
- **Animasi**: Framer Motion, Embla Carousel

---

## 🚀 Panduan Instalasi Lengkap (Tutorial untuk Forker)

Jika Anda melakukan *fork* atau *clone* pada repositori ini, ikuti panduan komprehensif ini untuk menghidupkan proyek ini di komputer atau server Anda.

### Tahap 1: Persiapan
Pastikan Anda sudah menginstal **Node.js** dan **Git** di komputer Anda. Anda juga membutuhkan akun [Supabase](https://supabase.com/) (gratis) dan [Cloudinary](https://cloudinary.com/) (gratis).

### Tahap 2: Clone & Instalasi Dependencies
```bash
git clone https://github.com/USERNAME_ANDA/galeri-web.git
cd galeri-web
npm install
```

### Tahap 3: Konfigurasi Supabase (Database & Keamanan)
Proyek ini menyimpan semua teks dan relasi data di Supabase.
1. Buat proyek baru di [Supabase](https://supabase.com/).
2. Masuk ke menu **SQL Editor**, buat **New Query**, *copy-paste* kode SQL sakti di bawah ini, lalu klik **RUN**. Kode ini akan membuatkan semua tabel yang dibutuhkan dan mengunci keamanannya secara otomatis.

```sql
-- 1. BUAT TABEL
CREATE TABLE collections (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, name varchar, description text);
CREATE TABLE site_settings (id uuid PRIMARY KEY, site_title varchar, author_name varchar, hero_title varchar, hero_description text, footer_text text, contact_email varchar, social_links jsonb, zenofm_station_id varchar, theme_config jsonb);
CREATE TABLE tags (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, name varchar);
CREATE TABLE gears (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, name varchar, type varchar, description text, image_url varchar, public_id varchar, created_at timestamptz DEFAULT now());
CREATE TABLE posts (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, title varchar, story text, location varchar, status varchar DEFAULT 'Draft', license_type varchar DEFAULT 'Copyright', collection_id uuid REFERENCES collections(id) ON DELETE SET NULL, created_at timestamptz DEFAULT now());
CREATE TABLE photos (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, post_id uuid REFERENCES posts(id) ON DELETE CASCADE, image_url varchar, public_id varchar, is_cover boolean DEFAULT false, copyright_name varchar, sort_order int, bytes bigint, format varchar, original_filename varchar);
CREATE TABLE exif_data (photo_id uuid REFERENCES photos(id) ON DELETE CASCADE, camera varchar, lens varchar, focal_length varchar, aperture varchar, iso varchar, shutter_speed varchar, date_taken timestamptz);
CREATE TABLE post_tags (post_id uuid REFERENCES posts(id) ON DELETE CASCADE, tag_id uuid REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY(post_id, tag_id));

-- 2. INSERT DEFAULT SETTINGS (Wajib agar tidak error)
INSERT INTO site_settings (id, site_title, author_name, hero_title) VALUES ('00000000-0000-0000-0000-000000000000', 'Galeri', 'Admin', 'Jurnal Visual');

-- 3. AKTIFKAN FITUR KEAMANAN (RLS)
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

-- 5. ATURAN TULIS (INSERT, UPDATE, DELETE) - HANYA UNTUK ADMIN (YANG SUDAH LOGIN)
CREATE POLICY "Admin Insert posts" ON posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update posts" ON posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin Delete posts" ON posts FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admin Insert photos" ON photos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update photos" ON photos FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin Delete photos" ON photos FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admin Insert exif_data" ON exif_data FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update exif_data" ON exif_data FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin Delete exif_data" ON exif_data FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admin Insert collections" ON collections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update collections" ON collections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin Delete collections" ON collections FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admin Insert tags" ON tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update tags" ON tags FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin Delete tags" ON tags FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admin Insert post_tags" ON post_tags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update post_tags" ON post_tags FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin Delete post_tags" ON post_tags FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admin Insert gears" ON gears FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update gears" ON gears FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin Delete gears" ON gears FOR DELETE TO authenticated USING (true);
CREATE POLICY "Admin Insert site_settings" ON site_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update site_settings" ON site_settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin Delete site_settings" ON site_settings FOR DELETE TO authenticated USING (true);
```

### Tahap 4: Buat Akun Login Admin
1. Di dasbor Supabase, masuk ke menu **Authentication > Users**.
2. Klik **Add User** > **Create new user**.
3. Masukkan Email dan Password. Ini akan menjadi akun mutlak Anda untuk masuk ke Panel Admin web ini.

### Tahap 5: Konfigurasi Cloudinary (Penyimpanan Foto)
1. Buat akun di [Cloudinary](https://cloudinary.com/).
2. Ambil `Cloud Name`, `API Key`, dan `API Secret` dari dasbor Cloudinary (ada di halaman Dashboard utama). Rahasiakan ini dengan baik.

### Tahap 6: Setup Environment Variables (.env.local)
Ubah nama file `.env.example` menjadi `.env.local` di *root* folder proyek Anda, lalu masukkan kredensial yang sudah Anda dapatkan:

```env
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# CLOUDINARY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# CMS DEFAULTS (Bisa diganti nanti lewat Admin Panel)
NEXT_PUBLIC_ZENO_STATION_ID=""
```

> **⚠️ PERINGATAN KEAMANAN**: Jangan pernah membagikan nilai `CLOUDINARY_API_SECRET`. Jangan commit `.env.local` ke repositori publik!

### Tahap 7: Jalankan Aplikasi
```bash
npm run dev
```
Buka `http://localhost:3000` untuk melihat web publik Anda, dan buka `http://localhost:3000/admin` untuk masuk ke Panel Admin.

---

## ⚙️ Menggunakan Web CMS (Pengaturan Admin)

Setelah berhasil login ke `/admin`, navigasikan ke menu **Pengaturan**. Di sini Anda bisa:
- **Kustomisasi Tema**: Ubah warna *Primary*, warna Latar Belakang (Dark & Light) menggunakan kode Hex tanpa perlu membuka editor kode.
- **Identitas Web**: Mengubah Nama Author, Judul Hero, Teks Footer.
- **Logo Media Sosial**: Anda dapat mengunggah ikon logo (gambar PNG/SVG) kustom untuk setiap tautan media sosial yang ditambahkan.
- **Widget Radio Streaming**: Masukkan URL *streaming* langsung (contoh: Icecast URL atau ZenoFM URL) untuk memunculkan pemutar musik *chill/lo-fi* di web Anda.

---

## 🚀 Deployment ke Vercel

1. Push kode Anda ke GitHub.
2. Buka [Vercel](https://vercel.com/) dan buat proyek baru dengan cara import repo GitHub tersebut.
3. Di bagian konfigurasi Vercel, masuk ke **Environment Variables** dan tambahkan semua variabel yang ada di file `.env.local` Anda.
4. Klik **Deploy** dan nikmati mahakarya Anda terbang ke internet!

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE). Anda bebas menggunakan, memodifikasi, dan mendistribusikannya secara personal maupun komersial, baik untuk agensi Anda maupun portfolio pribadi.

---
*Built with logic, passion, and AI assistance by a Tech Enthusiast.*
