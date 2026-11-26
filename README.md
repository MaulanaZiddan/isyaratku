<div align="center">
  <h1>🤟 Isyaratku — Platform Pembelajaran Bahasa Isyarat Indonesia (BISINDO)</h1>
  <p>
    Aplikasi web interaktif untuk mempelajari kosakata dasar Bahasa Isyarat Indonesia (BISINDO) melalui kamus video, kuis bertahap yang tergamifikasi, portal progres siswa, dan panel manajemen konten admin.
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
</div>

---

## 📖 Tentang Proyek

**Isyaratku** dirancang untuk menjembatani komunikasi antara masyarakat umum dan komunitas Tuli melalui media pembelajaran digital yang mudah diakses dari perangkat desktop maupun seluler. Proyek ini dikembangkan sebagai bagian dari Tugas Akhir Program Studi Informatika, **Universitas Muhammadiyah Malang (UMM)**, berkolaborasi dengan komunitas **Akar Tuli Malang**.

---

## ✨ Fitur Utama

### 🌐 Area Publik (Guest)
* **Kamus Digital BISINDO (`/kamus`):** Pencarian dan penjelajahan kosakata berdasarkan kategori yang dilengkapi video peragaan gerakan tangan beresolusi jernih.
* **Kuis Interaktif (`/kuis`):** Uji pemahaman dasar kosakata BISINDO secara langsung tanpa perlu mendaftar akun terlebih dahulu.

### 🎓 Portal Siswa (`/app/*`)
* **Autentikasi Terintegrasi:** Registrasi dan login aman menggunakan Supabase Auth berbasis sesi JWT.
* **Kuis Bertahap (Gamifikasi):** Pengerjaan kuis per level yang terbuka secara bertahap berdasarkan skor kelulusan pengguna.
* **Pelacakan Progres Belajar:** Riwayat pengerjaan kuis (`quiz_attempts`), pencapaian kosakata yang telah dipelajari (`user_progress`), serta pengelolaan profil dan avatar pengguna.

### 🛠️ Panel Admin (`/admin`)
* **Manajemen Kategori & Kosakata:** Operasi CRUD penuh untuk menambah, mengubah, dan menghapus kategori serta entri kosakata beserta unggahan video peragaan.
* **Manajemen Level & Soal Kuis:** Pengaturan tingkat kesulitan kuis, bobot nilai, dan unggahan video soal kuis berbasis pilihan ganda.
* **Monitoring Pengguna:** Pemantauan statistik belajar dan rekapitulasi progres seluruh siswa.

---

## 🏗️ Arsitektur Sistem

Aplikasi ini menggunakan arsitektur **Single Page Application (SPA)** di sisi *frontend* yang terhubung langsung ke layanan **Backend-as-a-Service (BaaS) Supabase**:

```text
┌──────────────────────────────────────────────────────────────────────┐
│                    Frontend React (Vite + Tailwind)                  │
│  Public Pages (/kamus, /kuis) • User Portal (/app/*) • Admin (/admin)│
└───────────────────────────────┬──────────────────────────────────────┘
                                │ @supabase/supabase-js
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         SUPABASE PLATFORM                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │  Supabase Auth   │  │ PostgreSQL + RLS │  │  Supabase Storage  │  │
│  │  (JWT Session)   │  │  - profiles      │  │  - vocabulary-     │  │
│  │  - User / Siswa  │  │  - categories    │  │    videos/         │  │
│  │  - Admin         │  │  - vocabularies  │  │  - quiz-videos/    │  │
│  └──────────────────┘  │  - quiz_levels   │  │  - category-icons/ │  │
│                        │  - quiz_questions│  │  - avatars/        │  │
│                        │  - user_progress │  └────────────────────┘  │
│                        │  - quiz_attempts │                          │
│                        └──────────────────┘                          │
└──────────────────────────────────────────────────────────────────────┘
