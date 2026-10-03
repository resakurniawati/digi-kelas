# 📐 Digi-Kelas

**Digi-Kelas** adalah media pembelajaran digital interaktif berbasis web yang dirancang khusus untuk siswa **Sekolah Dasar (SD)** pada mata pelajaran **Matematika**. Saat ini, konten pembelajaran berfokus pada topik **Bangun Ruang (Kubus dan Balok)**, mencakup karakteristik, jaring-jaring, luas permukaan, volume, hingga penerapannya dalam kehidupan sehari-hari (seperti merancang kemasan).

Aplikasi ini menyediakan pengalaman belajar terstruktur yang mencakup materi e-modul, video pembelajaran, lembar kerja (LKPD), **mini-games interaktif**, kuis, serta asesmen pre-test dan post-test. Semua dirancang dengan antarmuka yang ramah anak, dilengkapi maskot interaktif, animasi menarik, dan penghargaan berupa **Sertifikat Kelulusan**.

> 🌐 Dibangun dengan **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, dan terintegrasi penuh dengan **Supabase** sebagai database backend — seluruh antarmuka menggunakan **Bahasa Indonesia**.

---

## ✨ Fitur Utama

### 🏠 Dashboard Utama & Progress Tracking
Halaman utama menampilkan sapaan personal, statistik pembelajaran real-time, progress bar penyelesaian materi, dan daftar misi belajar.
* Terdapat **6 misi materi** (Karakteristik, Jaring-jaring, Luas Permukaan, Volume, Merancang Kemasan 1 & 2).
* Progress belajar dan skor disimpan secara persisten di database menggunakan **Supabase**.

### 📚 Modul Pembelajaran (Alur Belajar)

| Modul | Deskripsi |
|---|---|
| **Pre-Test** | Asesmen awal pilihan ganda untuk mengukur pemahaman sebelum mulai belajar. |
| **E-Modul (Materi)** | Materi pembelajaran format PDF flipbook interaktif dengan animasi 3D page-turn. |
| **Video** | Integrasi video pembelajaran YouTube dengan antarmuka fokus belajar. |
| **LKPD** | Lembar Kerja Peserta Didik (PDF) dengan navigasi materi. |
| **Mini-Game** | **BARU!** 6 permainan edukasi interaktif (contoh: *Aquarium Filler*, *Cargo Packer*, dll) untuk memperkuat pemahaman konsep bangun ruang secara menyenangkan. |
| **Quiz** | Latihan soal pilihan ganda berbatas waktu (timer 5 menit), animasi slide, dan review. |
| **Post-Test** | Asesmen akhir berbatas waktu (timer 5 menit) — otomatis disubmit saat waktu habis. |
| **Sertifikat** | Penghargaan sertifikat kelulusan setelah menyelesaikan misi belajar. |

### 🎯 Fitur Tambahan

- 🔐 **Autentikasi berbasis Sesi & PIN** — Siswa mendaftar dengan nama dan PIN, sesi divalidasi dengan Supabase.
- 🏆 **Leaderboard (Peringkat)** — Klasemen siswa berdasarkan skor yang memotivasi semangat belajar kompetitif.
- 🧸 **Desain Ramah Anak** — Maskot SVG animasi, komponen UI *rounded*, dan skema warna pastel yang menarik.
- ✨ **Framer Motion & Animasi CSS** — Transisi yang mulus, *floating effects*, dan animasi dekoratif.
- ⏱️ **Manajemen Waktu & Anti-Cheat** — Timer kuis interaktif dan proteksi tombol *back* browser saat ujian.
- 📊 **Review Jawaban Komprehensif** — Highlight jawaban benar/salah setelah submit tes.
- 📱 **Responsif** — Optimal untuk diakses melalui PC, tablet, maupun perangkat mobile.

