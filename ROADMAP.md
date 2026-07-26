# 🗺️ Roadmap & Development Plan: Jurnal Visual

Dokumen ini mendefinisikan fase pengembangan proyek Jurnal Visual dengan framework **Next.js**, UI **Tailwind CSS + shadcn/ui**, serta dukungan sistem **Multi-upload**. Alur ini telah disesuaikan agar sejalan dengan arsitektur utama.

## 🏆 Development Milestones

### Phase 1: Foundation & Architecture Planning (Selesai)
*Fokus: Struktur, Keamanan, dan Arsitektur Multi-Upload*
- [x] Pembuatan Spesifikasi Teknis yang diperketat (Roadmap & Blueprint V2)
- [x] Desain Skema Database Nesting (`posts`, `photos`, `exif_data`, `collections`, `tags`, `post_tags`, `gears`)
- [x] Inisialisasi Repositori GitHub
- [x] Setup Proyek Supabase (Tabel Induk, Tabel Anak, Tabel Pivot)
- [x] Menerapkan aturan RLS (Row Level Security) di Supabase
- [x] Setup Supabase Auth
- [x] Setup Akun Cloudinary dan konfigurasi keamanan
- [x] Inisialisasi Proyek Next.js (`npx create-next-app` + Tailwind CSS)
- [x] Instalasi pustaka UI (shadcn/ui, Embla Carousel, Framer Motion, Lucide React)

### Phase 2: Web Admin Dashboard (Selesai)
*Fokus: Membangun ruang kerja internal dengan proteksi keamanan tinggi.*
- [x] Setup Halaman Login Admin (`/admin/login`)
- [x] Pembuatan **Next.js Middleware** untuk mengunci rute `/admin`
- [x] Pembuatan Layout Admin (Sidebar, Navigation)
- [x] Pembuatan Endpoint API `/api/cloudinary/sign`
- [x] Pembuatan Endpoint API `/api/post/delete`
- [x] Pembuatan Endpoint API `/api/views` (View tracking)
- [x] Pembuatan Endpoint API `/api/download` (Aman unduh foto)
- [x] Integrasi Library `exifr` untuk ekstraksi EXIF dari beberapa file sekaligus
- [x] Pembuatan Form "New Post" (Multi File, Auto EXIF)
- [x] Logika penyimpanan beruntun dengan validasi backend
- [x] Halaman Daftar Post di Admin
- [x] **Gear Management**: Fitur CRUD untuk menambah, menghapus, dan melampirkan gambar perlengkapan/gear di dashboard admin (`/admin/gear`).

### Phase 3: Frontend Core UI & Design System (Selesai)
*Fokus: Aesthetics, UX mulus, dan tipografi elegan.*
- [x] Setup Tema dengan Tailwind dan variabel warna premium (Glassmorphism & Nature tones)
- [x] Halaman `Home` (Menampilkan cover foto, grid masonry, Infinite Scroll skeleton)
- [x] Halaman `Post Detail` (Header, Lokasi, Carousel Foto, EXIF per foto, Story, Download Button)
- [x] Fitur Eksplorasi: Halaman `/albums`, `/collection/[id]`, dan `/tag/[tag]` untuk navigasi galeri
- [x] Integrasi **Embla Carousel** untuk pengalaman *swipe* foto yang mulus di Mobile & PC
- [x] Modal/Overlay dinamis untuk memunculkan EXIF masing-masing foto di dalam carousel
- [x] Komponen UI Canggih: `ProgressiveImage` (blur-to-sharp) dan `ViewTracker`
- [x] **My Gear Modal**: Integrasi modal pameran alat fotografi di `Navbar`
- [x] **Per-Photo Copyright**: Memungkinkan personalisasi hak cipta dinamis untuk tiap foto yang dirender dalam satu album.
- [x] Dark Mode Enhancement: Toggle tema Gelap/Terang.
- [x] Transisi Framer Motion & Tipografi Plus Jakarta Sans.

