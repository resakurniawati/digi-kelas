# 💡 Informasi Tambahan (Extra Info) - Digi-Kelas

Dokumen ini berisi informasi tambahan terkait perancangan, pengembangan, dan strategi implementasi dari proyek **Digi-Kelas**.

---

## 1. Story-board (Mind-Mapping)

Alur logika (mind-map) dari aplikasi Digi-Kelas dirancang berpusat pada pengalaman siswa:

*   **Autentikasi:**
    *   Halaman Landing (Login/Register) -> Masukkan Nama & PIN (Sederhana untuk anak).
*   **Dashboard (Hub Utama):**
    *   **Profil:** Nama siswa, avatar/maskot, total skor, progress keseluruhan.
    *   **Navigasi Misi:** 6 Misi utama (Karakteristik, Jaring-jaring, Luas Permukaan, Volume, Merancang Kemasan 1, Merancang Kemasan 2).
    *   **Menu Tambahan:** Leaderboard (Peringkat), Sertifikat.
*   **Alur Dalam Misi (Learning Path):**
    1.  **Pre-Test:** Mengukur pengetahuan awal.
    2.  **Materi:** E-Modul (PDF Flipbook) & Video YouTube.
    3.  **Praktik:** LKPD (Lembar Kerja) & Mini-Games interaktif.
    4.  **Evaluasi:** Quiz (Timer) -> Post-Test.
*   **Gamifikasi & Reward:**
    *   Menyelesaikan aktivitas -> Mendapat Skor/Poin.
    *   Skor masuk ke *Leaderboard* global.
    *   Misi selesai -> Klaim Sertifikat Kelulusan.

---

## 2. Langkah-langkah Pembuatan

Proses pengembangan aplikasi Digi-Kelas melalui beberapa tahapan berikut:

1.  **Tahap Perencanaan & Riset:**
    *   Menganalisis kebutuhan siswa SD kelas atas terkait materi Matematika (Bangun Ruang).
    *   Merancang UI/UX yang *child-friendly* (skema warna pastel, font Quicksand, elemen *rounded*).
    *   Menentukan fitur *gamification* untuk meningkatkan motivasi.
2.  **Desain & Pembuatan Aset:**
    *   Membuat *mockup* antarmuka halaman dashboard, kuis, dan e-modul.
    *   Menyiapkan aset visual seperti maskot, ikon, dan materi e-modul berformat PDF.
3.  **Pengembangan Frontend (Next.js & Tailwind CSS):**
    *   Membangun struktur *routing* (App Router) dengan *protected routes*.
    *   Styling menggunakan Tailwind CSS v4.
    *   Menambahkan animasi interaktif dengan Framer Motion (transisi halaman, *hover effects*).
    *   Mengintegrasikan `react-pdf` untuk membaca e-modul dan *embedded* video player.
    *   Membuat logika dan komponen UI untuk *Mini-Games*.
4.  **Pengembangan Backend & Database (Supabase):**
    *   Membuat skema database PostgreSQL di Supabase (tabel `users`, `progress`, `scores`).
    *   Mengembangkan sistem login/registrasi berbasis sesi menggunakan Nama dan PIN.
    *   Mengintegrasikan Server Actions dari Next.js untuk menyimpan progres dan skor siswa.
5.  **Pengujian (Testing) & Debugging:**
    *   Menguji responsivitas di berbagai perangkat (Mobile, Tablet, Desktop).
    *   Memastikan timer kuis berjalan dengan benar dan sistem perlindungan navigasi (anti-cheat) berfungsi.
6.  **Deployment:**
    *   Meluncurkan aplikasi ke platform hosting Vercel agar dapat diakses publik secara *online*.

---

## 3. Kelebihan dan Kekurangan

### Kelebihan
*   **Pendekatan Gamifikasi (Gamified Learning):** Penggunaan mini-games, skor, *leaderboard*, dan sertifikat membuat belajar matematika menjadi tidak membosankan dan meningkatkan kompetisi sehat.
*   **UI/UX Sangat Ramah Anak:** Desain visual yang menarik, animasi *smooth*, dan navigasi yang mudah dimengerti oleh siswa SD.
*   **Sistem Terstruktur:** Alur belajar terkunci berurutan (Pre-test -> Materi -> Post-test) memastikan siswa tidak melompati materi penting.
*   **Fleksibel & Aksesibel:** Berbasis web (*Progressive Web App-ready*), sehingga siswa dapat belajar kapan saja dari HP, tablet, maupun PC.
*   **Penyimpanan Progres Real-time:** Data siswa aman tersimpan di *cloud* database (Supabase).

