# 📸 Galeri - Premium Visual Journal & CMS

Sebuah platform galeri foto premium dan jurnal visual, dibangun menggunakan teknologi modern untuk fotografer yang ingin memamerkan mahakaryanya dengan elegan. 

Proyek ini bukan sekadar *image viewer*, melainkan **Aplikasi Full-Stack dengan CMS (Content Management System) Internal**, ekstraksi data EXIF otomatis, *showcase* perlengkapan (Gear Management), dan integrasi radio lo-fi interaktif.

![Web Preview](public/preview.png) *(Silakan ganti dengan screenshot web Anda)*

## ✨ Fitur Utama

- **Web CMS (Pengaturan Dinamis)**: Ubah nama website, teks footer, *social media links*, dan ID ZenoFM langsung dari Dasbor Admin tanpa menyentuh kode!
- **Masonry Grid & Smart Crop**: Menampilkan foto dalam *grid* rapi dengan pengoptimalan orientasi cerdas (integrasi Cloudinary).
- **Auto-EXIF Extraction**: Mengunggah foto secara otomatis mengekstrak metadata kamera (Kamera, Lensa, Focal Length, Aperture, ISO, Shutter Speed).
- **Per-Photo Copyright & Easter Egg**: Hak cipta per-foto dinamis (cocok untuk *agency*). Dilengkapi *easter egg* khusus jika template ini di-fork!
- ⚙️ **Gear Showcase**: Integrasi komponen yang memamerkan kamera & lensa yang digunakan.
- 📻 **Gallery Radio (ZenoFM)**: Widget pemutar musik *real-time* yang bisa dinonaktifkan secara otomatis jika ID dikosongkan.
- ⚡ **Optimasi Kecepatan**: Menggunakan *Infinite Scroll* & Server Actions (Next.js 14+) untuk performa super cepat.
- **Admin Dashboard**: Panel kontrol terisolasi (dilindungi Auth Middleware) untuk mengunggah *(drag & drop)* foto, manajemen galeri, dan pengaturan situs.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+ (App Router + Turbopack)](https://nextjs.org/)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Media Storage**: [Cloudinary](https://cloudinary.com/)
- **Animasi**: Framer Motion, Embla Carousel

---

## 🚀 Panduan Instalasi Lengkap (Tutorial untuk Forker)

Jika Anda melakukan *fork* atau *clone* pada repositori ini, ikuti langkah-langkah berikut untuk menghidupkan proyek ini di komputer Anda.

### 1. Clone & Instalasi
```bash
git clone https://github.com/SkyDreamsID/galeri-web.git
cd galeri-web
npm install
```

### 2. Konfigurasi Supabase (Database & Auth)
Proyek ini sangat bergantung pada Supabase.
1. Buat proyek baru di [Supabase](https://supabase.com/).
2. Masuk ke menu **SQL Editor** di Supabase, dan jalankan rancangan skema tabel berikut (Atau buat secara manual via Table Editor):
   - `site_settings`: id (uuid), site_title (varchar), author_name (varchar), hero_title (varchar), hero_description (text), footer_text (text), social_links (jsonb), zenofm_station_id (varchar).
   - `collections`: id (uuid), name (varchar), description (text).
   - `posts`: id (uuid), title (varchar), story (text), location (varchar), status (varchar), collection_id (fk).
   - `photos`: id (uuid), post_id (fk), image_url (varchar), public_id (varchar), is_cover (boolean), copyright_name (varchar), sort_order (int).
   - `exif_data`: photo_id (fk), camera, lens, focal_length, aperture, iso, shutter_speed.
   - `gears`: id (uuid), name, type, description, image_url, public_id.
3. Buat satu baris *default* di tabel `site_settings` agar web tidak *error* saat pertama dirender.
4. Masuk ke menu **Authentication > Users** di Supabase, lalu buat satu **Add User** baru. Ini akan menjadi akun login Admin Anda.

### 3. Konfigurasi Cloudinary (Penyimpanan Foto)
1. Buat akun di [Cloudinary](https://cloudinary.com/).
2. Ambil `Cloud Name`, `API Key`, dan `API Secret` dari dasbor Cloudinary Anda.

### 4. Setup Environment Variables
Ubah nama file `.env.example` menjadi `.env.local` di *root* folder proyek, lalu isi dengan kredensial Anda:

```env
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# CLOUDINARY
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ZENO FM (Opsional, juga bisa diatur dari Dasbor Admin)
NEXT_PUBLIC_ZENO_STATION_ID="cnho9wgxkkovv"
```

> **⚠️ Keamanan Penting**: `CLOUDINARY_API_SECRET` adalah rahasia dapur. Jangan pernah menaruhnya di tabel Database CMS, biarkan ia tetap aman di dalam `.env.local`!

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) untuk melihat web publik, dan buka [http://localhost:3000/admin/login](http://localhost:3000/admin/login) untuk masuk ke Dasbor Admin menggunakan akun Supabase Auth yang baru Anda buat.

---

## ⚙️ Menggunakan Web CMS (Pengaturan Admin)

Setelah berhasil login ke `/admin`, navigasikan ke menu **Pengaturan**. Di sini Anda bisa:
- **Mengubah Nama Author & Teks Utama**: Tanpa menyentuh *source code*.
- **Manajemen Link Sosial Media**: Tambah/Hapus URL sesuka hati (Instagram, GitHub, dll).
- **Zeno.fm Radio**: Masukkan *Station ID* Zeno.fm Anda agar pemutar musik *lo-fi* muncul di pojok web. Jika dikosongkan, widget otomatis disembunyikan. 

## 📄 Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE). Anda bebas untuk menggunakan, memodifikasi, dan mendistribusikannya secara personal maupun komersial.

---
*Built with logic, passion, and AI assistance by a Tech Enthusiast.*