### Phase 3.5: Playground Migration & Refinement (Selesai)
*Fokus: Memindahkan hasil eksperimen UI/UX (Playground) ke produksi utama.*
- [x] Merapikan komponen hasil eksperimen di `/playground` (Hero Section, Glassmorphism, dll).
- [x] Migrasi desain Navbar 3-Mode (Mobile, Tablet, Desktop) ke komponen utama.
- [x] Memigrasikan rute `/playground` ke `src/app` sebagai rute utama *website*.
- [x] Membersihkan folder *sandbox* yang tersisa.

### Phase 4: Frontend Integration & Optimization (Selesai)
*Fokus: Menghubungkan UI publik dengan Supabase dan optimasi performa.*
- [x] Fetching Data Post di Halaman Depan dengan **Pagination / Infinite Scroll** via tombol "Muat Lebih Banyak".
- [x] Fetching Data Detail Post (Join antara `posts`, `photos`, `exif_data`)
- [x] Manajemen Konten Admin Tambahan: Edit Post (`/admin/edit/[id]`), Manajemen Tag (`/admin/tags`), Manajemen Koleksi (`/admin/collections`)
- [x] Toast Notification (Pesan Sukses/Gagal beranimasi) tanpa menggunakan alert bawaan.

### Phase 5: Polishing, Customization, & Deployment (Selesai 100%)
*Fokus: Kustomisasi UI tingkat lanjut, optimasi UX, stabilisasi, dan persiapan Go-Live.*
- [x] **Gallery Radio**: Integrasi Widget Streaming Radio (Zeno.fm, Icecast, dll).
- [x] **Web CMS (Settings)**: Fitur Pengaturan Website dinamis di Admin untuk edit identitas, medsos, footer, dan streaming radio.
- [x] **Kustomisasi Tema Dinamis**: Pengaturan warna antarmuka (Primary, Light Background, Dark Background) yang disimpan di database dan di-*inject* secara runtime.
- [x] **Logo Sosial Media Kustom**: Mendukung unggahan ikon (gambar) kustom untuk tautan sosial media di footer.
- [x] **Penyempurnaan Gear & Admin UX**: Fitur *Edit Gear* dan optimasi tata letak Admin di *mobile* (isolasi layout dari navbar global, optimasi tombol tanpa *hover*).
- [x] **Penyempurnaan Tag & Form**: Sinkronisasi tag cerdas (autocomplete) untuk halaman Upload dan Edit, dengan pemaksaan format huruf kecil (lowercase) otomatis.
- [x] **Stabilisasi Sistem**: Resolusi kompatibilitas *searchParams* Promise pada Next.js 15/14+ dan penanganan error gracefully.
- [x] **Next.js SEO Tags** & Image Alt Automation.
- [x] **PWA Support** (Progressive Web App) agar web bisa diinstal selayaknya aplikasi.
- [x] **Fluid Responsive UI**: Optimasi *grid* khusus *mobile landscape* (rasio 45:55), modifikasi Custom Dropdown (menggantikan elemen native OS), dan Custom 404 Page *Dark Mode*.
- [x] **Admin Mobile Optimization**: Penyempurnaan UX *Sticky Search Bar* dengan efek *glassmorphism* dan pemadatan *grid* kelola galeri khusus *mobile* tanpa memecah *layout desktop*.
- [x] **Legal & Attribution**: Sistem Watermark Attribution di footer (opsional sebagai identitas asli proyek) & penerapan lisensi MIT License.
- [x] Deployment Frontend + Admin ke Vercel/Netlify.
- [x] Peluncuran Versi 1.0 (Live).