### Kekurangan
*   **Ketergantungan Internet:** Memerlukan koneksi internet yang stabil, terutama untuk memuat aset PDF (E-Modul) dan memutar video dari YouTube.
*   **Materi Masih Terbatas:** Saat ini fokus masih hanya pada 1 bab materi (Kubus & Balok), belum mencakup seluruh kurikulum Matematika SD.
*   **Belum Ada Panel Pengajar (Dashboard Guru):** Guru belum memiliki akses khusus untuk memantau nilai kuis individu, analisis kelemahan siswa, atau mengatur materi secara dinamis.
*   **Keamanan Akun Sederhana:** Menggunakan PIN dan Nama rentan terhadap lupa kredensial atau duplikasi nama.

---

## 4. Solusi jika ada kekurangan

*   **Solusi Ketergantungan Internet (Offline Mode):**
    *   Mengimplementasikan teknologi **PWA (Progressive Web App)** dengan *Service Workers* secara penuh untuk melakukan *caching* aset statis, font, dan teks modul. Sehingga saat *offline*, fitur tertentu masih bisa dibuka.
*   **Solusi Materi Terbatas:**
    *   Membangun fitur *Content Management System (CMS)* sederhana agar admin atau guru dapat menambahkan materi baru, modul, dan kuis tanpa harus *coding* ulang.
*   **Solusi Panel Pengajar:**
    *   Pengembangan "Fase 2", yaitu membangun sistem otorisasi Role-based (Siswa vs Guru). Guru diberikan halaman khusus (Admin Dashboard) untuk men-generate kode kelas (Class Code), mengundang siswa, dan mengekspor rekap nilai (ke Excel/CSV).
*   **Solusi Keamanan Akun:**
    *   Menambahkan opsi penautan ke akun email sekolah (Google Workspace for Education) menggunakan autentikasi OAuth untuk login yang lebih aman, sekaligus tetap mempertahankan login PIN sebagai alternatif.

---

## 5. Penggunaan (Implementasi)

Bagaimana Digi-Kelas dapat diimplementasikan dalam skenario dunia nyata:

*   **Penerapan di Sekolah (In-Class Learning):**
    *   Guru matematika menggunakan aplikasi ini di lab komputer sekolah atau menggunakan tablet sekolah.
    *   Guru menginstruksikan: *"Anak-anak, hari ini buka Digi-Kelas, kerjakan Misi 1 (Karakteristik Bangun Ruang). Setelah selesai, nilai tertinggi di Leaderboard akan dapat bintang!"*
*   **Pekerjaan Rumah (Blended Learning):**
    *   Sebagai ganti PR buku tulis, guru menugaskan siswa mengakses Digi-Kelas di rumah untuk mengerjakan kuis dan mini-games terkait materi yang diajarkan paginya.
*   **Belajar Mandiri & Homeschooling:**
    *   Orang tua yang ingin memberikan jam belajar tambahan anak dengan metode interaktif, alih-alih memberikan *gadget* untuk *game* biasa, dapat memberikan Digi-Kelas.

---

## 6. Pemasaran

Strategi pemasaran untuk mengenalkan dan mendistribusikan Digi-Kelas:

*   **Target Audiens:**
    1.  Sekolah Dasar (SD) Swasta & Negeri.
    2.  Guru Matematika SD.
    3.  Orang Tua murid (B2C).
    4.  Lembaga Bimbingan Belajar (Bimbel).
*   **Strategi Akuisisi Pengguna:**
    *   **Pilot Project (B2B):** Menawarkan kolaborasi uji coba (gratis selama 1 semester) ke beberapa sekolah terpilih. Guru akan menggunakan ini dan memberikan *feedback*. Sekolah yang puas dapat dikonversi menjadi klien berbayar.
    *   **Pemasaran Konten (Social Media):** Membuat video pendek (*Reels/TikTok*) yang menunjukkan anak asyik bermain sambil belajar Matematika di Digi-Kelas. Target iklan disetujui untuk demografi "Orang Tua dengan anak usia 7-12 tahun".
    *   **Webinar & Workshop Pendidik:** Menyelenggarakan seminar *online* gratis bersertifikat untuk guru SD dengan tema "Inovasi Pembelajaran Digital", yang didalamnya disponsori dan menggunakan alat peraga Digi-Kelas.
*   **Model Bisnis (Monetisasi):**
    *   **B2B (Sekolah):** Model *Software as a Service* (SaaS) berlangganan per tahun/semester per sekolah. Sekolah mendapatkan fitur eksklusif: Dashboard analitik guru, white-label (logo sekolah), dan materi kustom.
    *   **B2C (Freemium):** Aplikasi gratis untuk Misi 1 dan 2. Untuk membuka seluruh misi dan ujian *Post-Test*, pengguna (orang tua) membayar biaya akses *one-time* (sekali bayar) atau berlangganan per bulan.
