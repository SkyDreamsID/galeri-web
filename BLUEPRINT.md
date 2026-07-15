# 🏛️ Blueprint Arsitektur & Spesifikasi Teknis: Gallery (ULTRA-DETAIL V2)

Dokumen ini memuat detail teknis, arsitektur sistem, alur kerja, dan desain database tingkat lanjut yang **FINAL & BULLETPROOF**. Telah disempurnakan mencakup fitur-fitur baru seperti Manajemen Hak Cipta Per-Foto dan Inventaris Perlengkapan Fotografi (Gears).

## 1. Arsitektur Inti & Teknologi Spesifik

*   **Framework Utama:** **Next.js 14+ (App Router)**.
*   **UI/UX Stack:** 
    *   **Tailwind CSS** (Styling utama).
    *   **shadcn/ui** (Komponen dasar UI seperti Button, Input, Modal, Dropdown).
    *   **Embla Carousel** (Library bawaan shadcn/ui untuk fitur *Swipe/Next/Previous* foto yang sangat mulus di Mobile & Desktop).
    *   **Framer Motion** (Untuk transisi antar halaman dan mikro-animasi).
    *   **Lucide React** (Untuk Iconografi seperti tombol `(i)`, panah next/prev, dll).
*   **Database & Auth:** **Supabase (PostgreSQL)**. HANYA menyimpan data teks relasional.
*   **Image Storage:** **Cloudinary** sebagai CDN dan penyimpanan aset media.
*   **Keamanan Ekstra (Middleware):** Akses rute `/admin` dilindungi oleh **Next.js Middleware**. Jika tidak ada token sesi *Supabase Auth*, otomatis dialihkan ke `/admin/login`.

## 2. Keamanan Database (Row Level Security / RLS)

Untuk mencegah orang lain mengacak-acak database via endpoint publik, kita mengunci tabel di Supabase dengan aturan RLS yang kaku:
1. **Aturan SELECT (Baca)**: Siapa saja (*Anon*) boleh membaca tabel `posts`, `photos`, `exif_data`, dan `gears` (untuk fitur modal My Gear) secara bebas.
2. **Aturan INSERT, UPDATE, DELETE (Tulis)**: HANYA *Authenticated User* (Admin yang sudah login via Supabase Auth) yang boleh menambah, mengubah, atau menghapus data.

## 3. Desain Database Detail (Nesting & Relasi)

### Table: `posts` (Induk Cerita / Momen)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, Auto | Unique identifier |
| `title` | VARCHAR | Not Null | Judul momen/post |
| `story` | TEXT | Nullable | Cerita utama momen tersebut |
| `location` | VARCHAR | Nullable | Nama lokasi pemotretan |
| `collection_id`| UUID | Foreign Key | Relasi ke tabel `collections` |
| `license_type` | VARCHAR | Default 'Copyright' | Status hak cipta ('Free Copyright' / 'Copyright') secara *default/fallback* |
| `status` | VARCHAR | Default 'Draft' | Visibilitas post ('Published' / 'Draft') |
| `created_at` | TIMESTAMPZ | Default NOW() | Tanggal posting |

### Table: `photos` (Gambar, Copyright Spesifik & Metadata Cloudinary)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, Auto | Unique identifier gambar |
| `post_id` | UUID | Foreign Key | Relasi ke tabel `posts` ON DELETE CASCADE |
| `image_url` | VARCHAR | Not Null | Link gambar resolusi asli dari Cloudinary |
| `public_id` | VARCHAR | Not Null | ID Cloudinary (wajib untuk hapus gambar fisik) |
| `is_cover` | BOOLEAN | Default FALSE | Penanda gambar ini adalah cover utama. |
| `copyright_name` | VARCHAR | Nullable | Nama pemilik foto (Fitur Per-Foto Copyright) |
| `sort_order`| INTEGER | Not Null | Urutan gambar |

### Table: `exif_data` (Data Kamera per Foto)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `photo_id` | UUID | Foreign Key | Relasi ke tabel `photos` ON DELETE CASCADE |
| `camera` | VARCHAR | Nullable | Model kamera |
| `lens` | VARCHAR | Nullable | Model lensa |
| `focal_length` | VARCHAR | Nullable | Panjang fokus lensa (misal: 300mm) |
| `aperture` | VARCHAR | Nullable | Nilai aperture |
| `iso` | VARCHAR | Nullable | Nilai ISO |
| `shutter_speed`| VARCHAR | Nullable | Kecepatan rana |
| `date_taken` | TIMESTAMPZ| Nullable | Waktu & tanggal asli jepretan dari EXIF |

