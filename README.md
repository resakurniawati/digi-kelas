# 📐 Digi-Kelas

**Digi-Kelas** adalah media pembelajaran digital interaktif berbasis web yang dirancang khusus untuk siswa **Sekolah Dasar (SD)** pada mata pelajaran **Matematika**. Saat ini, konten pembelajaran berfokus pada topik **Bangun Datar** (Geometri 2D), dengan 3 topik lainnya (Pecahan, Pengukuran, dan Data Sederhana) dalam perencanaan.

Aplikasi ini menyediakan pengalaman belajar terstruktur yang mencakup materi e-modul, video pembelajaran, lembar kerja (LKPD), kuis, serta asesmen pre-test dan post-test — semuanya dengan antarmuka yang ramah anak, dilengkapi maskot interaktif, animasi bintang berkelap-kelip, dan awan melayang.

> 🌐 Dibangun dengan **Next.js 16**, **React 19**, **TypeScript**, dan **Tailwind CSS v4** — seluruh antarmuka menggunakan **Bahasa Indonesia**.

---

## ✨ Fitur Utama

### 🏠 Dashboard Utama

Halaman utama menampilkan sapaan personal dengan nama siswa, statistik pembelajaran, dan **4 kartu materi**:

| Materi | Status |
|---|---|
| **Bangun Datar** (Persegi, Persegi Panjang, Segitiga, Trapesium, dll.) | ✅ Aktif |
| **Pecahan** | 🔒 Belum tersedia |
| **Pengukuran** | 🔒 Belum tersedia |
| **Data Sederhana** | 🔒 Belum tersedia |

Setiap kartu materi memiliki tombol aksi untuk modul-modul berikut:

### 📚 Modul Pembelajaran

| Modul | Deskripsi |
|---|---|
| **Pre-Test** | 5 soal pilihan ganda sebagai asesmen awal — semua soal ditampilkan sekaligus dengan feedback jawaban benar/salah |
| **E-Modul (Materi)** | Materi pembelajaran dalam format **PDF flipbook** interaktif dengan animasi 3D page-turn |
| **Video** | 3 video pembelajaran YouTube (pengenalan, keliling, luas bangun datar) dengan playlist sidebar |
| **LKPD** | 3 Lembar Kerja Peserta Didik dalam format PDF dengan sidebar navigasi dan fitur download |
| **Quiz** | 10 soal pilihan ganda dengan **timer 5 menit**, navigasi per soal, animasi slide, dan tombol ulangi |
| **Post-Test** | 10 soal pilihan ganda dengan **timer 5 menit** sebagai asesmen akhir — auto-submit saat waktu habis |

### 🎯 Fitur Tambahan

- 🔐 **Autentikasi sederhana** — siswa memasukkan nama untuk memulai (disimpan di `localStorage`)
- 🧸 **Desain ramah anak** — maskot SVG animasi, kartu rounded, warna pastel biru & hijau
- ✨ **Animasi dekoratif** — bintang berkelap-kelip (twinkle) dan awan melayang sebagai latar belakang
- ⏱️ **Timer kuis** — countdown 5 menit dengan indikator warna (hijau → kuning → merah)
- 🔒 **Proteksi navigasi** — blocking tombol back browser dan peringatan `beforeunload` saat kuis berlangsung
- 📊 **Review jawaban** — setelah submit, siswa dapat melihat review lengkap semua soal dengan highlight benar/salah
- 📱 **Responsif** — tampilan optimal di desktop (2-page spread) maupun mobile (single page)
- 📄 **PDF Flipbook** — viewer dengan animasi flip 3D, navigasi keyboard (arrow keys), dan dot pagination
- 🧭 **Halaman 404 kustom** — maskot terkejut dengan pesan ramah anak dan tombol kembali
- 👤 **Halaman Tentang** — profil pengembang, tujuan pembelajaran, alur belajar, dan badge tech stack

---

## 🛠️ Tech Stack

