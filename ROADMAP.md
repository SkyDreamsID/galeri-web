# 🗺️ Master Roadmap & Expansion Plan: Gallery (ULTRA-DETAIL V2)

Dokumen ini mendefinisikan fase pengembangan proyek Gallery dengan framework **Next.js**, UI **Tailwind CSS + shadcn/ui**, serta dukungan sistem **Nesting Photo (Multi-upload)**. Alur ini telah disesuaikan agar sejalan dengan Blueprint V2 (Keamanan, Validasi, dan Optimasi Database).

## 🏆 Development Milestones

### Phase 1: Foundation & Bulletproof Planning (Selesai)
*Fokus: Struktur, Keamanan, dan Arsitektur Multi-Upload*
- [x] Pembuatan Spesifikasi Teknis yang diperketat (Roadmap & Blueprint V2)
- [x] Desain Skema Database Nesting (`posts`, `photos`, `exif_data`, `collections`, `tags`, `post_tags`)
- [x] Inisialisasi Repositori GitHub
- [x] Setup Proyek Supabase (Tabel Induk, Tabel Anak, Tabel Pivot)
- [x] Menerapkan aturan RLS (Row Level Security) yang kaku di Supabase
- [x] Setup Supabase Auth (Membuat 1 akun Admin tunggal secara manual)
- [x] Setup Akun Cloudinary dan konfigurasi keamanan
- [x] Inisialisasi Proyek Next.js (`npx create-next-app` + Tailwind CSS)
- [x] Instalasi pustaka UI (shadcn/ui, Embla Carousel, Framer Motion, Lucide React)

### Phase 2: Web Admin Dashboard (Secure & Validated)
*Fokus: Membangun ruang kerja internal dengan proteksi keamanan tinggi.*
- [ ] Setup Halaman Login Admin (`/admin/login`)
- [ ] Pembuatan **Next.js Middleware** untuk mengunci rute `/admin` (Redirect jika tidak ada token Supabase Auth)
- [ ] Pembuatan Layout Admin (Sidebar, Navigation)
- [ ] Pembuatan Endpoint API `/api/cloudinary/sign` (SUPER RESTRICTED: Wajib cek sesi server-side)
- [ ] Pembuatan Endpoint API `/api/post/delete` (Termasuk fitur Cloudinary *Hard Delete* dan *Rollback* jika gagal)
- [ ] Integrasi Library `exifr` untuk ekstraksi EXIF dari beberapa file sekaligus (termasuk `focal_length`)
- [ ] Pembuatan Form "New Post" (Input Judul, Story, Tag/Koleksi, dan Multiple File Input)
- [ ] Logika penyimpanan beruntun dengan validasi backend: (Wajib cek maks 1 `is_cover = true` per post)
- [ ] Halaman Daftar Post di Admin untuk mengelola galeri

### Phase 3: Frontend Core UI & Design System
*Fokus: Aesthetics, UX mulus, dan tipografi elegan.*
- [ ] Setup Tema dengan Tailwind dan variabel warna premium
- [ ] Pembuatan Komponen Dasar (Header, Footer, Navbar)
- [ ] Halaman `Home` (Menampilkan cover foto, grid konstan 4:3 / 3:4 dengan Smart Crop)
- [ ] Halaman `Gallery` (Grid layout dengan Smart Crop)
- [ ] Halaman `Post Detail` (Struktur wajib: Header, Lokasi, Carousel Foto, EXIF per foto, Story, Download Button)
- [ ] Integrasi **Embla Carousel** untuk pengalaman *swipe* foto yang mulus di Mobile & PC
- [ ] Modal/Overlay dinamis untuk memunculkan EXIF masing-masing foto di dalam carousel

### Phase 4: Frontend Integration & Data Fetching
*Fokus: Menghubungkan UI publik dengan Supabase dan optimasi performa.*
- [ ] Fetching Data Post di Halaman Depan dengan **Limit & Offset (Pagination / Infinite Scroll)** agar server tidak berat
- [ ] Fetching Data Detail Post (Join antara `posts`, `photos`, `exif_data`, `tags`, dan `collections`)
- [ ] Logika Search System
- [ ] Micro-interactions (Framer Motion transitions, hover efek premium)

### Phase 5: Polishing, SEO, & Deployment
*Fokus: Optimasi performa dan Go-Live.*
- [ ] Next.js SEO Tags (Title, Meta Description, Open Graph)
- [ ] Optimasi UX (Loading Skeletons dengan shadcn)
- [ ] Deployment Frontend + Admin ke Vercel
- [ ] Uji Coba Flow Lengkap (Upload -> Validasi -> Tampil -> Delete -> Cek Orphaned Files)
- [ ] Peluncuran Versi 1.0 (Live)

---

## 🚀 Future Expansion Plan (Post v1.0)

1. **Gallery Radio**: Menggunakan Zeno.fm dan secara default mute (harus play manual).
2. **Timeline Photography**: View mode berdasarkan urutan rilis waktu.
3. **Advanced Analytics**: Integrasi tracking views untuk setiap Post.
4. **Dark Mode Enhancement**: Toggle tema Gelap/Terang mulus (terintegrasi bawaan Next.js/Tailwind).
5. **Smooth Page Animation**: Transisi antar halaman gaya aplikasi *Native* menggunakan Framer Motion.
