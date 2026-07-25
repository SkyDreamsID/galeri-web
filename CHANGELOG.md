# 📝 Changelog

Dokumen ini mencatat seluruh riwayat pembaruan, perbaikan bug, dan optimasi fitur pada proyek **Galeri Web**.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mematuhi [Semantic Versioning](https://semver.org/).

---

## [1.3.0] - 2026-07-25

### ✨ New Features & Improvements
- **Interactive Watermark Customizer**: Pengaturan kustomisasi watermark di Admin Dashboard dengan area *Live Preview 4:3* terintegrasi grid panah 3x3 (9 arah posisi) bergaya aplikasi editing foto profesional.
- **Font Selector with Native Dropdown Preview**: Menambahkan pilihan font (Arial, Montserrat, Noto Sans, Playfair Display, Monospace/Courier, Playpen Sans) di mana setiap opsi di-render menggunakan bentuk font aslinya langsung di dalam *dropdown*.
- **Montserrat Cinematic Spacing**: Menerapkan *letter-spacing* tipis (0.5px) khusus font Montserrat untuk memberikan efek estetis dan elegan pada watermark fotografi.
- **Real-Time Synchronized Watermark Engine**: Pengaturan posisi, font, ukuran, dan transparansi watermark berlaku secara *real-time* ke seluruh foto publik di seluruh halaman (`Home`, `Post Detail`, `Albums`, `Collections`, `Tags`).
- **Cloudinary Font & Position Translation**: Menyelaraskan nama font dan posisi ke format Cloudinary URL (`g_north`, `g_south`, `g_west`, `g_east`, dll) serta konversi otomatis font `Monospace` ke `Courier` agar tidak *fallback* ke Arial.
- **Cache-Busting Server Action**: Menambahkan *Server Action* (`actions.ts`) dan pemaksaan *route dynamic* untuk menghapus *cache* Next.js secara instan saat tombol simpan diklik.

---

## [1.2.0] - 2026-07-25

### ✨ New Features & Improvements
- **Serverless API Relay Upload**: Mem-bypass pemblokiran *AdBlocker* / *Private DNS* di browser HP (Mobile CORS Block) dengan merutekan proses unggah Cloudinary via Base64 lewat backend Next.js (`/api/cloudinary/upload`).
- **Multi-Level Compression Options**: Menambahkan *dropdown* kualitas resolusi foto (Asli, Tinggi, Sedang, Rendah) untuk mengakomodasi koneksi jaringan internet yang lambat.
- **Original Filename Preservation**: Mempertahankan nama asli foto yang diunggah via API *Base64* ke Cloudinary agar nama file tidak menjadi ID acak saat di-*download* kembali.
- **Custom Delete Confirmation Modal**: Menggantikan dialog bawaan browser (`confirm()`) saat menghapus momen dengan Modal Dialog custom estetik yang dilengkapi *backdrop blur*, ikon peringatan merah (`AlertTriangle`), serta penegasan nama momen yang dihapus.
- **Real-Time Compression & Upload Progress**: Menampilkan status teks progres yang informatif saat foto sedang dikompresi (misal: `Mengompres foto "DSC_012.JPG" (1/3)...`) maupun saat diunggah ke Cloudinary.
- **Ultra-Low Memory Compression Pipeline**: Mengoptimalkan sistem kompresi 4K di perangkat HP menggunakan `URL.createObjectURL` & `canvas.toBlob()` untuk mengeliminasi lonjakan RAM JS dan mencegah error `Failed to fetch`.
- **Downscale-Only 4K Threshold**: Memastikan foto dengan resolusi tinggi disesuaikan ke maksimal 3840px (4K), sementara foto beresolusi di bawah 4K tetap pada ukuran aslinya tanpa di-upscale/merusak kualitas.
- **Redesigned Copyright Pill Input**: Menyempurnakan tata letak input copyright pada kartu foto (Upload & Edit form) dengan format vertikal, prefiks ikon `©`, dan *fallback* nama author otomatis jika dikosongkan.
- **Global EXIF Privacy Toggle**: Menambahkan opsi untuk menyembunyikan metadata EXIF secara global per postingan dari pengunjung publik.
- **Physical EXIF Injection (`piexifjs`)**: Mengekstrak kode biner EXIF dari foto asli dan menyuntikkannya ke foto hasil kompresi kanvas agar metadata tetap utuh saat diunduh.
- **Smart Copyright Memory (Autocomplete)**: Input teks "Copyright Name" kini dilengkapi dengan *datalist* yang memberikan saran otomatis dari histori nama kreator sebelumnya.
- **Quick Status Toggle**: Status tayang (PUBLIK/PRIBADI) kini bisa diubah secara instan langsung dari halaman daftar galeri tanpa perlu masuk ke form *Edit*.
- **Admin Navigation Scroll Reset**: Memaksa posisi scroll me-reset ke paling atas `(0,0)` saat masuk atau berpindah antar halaman di Admin Dashboard.
- **App Version Badge**: Menampilkan versi aplikasi (v1.2.0) di ujung bawah komponen `Footer` halaman publik dan Admin Sidebar.

### 🐛 Fixed & Optimized
- **Card Spacing UI Fix**: Merapikan padding dan jarak vertikal (*gap*) ganda yang berlebihan antara *CardHeader* dan *CardContent* pada form *Upload* dan *Edit*.
- **Mobile Network Drop (Failed to Fetch)**: Mengatasi terputusnya koneksi unggah ke Cloudinary pada browser HP akibat pemblokiran pihak ketiga dan lonjakan pemakaian memori.
- **Mobile Tag Input Bug**: Memperbaiki masalah pada *keyboard virtual* (HP) di mana menekan *Enter* atau Spasi pada kolom Tag sering kali digabung menjadi satu kalimat.
- **Unhandled Promise Rejection**: Mencegah dan menangkap *error* di konsole saat antrean proses unggah (*worker*) dibatalkan secara manual oleh pengguna (Klik "Batal").

---

## [1.1.0] - 2026-07-24

### ⚡ Added & Optimized
- **Instant Home Tag Filtering**: Memunculkan filter tag di halaman utama tanpa me-reload komponen atau berpindah halaman route (`/?tag=...` dengan `scroll={false}`).
- **Admin Gallery Infinite Scroll**: Pengambilan data di halaman `Kelola Galeri Admin` kini menggunakan metode batch (12 item per halaman) + `IntersectionObserver` agar tidak berat dan tidak boros kuota.
- **Native Image Lazy Loading**: Menambahkan atribut `loading="lazy"` dan `decoding="async"` pada thumbnail kartu momen di panel admin.
- **Sticky Header & Search Bar**: Memosisikan area judul dan kolom pencarian di Admin Gallery agar melayang (*sticky top-0*) secara responsif di Desktop & Mobile.
- **Collection Badge with Icon**: Mengubah indikator album/koleksi di detail post menjadi lebih informatif (`📁 Koleksi: [Nama Album]`) serta menyembunyikannya secara penuh jika post tidak memiliki album.
- **Post Loading Skeleton**: Memperbarui tampilan skeleton `loading.tsx` di detail post agar proporsional dan transisi pudar (*fade-in*) lebih halus saat konten selesai dimuat.
- **Touch Delay Elimination**: Menambahkan `touch-action: manipulation` pada `html, body` untuk menghilangkan delay 300ms saat tombol diklik pada perangkat seluler.

### 🐛 Fixed
- **Cloudinary Delete Payload**: Memperbaiki method request hapus Cloudinary menggunakan `POST` dengan body `public_ids` (array).
- **Settings Form State**: Memperbaiki pengeditan link media sosial di `SettingsForm` menggunakan *deep clone* agar tidak mengalami lag/side-effect.
- **Invalid CSS Selector**: Mengganti penulisan selector `.space-y-0.5` pada method `.closest()` di `Sidebar.tsx` untuk mencegah Runtime SyntaxError.
- **Scroll Position Restoration**: Memaksa posisi scroll awal tetap di koordinat `0` saat membuka halaman foto baru.

---

## [1.0.0] - 2026-07-15

### 🚀 Initial Release
- Rilis resmi pertama aplikasi Galeri Web dengan CMS Internal, Supabase Auth/RLS, Cloudinary Auto-Watermark & EXIF Extraction, Masonry Layout, ZenoFM Radio Widget, Gear Showcase, dan PWA Support.