### Phase 6: Advanced Gallery Features (Paused - Feature Freeze)
*Fokus: Kustomisasi tingkat lanjut dan interaksi pengunjung. (Dihentikan sementara untuk fokus ke tahap Polish).*
- [x] **Dynamic Watermark (Cloudinary)**: Menerapkan watermark dinamis (nama copyright) pada URL gambar secara on-the-fly via Cloudinary text layer transform. Dapat dikontrol **per-foto** (bukan global) dari Admin Panel saat Upload maupun Edit — nilai disimpan di kolom `photos.show_watermark`. Tanpa merusak file asli.
- [~] **Per-Photo Analytics**: ~~Mencatat dan menampilkan jumlah *views* (kunjungan) secara spesifik untuk masing-masing foto.~~ *(Dibatalkan: Terlalu rumit secara logika dan struktur database, cukup gunakan hitungan per-post/judul).*
- [x] **Share to IG Stories & Meta Creator**: Refactor metadata kreator dan tombol Share untuk mendukung karya kolaborasi dan *multi-creator*.
- [x] **Post Analytics (Views, Downloads, Shares)**: Pelacakan statistik per-post dengan sistem RPC Supabase dan Rate-Limiting.
- [x] **Admin Analytics Dashboard**: Konsolidasi toggle statistik publik (Views, Downloads, & Shares) di panel admin.

