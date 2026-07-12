# 🏛️ Blueprint Arsitektur & Spesifikasi Teknis: Gallery (ULTRA-DETAIL V2)

Dokumen ini memuat detail teknis, arsitektur sistem, alur kerja, dan desain database tingkat lanjut yang **FINAL & BULLETPROOF**. Telah disempurnakan (V2) menambal semua celah logika *database*, keamanan *endpoint*, dan penanganan *error*.

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
1. **Aturan SELECT (Baca)**: Siapa saja (*Anon*) boleh membaca tabel `posts`, `photos`, dan `exif_data` yang statusnya `Published`.
2. **Aturan INSERT, UPDATE, DELETE (Tulis)**: HANYA *Authenticated User* (Admin yang sudah login via Supabase Auth) yang boleh menambah, mengubah, atau menghapus data.

## 3. Desain Database Detail (Nesting & Relasi)

### Table: `posts` (Induk Cerita / Momen)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, Auto | Unique identifier |
| `title` | VARCHAR | Not Null | Judul momen/post |
| `story` | TEXT | Nullable | Cerita utama momen tersebut |
| `location` | VARCHAR | Nullable | Nama lokasi pemotretan |
| `collection_id`| UUID | Foreign Key | Relasi ke tabel `collections` (Kategori Utama) |
| `license_type` | VARCHAR | Default 'Copyright' | Status hak cipta ('Free Copyright' / 'Copyright') |
| `status` | VARCHAR | Default 'Draft' | Visibilitas post ('Published' / 'Draft') |
| `created_at` | TIMESTAMPZ | Default NOW() | Tanggal posting |

### Table: `photos` (Gambar & Metadata Cloudinary)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, Auto | Unique identifier gambar |
| `post_id` | UUID | Foreign Key | Relasi ke tabel `posts` ON DELETE CASCADE |
| `image_url` | VARCHAR | Not Null | Link gambar resolusi asli dari Cloudinary |
| `public_id` | VARCHAR | Not Null | ID Cloudinary (wajib untuk hapus gambar fisik) |
| `is_cover` | BOOLEAN | Default FALSE | Penanda gambar ini adalah cover utama. *Backend Next.js WAJIB memvalidasi hanya ada 1 cover per post_id.* |
| `sort_order`| INTEGER | Not Null | Urutan gambar (0 = Slide 1, 1 = Slide 2, dst) |

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

### Table: `collections` (Kategori Spesifik / Album)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key, Auto | Unique identifier |
| `name` | VARCHAR | Not Null | Nama koleksi (misal: Railway, Landscape) |
| `description` | TEXT | Nullable | Deskripsi kategori |

### Table: `tags` & `post_tags` (Sistem Tagging)
**Tabel `tags`**:
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | ID Tag |
| `name` | VARCHAR | Not Null, Unique | Nama tag (misal: CC206) |

**Tabel `post_tags` (Pivot Many-to-Many)**:
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `post_id` | UUID | Foreign Key | Relasi ke `posts` ON DELETE CASCADE |
| `tag_id` | UUID | Foreign Key | Relasi ke `tags` ON DELETE CASCADE |


## 4. UI Flow Publik & Aturan Crop Thumbnail

1. **Home (`/`) & Gallery (`/gallery`)**: 
   - **Pagination / Infinite Scroll**: WAJIB membatasi query (misal: `LIMIT 15 OFFSET 0`) agar server dan browser tidak *hang* saat foto sudah ribuan.
   - Mengambil 1 gambar anak (`photos`) yang `is_cover = true` dari post yang `Published`.
   - **Tampilan Grid Konsisten**: Menggunakan fitur *Smart Crop* Cloudinary. Foto asli *Landscape* -> **4:3**. Foto asli *Portrait* -> **3:4**.
2. **Post Detail (`/post/[id]`)**: 
   - **Struktur Layout Halaman Spesifik (Wajib Diikuti saat Coding)**:
     1. **Area Foto (Atas)**: Menggunakan **Embla Carousel** (Swipe/Next/Prev) dengan titik indikator di bawahnya (`• o o`). Tombol `(i) EXIF` melayang di pojok kanan bawah **setiap slide foto**. Foto di-*load* maksimal 1080px (*preview* cepat).
     2. **Header Judul**: Menampilkan Judul Postingan & *Badge License* (`Free Copyright` / `Copyright`).
     3. **Lokasi & Waktu**: Ikon Pin (📍) Lokasi (bisa diklik ke Maps), Ikon Kamera (📸) Tanggal Dipotret (dari EXIF `date_taken`), dan Ikon Kalender (📅) Tanggal Posting.
     4. **Story / Caption**: Paragraf teks cerita/momen.
     5. **Footer / Kategori**: Menampilkan nama Kategori Koleksi dan Tagar (#tags) dari tabel berelasi.
     6. **Tombol Download**: Jika `license_type = 'Free Copyright'`, tombol besar untuk unduh resolusi orisinal (21MB+) diletakkan di bagian paling bawah.

## 5. Flowchart Admin & API Logics

### Alur Upload Multipel (Detail)
1. Admin memilih misal 3 foto (A, B, C) di browser.
2. Library `exifr` berjalan secara asinkron di browser untuk mengekstrak EXIF (termasuk `focal_length`) dari A, B, dan C.
3. Web mengirim Request ke `/api/cloudinary/sign`. **SUPER RESTRICTED:** Endpoint ini WAJIB memeriksa sesi *Server-Side* Supabase. Jika bukan Admin, tolak dengan error 401 (Unauthorized).
4. Web mengunggah foto A, B, dan C langsung ke Cloudinary (memakai Signature).
5. Cloudinary merespons dengan URL dan `public_id`.
6. Web menembak API Next.js untuk menyimpan ke Supabase:
   - *Validasi Backend*: Pastikan dari 3 foto, HANYA ADA 1 foto yang di-set `is_cover = true`.
   - `INSERT INTO posts` -> `INSERT INTO photos` -> `INSERT INTO exif_data` -> `INSERT INTO post_tags`.

### Alur Delete Permanen (Dengan Error Handling)
1. Admin menekan tombol Hapus pada suatu Postingan.
2. Web memanggil `/api/post/delete` dengan parameter `post_id`.
3. Server Next.js mencari semua `public_id` foto milik post tersebut.
4. **Proteksi Orphaned Files**: Server memanggil API Cloudinary untuk menghapus file fisik. 
   - *Kondisi A*: Jika sukses, lanjut ke langkah 5.
   - *Kondisi B*: Jika Cloudinary *Time Out* / Gagal Hapus, BATALKAN proses. Kembalikan kode Error 500 ke *frontend* dan **JANGAN** lakukan query hapus di Supabase (Rollback).
5. Jika sukses, hapus row di tabel `posts`. Karena aturan `ON DELETE CASCADE`, data di `photos`, `exif_data`, dan `post_tags` otomatis musnah.