---

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|---|---|
| [Next.js](https://nextjs.org) (v16.2.7) | Framework React (App Router & Server Actions) |
| [React](https://react.dev) (v19.2.4) | Library UI Core |
| [TypeScript](https://www.typescriptlang.org) | Keamanan Type (Type Safety) |
| [Tailwind CSS](https://tailwindcss.com) (v4) | Utility-first Styling (via `@tailwindcss/postcss`) |
| [Supabase](https://supabase.com) | Database PostgreSQL, Autentikasi, & Manajemen Sesi |
| [Framer Motion](https://motion.dev) | Animasi interaktif & transisi layout |
| [react-pdf](https://github.com/wojtekmaj/react-pdf) | Rendering dan penampilan e-Modul PDF |
| [React Compiler](https://react.dev/learn/react-compiler)| Optimasi performa dan rendering otomatis (Babel plugin) |
| Font Quicksand | Tipografi utama ramah anak dari Google Fonts |

---

## 📁 Struktur Proyek (Sekilas)

```
digi-kelas/
├── public/                 # Aset statis, gambar, maskot, icon, data dummy
├── src/
│   ├── app/
│   │   ├── (authenticated)/# Route terproteksi (Dashboard, pre-test, quiz, minigame, dll)
│   │   ├── about/          # Halaman tentang proyek
│   │   ├── actions/        # Server Actions (Progress, leaderboard, score, feedback)
│   │   ├── certificate/    # Halaman sertifikat pencapaian
│   │   ├── change-pin/     # Halaman manajemen PIN
│   │   ├── get-started/    # Halaman Autentikasi/Login
│   │   ├── leaderboard/    # Papan peringkat (Klasemen)
│   │   └── globals.css     # Animasi & utility classes
│   ├── components/         
│   │   ├── games/          # Komponen logic & UI Mini-Games interaktif
│   │   └── auth-provider   # Manajemen global state autentikasi pengguna
│   ├── data/               # Model data statis / initial seed data
│   ├── lib/
│   │   └── supabase/       # Konfigurasi Supabase Client & Server utilitas
│   └── types/              # Definisi TypeScript interface
├── next.config.ts          # Konfigurasi Next.js (termasuk Turbopack)
└── package.json            # Daftar dependensi & npm scripts
```

---

## 🚀 Memulai (Getting Started)

### Prasyarat

- [Node.js](https://nodejs.org) v18.18 atau lebih baru
- Akun dan Project [Supabase](https://supabase.com)

### Instalasi

1. **Clone repository**

   ```bash
   git clone https://github.com/memoowi/digi-kelas.git
   cd digi-kelas
   ```

2. **Instal dependensi**

   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   
   Buat file `.env` (atau `.env.local`) di root proyek dan tambahkan kunci Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Jalankan server pengembangan**

   ```bash
   npm run dev
   ```

5. **Akses Aplikasi**
   
   Buka [http://localhost:3000](http://localhost:3000) di browser pilihan Anda.

---

## 📖 Cara Penggunaan & Alur Belajar Siswa

```
Mendaftar/Login → Dashboard Utama → Pilih Misi Belajar
Alur Per Misi: Pre-Test → E-Modul & Video → LKPD → Mini-Game → Quiz → Post-Test → Sertifikat Kelulusan
```

1. **Mendaftar/Masuk:** Akses halaman depan dan buat sesi dengan Nama dan PIN yang mudah diingat.
2. **Dashboard:** Pantau progres belajar, statistik penyelesaian, dan navigasi misi di Dashboard Utama.
3. **Mulai Misi:** Ikuti alur materi secara berurutan. Evaluasi awal (Pre-test) harus dikerjakan sebelum materi E-Modul/Video terbuka. Mini-game dan kuis akan terbuka setelah tahapan belajar selesai.
4. **Mini-Games:** Selesaikan tantangan interaktif untuk menguatkan memori konsep ruang.
5. **Leaderboard:** Bandingkan pencapaian Anda dengan teman-teman di Papan Peringkat.
6. **Sertifikat:** Klaim penghargaan setiap menyelesaikan babak besar.

---

## 🗺️ Roadmap (Status)

- [x] Desain Antarmuka & Responsivitas Layout
- [x] Integrasi viewer PDF (Flipbook) dan Video
- [x] Pengembangan UI sistem kuis berbatas waktu
- [x] Integrasi **Supabase** untuk autentikasi, penyimpan sesi, dan skor
- [x] Implementasi berbagai **Mini-Game** konsep bangun ruang
- [x] Papan Peringkat (Leaderboard) & Sertifikat Kelulusan
- [ ] Tracking data dashboard pengajar (Dashboard Admin/Guru)
- [ ] Menambahkan dukungan untuk topik/materi matematika lainnya di masa mendatang

---

## 📄 Lisensi

Proyek ini dikembangkan secara spesifik untuk tujuan pendidikan, penelitian, dan fasilitas media pembelajaran yang lebih baik.

---

<p align="center">
  Dibuat dengan ❤️ oleh <strong>Resa Kurniawati</strong>
</p>