### Phase 7: ✨ Polish (Selesai 100%)
*Fokus: Memoles dan menstabilkan web pasca-rilis v1.0 (menuju v1.1). Tidak ada penambahan fitur baru.*
- [x] Fix bug & Stabilisasi (Resolusi React Hydration Error #418 via pembungkus deterministik `formatDate`)
- [x] Animasi & Micro-interactions (Optimasi pre-fetch Infinite Scroll, loading spinner & hover interaktif)
- [x] Performa & Loading speed (Optimasi LCP `priority` & Cloudinary responsive sizing)
- [x] SEO Optimization (Next.js Metadata, Alt Text otomatis & PageSpeed SEO 100/100)
- [x] Responsive & Layout refinement (Koreksi Masonry Grid, CSS Columns & isolasi layout mobile/tablet)
- [x] Accessibility (Penguatan kontras warna teks nav/footer & perapian hierarki tag HTML `<h1>` -> `<h2>`)

### Phase 7.5: Post-Launch Patches (v1.2.0)
*Fokus: Stabilitas unggahan di perangkat seluler (Mobile) dan fitur manajemen kualitas (Compression).*
- [x] **Serverless API Relay Upload**: Menghindari pemblokiran koneksi API pihak ketiga oleh HP (AdBlock/Private DNS) via rute lokal `/api/cloudinary/upload`.
- [x] **Multi-Level Compression Options**: Menambahkan *dropdown* pemilihan kualitas (Asli, Tinggi, Sedang, Rendah) untuk mengakomodasi sinyal lemah.
- [x] **Ultra-Low Memory Pipeline**: Mencegah *crash* dan lonjakan RAM saat unggah banyak file 4K di browser seluler (*Failed to fetch* fix).
- [x] **Original Filename Preservation**: Memastikan metadata nama asli foto tidak lenyap saat file diproses sebagai Base64 di server Next.js.

### Phase 7.6: Interactive Watermark Studio & Cloudinary Engine (v1.3.0 - Selesai 100%)
*Fokus: Kustomisasi watermark tingkat lanjut dengan Studio Preview 4:3, Font Selector interaktif, dan penanganan cache server.*
- [x] **Interactive Watermark Studio (4:3 Preview)**: Penggabungan area preview foto 4:3 dengan grid 3x3 panah navigasi posisi (9 arah) langsung melayang interaktif.
- [x] **Google Fonts Selector & Native Dropdown Preview**: Penambahan font Arial, Montserrat, Noto Sans, Playfair Display, Monospace, dan Playpen Sans dengan visualisasi font asli di dalam opsi *dropdown*.
- [x] **Montserrat Letter-Spacing**: Penerapan *letter-spacing* tipis (0.5px) khusus font Montserrat untuk nuansa estetika fotografi profesional.
- [x] **Cloudinary Font & Position Translation Engine**: Penerjemahan posisi 9 arah (`g_north`, `g_south`, `g_west`, `g_east`, dll) dan pemetaan otomatis `Monospace` -> `Courier` agar Cloudinary URL dirender secara presisi.
- [x] **Server Cache Invalidator**: Integrasi Server Action `revalidateSettings()` dan `export const dynamic = 'force-dynamic'` pada root layout untuk memastikan seluruh halaman publik menyinkronkan data secara *real-time*.

### Phase 7.7: Watermark Engine Robustness & Context Fixes (v1.3.1 - Selesai 100%)
- [x] Kustomisasi *Dropup* & *Safe Font Mapping* untuk sinkronisasi kompatibilitas dengan layanan Cloudinary.
- [x] Perbaikan posisi overlay dan opacity level Watermark.
- [x] Isolasi tombol *Reset Theme* pada dasbor yang bebas intervensi pengaturan lain.
- [x] **Guaranteed Cloudinary Fonts**: Pemetaan font aman ke 6 font bawaan Cloudinary (`Arial`, `Roboto`, `Courier`, `Georgia`, `Verdana`, `Times`) untuk mengeliminasi error HTTP 400 Bad Request.
- [x] **Cloudinary Overlay Syntax & Opacity Fix**: Pemisahan transparansi ke parameter `,o_${opacity}` serta penataan ulang offset posisi (`g_north`, `g_south`, `g_center`, dll).
- [x] **React Context Hook Fix**: Memperbaiki destructuring `useSiteSettings()` di seluruh komponen frontend publik sehingga tema & watermark tersinkronkan 100%.
- [x] **CustomSelect Dropup Placement**: Menambahkan opsi `placement="top"` pada `CustomSelect` untuk dropdown yang berada di dasar halaman.
- [x] **Isolated Theme Color Reset**: Memastikan tombol "Reset ke Default" hanya mengembalikan warna latar/aksen tanpa mempengaruhi watermark atau statistik publik.
- [x] **Stale Auth Cookie Cleanup**: Menghapus otomatis cookie auth kadaluarsa di Next.js Middleware untuk menghilangkan spaming error di console terminal.

### Phase 7.8: SEO & UI Polishing (v1.3.2 - Selesai 100%)
- [x] Peningkatan kualitas SEO Open Graph untuk menampilkan deskripsi dinamis (2-3 baris) langsung dari ekstraksi teks cerita foto.
- [x] Migrasi `window.confirm` bawaan *browser* ke *Modern Modal Dialog* di dasbor Admin demi konsistensi *user experience*.

---

## 🚀 Future Expansion Plan (Ide Baru Post v1.0)

1. **Client Booking/Hiring Page**: Formulir *booking* langsung untuk klien yang ingin menyewa jasa fotografi.
2. **Timeline Photography**: *View mode* kronologis (*Timeline Slider*) berdasarkan metadata tanggal jepretan EXIF.
3. **Color Palette Extractor**: Mengekstrak warna dominan tiap foto saat diupload dan menampilkannya di halaman web sebagai aksen estetika dinamis.
4. **Free Footage Distribution**: Sistem bagi-bagi video resolusi tinggi (B-Roll/Footage) menggunakan *Embed* YouTube untuk *preview* dan link *Google Drive/Mega* untuk unduhan agar bandwidth Cloudinary/Vercel tetap aman.
5. **Pemisahan Entitas Kreator & Hak Cipta**: Saat ini `copyright_name` diasumsikan sebagai identitas kreator. Jika di masa depan field tersebut digunakan eksklusif sebagai pemegang hak cipta (organisasi/penerbit), pertimbangkan penambahan tabel/field `creator` terpisah agar metadata multi-kreator lebih akurat.
6. [x] **Injeksi EXIF Fisik Pasca-Kompresi (`piexifjs`)**: Mengekstrak kode biner EXIF dari foto asli, lalu disuntikkan secara paksa ke foto hasil autokompresi web (Canvas). Tujuannya agar pengunjung yang mengunduh file hasil kompresi tetap mendapatkan metadata kamera yang utuh (menambah sedikit beban client-side). *(Selesai)*
7. [x] **Toggle Privasi EXIF Global per Postingan**: Menambahkan opsi/toggle di form *Upload* dan *Edit Momen* untuk menyembunyikan metadata EXIF secara global per postingan dari pengunjung. *(Selesai)*