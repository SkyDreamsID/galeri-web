# 📸 Galeri - Jurnal Visual Fotografi

Sebuah platform galeri foto premium dan jurnal visual, dibangun menggunakan teknologi modern untuk fotografer yang ingin memamerkan mahakaryanya dengan elegan. 

Proyek ini tidak hanya sekadar *image viewer*, tetapi dilengkapi dengan sistem manajemen CMS (*Content Management System*) eksklusif, ekstraksi data EXIF otomatis, dan *showcase* perlengkapan (Gear Management).

## ✨ Fitur Utama

- **Masonry Grid & Smart Crop**: Menampilkan foto dalam *grid* yang rapi dan teroptimasi ukurannya (dukungan orientasi *landscape* & *portrait*).
- **Auto-EXIF Extraction**: Mengunggah foto secara otomatis mengekstrak metadata kamera (Kamera, Lensa, *Focal Length*, Aperture, ISO, *Shutter Speed*, Waktu).
- **Per-Photo Copyright**: Hak cipta yang dapat dikonfigurasi per-foto, sangat cocok untuk kolaborasi *agency* atau kontributor ganda.
- 🌓 **Mode Gelap Legendaris**: UI responsif dengan tema gelap premium (Classic Studio/Legendary UI).
- ⚙️ **Gear Showcase**: Integrasi komponen yang memamerkan kamera & lensa yang digunakan.
- 📻 **Gallery Radio**: Widget pemutar musik Lo-Fi real-time terintegrasi dengan Zeno.fm dan Last.fm API untuk *cover art* dinamis.
- ⚡ **Optimasi Kecepatan**: Menggunakan *Infinite Scroll* (Muat Lebih Banyak) & Server Actions untuk performa super cepat.
- **Admin Dashboard**: Panel kontrol terisolasi (dilindungi Auth) untuk mengunggah *(drag & drop)* foto, manajemen galeri, dan kelola perlengkapan *(gears)*.
- **Cloudinary Integration**: Penyimpanan gambar, pengoptimalan (*WebP/AVIF* otomatis), dan pemotongan cerdas (*smart cropping*) secara otomatis di *cloud*.
- **Premium UI/UX**: Mendukung mode gelap/terang, desain efek kaca (*glassmorphism*), dan animasi halus yang memanjakan mata *(Framer Motion & Embla Carousel)*.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL & Auth)
- **Media Storage**: [Cloudinary](https://cloudinary.com/)
- **Animasi & UI Ekstra**: Framer Motion, Embla Carousel, Lucide React
- **EXIF Parser**: `exifr`

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/SkyDreamsID/galeri-web.git
   cd galeri-web
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables (`.env.local`):**
   Ganti nilai-nilai di bawah ini dengan kredensial dari Supabase dan Cloudinary Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) di *browser* Anda. Untuk masuk ke dasbor admin, akses [http://localhost:3000/admin](http://localhost:3000/admin).

## 📄 Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE). Anda bebas untuk menggunakan, memodifikasi, dan mendistribusikannya.