### Table: `gears` (Inventaris Perlengkapan Fotografi)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, Auto | Unique identifier perlengkapan |
| `name` | VARCHAR | Not Null | Nama alat (contoh: Nikon D3300) |
| `type` | VARCHAR | Not Null | Jenis alat ('Kamera', 'Lensa', 'Drone', dll) |
| `description` | TEXT | Nullable | Spesifikasi atau catatan kaki |
| `image_url` | VARCHAR | Nullable | Link gambar alat di Cloudinary |
| `public_id` | VARCHAR | Nullable | ID gambar Cloudinary |
| `created_at` | TIMESTAMPZ | Default NOW() | Tanggal pembuatan record |

### Table: `site_settings` (Global Configuration & CMS)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Identifier unik (selalu sama) |
| `site_title` | VARCHAR | Nullable | Judul website global |
| `author_name` | VARCHAR | Nullable | Nama pemilik / Author |
| `hero_title` | VARCHAR | Nullable | Judul besar di halaman utama |
| `hero_description` | TEXT | Nullable | Deskripsi halaman utama |
| `footer_text` | TEXT | Nullable | Teks pada bagian footer |
| `social_links` | JSONB | Nullable | Daftar tautan sosial media |
| `zenofm_station_id`| VARCHAR | Nullable | ID stream stasiun ZenoFM |
| `lastfm_username` | VARCHAR | Nullable | (Segera Hadir) Last.fm Username |
| `lastfm_api_key` | VARCHAR | Nullable | (Segera Hadir) Last.fm API |

*(Tabel `collections`, `tags`, dan `post_tags` berlanjut seperti sebelumnya).*

## 4. UI Flow Publik & Navigasi

1. **Home (`/`)**: 
   - **Pagination / Infinite Scroll**: Membatasi query (`LIMIT 9 OFFSET 0`) yang dimuat via tombol "Muat Lebih Banyak".
   - Tampilan Grid Masonry CSS menggunakan properti *break-inside-avoid* dan efek sorotan (*glassmorphism hover*).
2. **Post Detail (`/post/[slug]`)**: 
   - **Area Foto (Atas)**: Menggunakan **Embla Carousel** (Swipe/Next/Prev). Tombol `(i) EXIF` melayang memicu *Popover/Modal* untuk menunjukkan Exif *lens*, *camera*, dll.
   - Hak Cipta Per-Foto ditampilkan dinamis mengikuti nilai `copyright_name` pada tabel `photos`, atau mundur (*fallback*) ke "SkyDreamsID".
3. **Gear Showcase Modal**:
   - Memicu klik dari `PlaygroundNavbar` (Lainnya -> My Gear).
   - Menampilkan modal responsif terpusat yang memetakan isi tabel `gears` ke dalam kategori (Kamera, Lensa).

## 5. Flowchart API & Manajamen Logika Baru

### Alur Tambah / Hapus Gear di Dashboard (`/admin/gear`)
1. Admin memasukkan nama perlengkapan dan (opsional) mengunggah foto fisik alat.
2. Web mengunggah ke rute Cloudinary (memakai `/api/cloudinary/sign`) dengan parameter folder khusus `galeri_gears`.
3. Setelah *image_url* dan *public_id* dikembalikan oleh Cloudinary, web merekam ke tabel `gears` Supabase.
4. UI memunculkan peringatan (Pop-up Toast Custom) tanpa menggunakan `alert()` bawaan peramban.

### Logika Ekstraksi Hak Cipta
Pada komponen unggah galeri (`UploadForm`), admin diberikan kotak centang (*checkbox*) untuk memilih gambar spesifik yang akan menerima `copyright_name`. Data diunggah ke `photos` secara bergilir, dan EXIF di-*parse* secara klien sebelum pengiriman HTTP.

### Sistem CMS & Fallback Konfigurasi (SiteSettings)
Untuk mendukung *forkability* dan kemudahan pengaturan:
1. Data dari `site_settings` ditarik **sekali saja** di tingkat global (`src/app/layout.tsx`).
2. Data disalurkan ke semua komponen *Client* dan *Server* via `SiteSettingsContext`.
3. **Fallback Logic:** Jika API eksternal (seperti ZenoFM) dikosongkan di Dasbor Admin, sistem akan otomatis jatuh kembali (membaca) dari variabel *environment* `.env.local` pengguna.
4. **Keamanan API:** Rahasia API (seperti Cloudinary API Secret) **TIDAK PERNAH** diekspos ke antarmuka CMS untuk mencegah kebocoran saat *hydration* Next.js, dan dipertahankan khusus di `.env.local`.
