# 📸 Galeri - Premium Visual Journal & CMS

Sebuah platform galeri foto premium dan jurnal visual, dibangun menggunakan teknologi modern untuk fotografer yang ingin memamerkan mahakaryanya dengan elegan.

Proyek ini bukan sekadar *image viewer*, melainkan **Aplikasi Full-Stack dengan CMS (Content Management System) Internal**, ekstraksi data EXIF otomatis, *showcase* perlengkapan (Gear Management), dan integrasi radio streaming interaktif.

> 🌐 **Web Preview:** [jurnalvisual.vercel.app](https://jurnalvisual.vercel.app)

## 💡 Mengapa Jurnal Visual?
Dibuat untuk fotografer dan seniman visual yang ingin memiliki kontrol penuh atas *branding*, metadata SEO, dan koleksi karyanya sendiri tanpa batasan platform pihak ketiga (sosial media atau galeri publik). Repositori ini memberikan Anda kemerdekaan teknis 100%.

<details>
<summary><b>📸 Preview Jurnal Visual (Klik untuk memperluas)</b></summary>
<br>

Segera Hadir..

</details>

## ✨ Fitur Utama

- 🎨 **Kustomisasi Tema Dinamis**: Ubah skema warna web (Primary, Light Bg, Dark Bg) langsung dari Dasbor Admin tanpa menyentuh kode!
- ⚙️ **Web CMS (Pengaturan Dinamis)**: Ubah nama website, teks footer, logo, dan tautan media sosial secara instan.
- 🖼️ **Masonry Grid & Smart Crop**: Menampilkan foto dalam *grid* rapi dengan pengoptimalan orientasi cerdas (integrasi Cloudinary).
- 📸 **Auto-EXIF Extraction**: Mengunggah foto secara otomatis mengekstrak metadata kamera (Kamera, Lensa, Focal Length, Aperture, ISO, Shutter Speed).
- ©️ **Per-Photo Copyright & Watermark Dinamis**: Hak cipta per-foto dinamis. Watermark nama copyright di-*render* langsung via Cloudinary URL (tanpa merusak gambar asli) dan dapat dikontrol per-foto dari Admin.
- 🎒 **Gear Showcase**: Integrasi komponen yang memamerkan inventaris kamera & lensa yang digunakan.
- 📻 **Gallery Radio**: Widget pemutar musik *real-time* (mendukung link ZenoFM, Icecast, Shoutcast).
- ⚡ **Optimasi Kecepatan & SEO**: Menggunakan *Infinite Scroll*, Server Actions (Next.js 14+), PWA Support, dan SEO Tags cerdas.
- 👥 **Collaborative Identity / Multi-Creator**: Mendukung karya kolaborasi di mana setiap foto dapat memiliki kreator berbeda, dan metadata SEO otomatis menyesuaikan nama kreator (e.g., A, B & C).
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
2. Buka file `setup.sql` yang ada di dalam root folder proyek ini.
3. Masuk ke menu **SQL Editor** di Supabase, buat **New Query**, *copy-paste* seluruh isi file `setup.sql` tersebut, lalu klik **RUN**. (File tersebut sudah berisi pembuatan tabel otomatis beserta aturan keamanan RLS-nya).

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
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

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
