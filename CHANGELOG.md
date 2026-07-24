# 📝 Changelog

Dokumen ini mencatat seluruh riwayat pembaruan, perbaikan bug, dan optimasi fitur pada proyek **Galeri Web**.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.0.0/), dan proyek ini mematuhi [Semantic Versioning](https://semver.org/).

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