| Teknologi | Versi | Fungsi |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2.7 | Framework React (App Router) |
| [React](https://react.dev) | 19.2.4 | Library UI |
| [TypeScript](https://www.typescriptlang.org) | ^5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | v4 | Styling (via `@tailwindcss/postcss`) |
| [react-pdf](https://github.com/wojtekmaj/react-pdf) | ^10.4.1 | Rendering PDF untuk flipbook & LKPD |
| [clsx](https://github.com/lukeed/clsx) | ^2.1.1 | Conditional class names |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | ^3.6.0 | Merge class Tailwind tanpa konflik |
| [React Compiler](https://react.dev/learn/react-compiler) | 1.0.0 | Optimasi performa otomatis (babel plugin) |
| [Quicksand](https://fonts.google.com/specimen/Quicksand) | — | Font utama (Google Fonts) |

### 🎨 Tema Warna

| Token | Warna | Hex |
|---|---|---|
| Primary | Biru | `#0984E3` |
| Accent | Hijau | `#00B894` |
| Background | Biru Pastel | `#EAF6FF` |
| Border | Biru Muda | `#B8DFFF` |
| Error | Merah | `#EF4444` |

---

## 📁 Struktur Proyek

```
digi-kelas/
├── public/
│   ├── logo.svg                    # Logo aplikasi (topi wisuda + buku)
│   ├── resa.jpeg                   # Foto profil pengembang
│   └── pdfs/
│       └── lkpd-bangun-datar.pdf   # File PDF lembar kerja
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Quicksand font, BgDecoration)
│   │   ├── globals.css             # Tema warna, animasi kustom, base styles
│   │   ├── icon.svg                # Favicon
│   │   ├── not-found.tsx           # Halaman 404 kustom (maskot terkejut)
│   │   ├── get-started/            # Halaman login (input nama siswa)
│   │   │   └── page.tsx
│   │   ├── about/                  # Halaman tentang (profil & tujuan pembelajaran)
│   │   │   ├── layout.tsx          # Metadata halaman
│   │   │   └── page.tsx
│   │   └── (authenticated)/        # Route group terproteksi
│   │       ├── layout.tsx          # AuthProvider wrapper (redirect jika belum login)
│   │       ├── page.tsx            # Dashboard utama (4 kartu materi)
│   │       ├── pre-test/           # Halaman pre-test (5 soal)
│   │       │   └── page.tsx
│   │       ├── materi/             # Halaman e-modul (PDF flipbook)
│   │       │   └── page.tsx
│   │       ├── video/              # Halaman video (YouTube + playlist)
│   │       │   └── page.tsx
│   │       ├── lkpd/               # Halaman LKPD (PDF viewer + sidebar)
│   │       │   └── page.tsx
│   │       ├── quiz/               # Halaman kuis (10 soal, timer 5 menit)
│   │       │   └── page.tsx
│   │       └── post-test/          # Halaman post-test (10 soal, timer 5 menit)
│   │           └── page.tsx
│   ├── components/
│   │   ├── auth-provider.tsx       # Context autentikasi (useSyncExternalStore + localStorage)
│   │   ├── bg-decoration.tsx       # Animasi bintang berkelap-kelip & awan melayang
│   │   ├── pdf-flipbook.tsx        # PDF viewer dengan animasi flip 3D & responsive sizing
│   │   └── icons/
│   │       └── logo-icon.tsx       # Ikon logo SVG (buku terbuka + bintang)
├── types/                          # Direktori tipe TypeScript (kosong)
├── next.config.ts                  # Konfigurasi Next.js (Turbopack, React Compiler, canvas stub)
├── empty-module.js                 # Stub modul canvas untuk kompatibilitas react-pdf
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── postcss.config.mjs
```

---

## 🚀 Memulai (Getting Started)

### Prasyarat

Pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org) versi **18.18** atau lebih baru
- [npm](https://www.npmjs.com), [yarn](https://yarnpkg.com), [pnpm](https://pnpm.io), atau [bun](https://bun.sh)

### Instalasi

1. **Clone repository**

   ```bash
   git clone https://github.com/memoowi/digi-kelas.git
   cd digi-kelas
   ```

2. **Instal dependensi**

   ```bash
   npm install
   # atau
   yarn install
   # atau
   pnpm install
   ```

3. **Jalankan server pengembangan**

   ```bash
   npm run dev
   ```

4. **Buka di browser**

   Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

### Script yang Tersedia

| Script | Perintah | Fungsi |
|---|---|---|
| Development | `npm run dev` | Jalankan server development (Turbopack) |
| Build | `npm run build` | Build untuk produksi |
| Start | `npm run start` | Jalankan server produksi |
| Lint | `npm run lint` | Jalankan ESLint |

---

## 📖 Cara Penggunaan

### Alur Belajar Siswa

```
Login (Input Nama) → Pre-Test → E-Modul & Video → LKPD → Quiz → Post-Test
```

1. **Masuk ke aplikasi** — Buka halaman dan masukkan nama di halaman **Get Started**
2. **Dashboard** — Setelah masuk, lihat kartu materi yang tersedia di dashboard
3. **Ikuti alur belajar yang direkomendasikan:**
   - 📝 Kerjakan **Pre-Test** untuk mengukur pemahaman awal (5 soal)
   - 📖 Pelajari **E-Modul** tentang bangun datar (PDF flipbook)
   - 🎬 Tonton **Video** pembelajaran (3 video)
   - 📋 Kerjakan **LKPD** — Lembar Kerja (3 LKPD, dapat didownload)
   - 🎮 Latihan dengan **Quiz** (10 soal, 5 menit)
   - ✅ Kerjakan **Post-Test** untuk mengukur pemahaman akhir (10 soal, 5 menit)
4. **Review** — Setelah submit kuis/tes, lihat review jawaban lengkap dengan skor
5. **Logout** — Klik tombol **Keluar** di dashboard untuk keluar

---

## 📝 Catatan Teknis

- **Autentikasi** bersifat client-side menggunakan `localStorage` (key: `username`). Sistem menggunakan `useSyncExternalStore` untuk sinkronisasi reaktif lintas tab melalui event `storage` dan custom event `digikelas:user`. Tidak ada backend authentication.

- **react-pdf** memerlukan stub untuk modul `canvas` di lingkungan browser. Hal ini ditangani oleh file `empty-module.js` dan konfigurasi alias di `next.config.ts` (untuk Turbopack dan Webpack).

- **React Compiler** diaktifkan melalui `babel-plugin-react-compiler` untuk optimasi performa otomatis.

- Proyek ini menggunakan **Next.js App Router** dengan route group `(authenticated)` untuk memproteksi halaman yang memerlukan login.

- **Data masih bersifat hardcoded/dummy** — daftar materi, status tugas, soal kuis, dan ID video YouTube masih statis. Integrasi **Supabase** sudah direncanakan namun belum diimplementasikan.

- **Animasi kustom** didefinisikan di `globals.css`:
  - `float` & `float-delayed` — efek mengambang untuk maskot dan dekorasi
  - `twinkle` — efek berkelap-kelip untuk bintang
  - `flip-forward` & `flip-backward` — animasi 3D page-turn untuk PDF flipbook
  - `slide-in-left` & `slide-in-right` — transisi slide untuk navigasi soal kuis

---

## 🗺️ Roadmap

- [ ] Integrasi **Supabase** untuk autentikasi dan penyimpanan data
- [ ] Persistensi skor dan progress belajar ke database
- [ ] Menambahkan konten untuk topik **Pecahan**, **Pengukuran**, dan **Data Sederhana**
- [ ] Implementasi fitur **Mini-Game**
- [ ] Menambahkan video dan PDF LKPD yang sesuai per topik
- [ ] Tracking progress belajar per siswa secara real-time

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan pendidikan dan penelitian.

---

<p align="center">
  Dibuat dengan ❤️ oleh <strong>Resa Kurniawati</strong>
</p>
