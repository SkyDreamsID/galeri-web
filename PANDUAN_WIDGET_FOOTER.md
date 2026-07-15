# Panduan Kustomisasi Widget Radio & Footer

File ini berisi panduan untuk mengatur posisi dan ukuran Widget Radio serta mengkustomisasi Footer agar pas di perangkat HP maupun Laptop.

---

## 📻 1. Kustomisasi Widget Radio Zeno.fm
File yang harus diedit: **`src/components/public/GalleryRadio.tsx`**

Gue udah bikin logika responsif di dalam `GalleryRadio.tsx` yang membedakan ukuran HP (`isMobile`) dan Laptop. Berikut cara mengaturnya:

### a) Mengatur Jarak (Posisi) Widget
Cari baris kode berikut di `GalleryRadio.tsx` (sekitar baris 97):
```tsx
<div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 ...">
```
- **`bottom-24` & `right-4`**: Jarak widget dari bawah dan kanan saat diakses via **HP**. (Kalau kurang naik, ganti `bottom-24` jadi `bottom-28` atau `bottom-32`).
- **`md:bottom-8` & `md:right-8`**: Jarak widget dari bawah dan kanan saat diakses via **Laptop/Desktop**.

### b) Mengatur Ukuran Animasi (Lebar & Tinggi)
Cari baris kode *Animasi Widget Melar* (sekitar baris 105):
```tsx
animate={{
  // Format: Kondisi ? (Ukuran HP) : (Ukuran Laptop)
  width: isPlaying ? (isMobile ? 280 : 340) : (isMobile ? 56 : 64), 
  height: isPlaying ? (isMobile ? 70 : 80) : (isMobile ? 56 : 64), 
  borderRadius: isPlaying ? 24 : 32,
}}
```
**Penjelasan:**
- **Lebar saat muter (Membesar):** Di HP panjangnya `280px`, di Laptop `340px`. Kalau di HP masih terasa aneh/kepanjangan, kurangi angka `280` jadi `240` atau `260`.
- **Lebar saat mati (Bulat):** Di HP lebarnya `56px`, di Laptop `64px`.
- **Tinggi saat muter:** Di HP tingginya `70px`, di Laptop `80px`.
- **Tinggi saat mati:** Di HP tingginya `56px`, di Laptop `64px`.

Cukup ganti angka-angkanya aja sesuai selera lu.

---

## 🦶 2. Kustomisasi Global Footer
Tadi Footer cuma ada di halaman postingan tunggal, sekarang udah gue buatin komponen global biar muncul di semua halaman (termasuk Beranda).

File yang harus diedit: **`src/components/public/Footer.tsx`**

### a) Mengganti Link Sosial Media
Cari baris ini di dalam `Footer.tsx`:
```tsx
<div className="flex items-center gap-6 text-sm text-text-muted">
  <a href="https://instagram.com/rifkiekap07" ...>Instagram</a>
  <a href="https://github.com/SkyDreamsID" ...>GitHub</a>
  <a href="mailto:arunikaframes2025@gmail.com" ...>Email</a>
</div>
```
Ganti link di dalam `href="..."` sesuai dengan sosial media lu. Lu juga bebas nambahin link lain (misal LinkedIn atau Twitter) dengan cara *copy-paste* salah satu baris `<a>` tersebut.

### b) Mengubah Teks & Copyright
Di bagian paling bawah komponen `Footer.tsx`, lu bisa ngubah teks Hak Cipta dan *Tech Stack*:
```tsx
<p>
  &copy; {new Date().getFullYear()} Rifki Eka Putra | All Rights Reserved
</p>
```
Kalau lu mau ngerubah nama "Rifki Eka Putra", cukup ganti teks di situ aja.

### (Opsional) Jika Ingin Menghilangkan Footer di Halaman Tertentu
Karena Footer udah dipasang di **`src/app/layout.tsx`**, dia bakal muncul di seluruh aplikasi. Kalau misal ke depannya lu nggak mau ada Footer di halaman Admin, lu bisa lepas `<Footer />` dari `layout.tsx` dan masukin manual ke `page.tsx` publik aja. Tapi buat sekarang, posisinya udah pas kok di layout utama.

---

Selamat berkreasi mengutak-atik! 🚀
