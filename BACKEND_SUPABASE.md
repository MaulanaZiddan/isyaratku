# Dokumentasi Arsitektur & Implementasi Backend Supabase — **Isyaratku**

Dokumen ini merupakan rancangan backend lengkap berbasis **Supabase** (PostgreSQL, Auth, Storage, dan Row Level Security) yang disesuaikan 100% dengan struktur frontend React pada project **Isyaratku** (Kamus Digital BISINDO, Kuis Bertahap, Portal Siswa, dan Panel Admin).

---

## Daftar Isi
1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Pemetaan Fitur Frontend ke Supabase](#2-pemetaan-fitur-frontend-ke-supabase)
3. [Skema Database PostgreSQL (SQL Migration)](#3-skema-database-postgresql-sql-migration)
4. [Functions & Triggers Otomatis](#4-functions--triggers-otomatis)
5. [Row Level Security (RLS) Policies](#5-row-level-security-rls-policies)
6. [Konfigurasi Supabase Storage & Policies](#6-konfigurasi-supabase-storage--policies)
7. [Integrasi dengan Frontend React](#7-integrasi-dengan-frontend-react)
8. [Panduan Setup & Migrasi Data Awal](#8-panduan-setup--migrasi-data-awal)

---

## 1. Arsitektur Sistem

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
```

### Mengapa Supabase?
- **Auth terintegrasi:** Menggantikan state `localStorage` dan kredensial hardcoded di `AuthContext.jsx` serta `AdminAuthContext.jsx` dengan JWT session asli.
- **PostgreSQL + RLS:** Keamanan di level baris database memastikan hanya `admin` yang bisa mengelola kategori, kosakata, level, dan soal kuis, sedangkan siswa hanya bisa mengubah profil & progresnya sendiri.
- **Storage CDN:** Menggantikan folder lokal `Bahan_Video/` dan `URL.createObjectURL()` sehingga video BISINDO (`.mp4`), video soal kuis, dan custom icon kategori tersimpan permanen dan bisa diakses dari perangkat mana saja (desktop maupun mobile).

---

## 2. Pemetaan Fitur Frontend ke Supabase

| Modul Frontend | Sumber Data Saat Ini | Tabel / Layanan Supabase |
|---|---|---|
| `AuthContext.jsx` & `UserProfilePage.jsx` | `localStorage` (`isyaratku_user`) | `auth.users` + tabel `public.profiles` |
| `AdminAuthContext.jsx` & `AdminLoginPage.jsx` | Hardcoded `ADMIN_CREDENTIALS` | `auth.users` dengan `profiles.role = 'admin'` |
| `DictionaryContext.jsx` (`categories`) & `AdminKategoriPage.jsx` | `dictionaryCategories` + state lokal | `public.categories` + bucket `category-icons` |
| `DictionaryContext.jsx` (`vocabularies`) & `AdminKamusPage.jsx` | `allVocabularies` + `Bahan_Video/` | `public.vocabularies` + bucket `vocabulary-videos` |
| `UserDictionaryPage.jsx` & `KamusPage.jsx` (Search Multi-Kata) | Filter array di memory | Query `public.vocabularies` + index `pg_trgm` |
| `QuizContext.jsx` (`levels`) & `AdminKuisPage.jsx` | `initialQuizLevels` | `public.quiz_levels` |
| `QuizContext.jsx` (`questions`) & `AdminKuisPage.jsx` | `initialQuizQuestions` | `public.quiz_questions` + bucket `quiz-videos` |
| `UserQuizPage.jsx` & `UserProgressPage.jsx` | State lokal level & skor | `public.user_quiz_progress`, `public.quiz_attempts`, `public.user_vocabulary_history` |
| `AdminDashboardPage.jsx` & `AdminAnalisisPage.jsx` | Data statis / mock | Agregasi view/query dari `profiles`, `quiz_attempts`, dan `vocabularies` |

---

## 3. Skema Database PostgreSQL (SQL Migration)

Jalankan skrip SQL berikut di **Supabase Dashboard → SQL Editor** secara berurutan.

```sql
-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- 2. TABEL PROFILES (Siswa & Admin)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  full_name TEXT GENERATED ALWAYS AS (TRIM(first_name || ' ' || last_name)) STORED,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  badge TEXT NOT NULL DEFAULT 'Siswa Terdaftar',
  total_points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. TABEL CATEGORIES (Kategori Kosakata BISINDO)
-- ============================================================
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY, -- slug, misal: 'aktivitas', 'keluarga', 'bagian-tubuh'
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'Folder',
  custom_icon_url TEXT, -- URL dari bucket category-icons jika upload icon custom
  icon_color TEXT NOT NULL DEFAULT 'text-violet-600',
  bg_color TEXT NOT NULL DEFAULT 'bg-violet-50',
  badge_color TEXT NOT NULL DEFAULT 'bg-violet-100 text-violet-700',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. TABEL VOCABULARIES (Kosakata + Video + Multi-Bahasa)
-- ============================================================
CREATE TABLE public.vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  trans_en TEXT DEFAULT '',
  trans_ar TEXT DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  description_en TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  video_url TEXT NOT NULL,
  video_path TEXT, -- path internal di bucket vocabulary-videos (untuk hapus file)
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Draft')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index untuk mempercepat pencarian kata & kalimat multi-kata (ID / EN / AR)
CREATE INDEX idx_vocabularies_category ON public.vocabularies(category_id);
CREATE INDEX idx_vocabularies_word_trgm ON public.vocabularies USING GIN (LOWER(word) gin_trgm_ops);
CREATE INDEX idx_vocabularies_trans_en_trgm ON public.vocabularies USING GIN (LOWER(trans_en) gin_trgm_ops);

-- ============================================================
-- 5. TABEL QUIZ_LEVELS (Level Materi Kuis Berurutan)
-- ============================================================
CREATE TABLE public.quiz_levels (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL, -- contoh: 'Level 1'
  subtitle TEXT NOT NULL, -- contoh: 'Dasar & Alfabet'
  unlock_requirement TEXT NOT NULL DEFAULT '', -- contoh: 'Selesaikan Level 1 untuk membuka'
  is_default_unlocked BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE hanya untuk Level 1
  min_pass_score INTEGER NOT NULL DEFAULT 70, -- skor minimal membuka level berikutnya
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. TABEL QUIZ_QUESTIONS (Bank Soal Kuis — Wajib Video)
-- ============================================================
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id BIGINT NOT NULL REFERENCES public.quiz_levels(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'video' CHECK (media_type = 'video'),
  media_url TEXT NOT NULL, -- Wajib terisi URL video
  media_path TEXT, -- path internal di bucket quiz-videos
  options JSONB NOT NULL CHECK (jsonb_array_length(options) = 4), -- array 4 pilihan jawaban
  correct_answer SMALLINT NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  explanation TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'Mudah' CHECK (difficulty IN ('Mudah', 'Sedang', 'Sulit')),
  points INTEGER NOT NULL DEFAULT 10 CHECK (points >= 5 AND points <= 100),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_level ON public.quiz_questions(level_id);

-- ============================================================
-- 7. TABEL USER_QUIZ_PROGRESS (Status Kunci & Skor per User/Level)
-- ============================================================
CREATE TABLE public.user_quiz_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level_id BIGINT NOT NULL REFERENCES public.quiz_levels(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'terkunci' CHECK (status IN ('terkunci', 'lanjut', 'selesai')),
  best_score INTEGER NOT NULL DEFAULT 0 CHECK (best_score BETWEEN 0 AND 100),
  last_score INTEGER NOT NULL DEFAULT 0 CHECK (last_score BETWEEN 0 AND 100),
  attempts INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, level_id)
);

CREATE INDEX idx_user_quiz_progress_user ON public.user_quiz_progress(user_id);

-- ============================================================
-- 8. TABEL QUIZ_ATTEMPTS (Log Riwayat Pengerjaan & Analisis)
-- ============================================================
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level_id BIGINT NOT NULL REFERENCES public.quiz_levels(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  earned_points INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ questionId, selectedOption, isCorrect }]
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id, created_at DESC);

-- ============================================================
-- 9. TABEL USER_VOCABULARY_HISTORY (Progres Kosakata Dipelajari)
-- ============================================================
CREATE TABLE public.user_vocabulary_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
  watched_count INTEGER NOT NULL DEFAULT 1,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, vocabulary_id)
);
```

---

## 4. Functions & Triggers Otomatis

Jalankan skrip berikut untuk:
1. Auto-update kolom `updated_at`.
2. Auto-buat baris `profiles` & membuka **Level 1** saat user baru mendaftar.
3. Auto-urutkan `level_number`, `title`, dan `unlock_requirement` saat Admin menambah level baru.
4. RPC `submit_quiz_attempt` untuk menyimpan skor & membuka kunci level berikutnya secara atomik.

```sql
-- ============================================================
-- A. TRIGGER AUTO-UPDATE TIMESTAMP
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_vocabularies_updated BEFORE UPDATE ON public.vocabularies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_quiz_levels_updated BEFORE UPDATE ON public.quiz_levels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_quiz_questions_updated BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- B. TRIGGER AUTO-CREATE PROFILE SAAT REGISTER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first TEXT;
  v_last TEXT;
  v_level1_id BIGINT;
BEGIN
  v_first := COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1));
  v_last  := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

  INSERT INTO public.profiles (id, first_name, last_name, email, role, badge)
  VALUES (
    NEW.id,
    v_first,
    v_last,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'admin' THEN 'Super Admin'
      ELSE 'Siswa Terdaftar'
    END
  );

  -- Buka Level 1 secara otomatis untuk user baru
  SELECT id INTO v_level1_id FROM public.quiz_levels WHERE level_number = 1 LIMIT 1;
  IF v_level1_id IS NOT NULL THEN
    INSERT INTO public.user_quiz_progress (user_id, level_id, status)
    VALUES (NEW.id, v_level1_id, 'lanjut')
    ON CONFLICT (user_id, level_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- C. TRIGGER AUTO-NUMBERING & SYARAT KUNCI SAAT TAMBAH LEVEL
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_quiz_level()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(level_number), 0) + 1 INTO v_next_num FROM public.quiz_levels;
  NEW.level_number := v_next_num;
  NEW.title := 'Level ' || v_next_num;

  IF v_next_num = 1 THEN
    NEW.is_default_unlocked := TRUE;
    NEW.unlock_requirement := 'Terbuka untuk semua';
  ELSE
    NEW.is_default_unlocked := FALSE;
    NEW.unlock_requirement := 'Selesaikan Level ' || (v_next_num - 1) || ' untuk membuka';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_insert_quiz_level ON public.quiz_levels;
CREATE TRIGGER trg_before_insert_quiz_level
  BEFORE INSERT ON public.quiz_levels
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_quiz_level();

-- ============================================================
-- D. RPC: SUBMIT KUIS & OTOMATIS BUKA LEVEL BERIKUTNYA
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_level_id BIGINT,
  p_correct_count INTEGER,
  p_total_questions INTEGER,
  p_earned_points INTEGER,
  p_answers JSONB DEFAULT '[]'::jsonb,
  p_duration_seconds INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_score INTEGER;
  v_min_pass INTEGER;
  v_curr_level_num INTEGER;
  v_next_level_id BIGINT;
  v_unlocked_next BOOLEAN := FALSE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_score := CASE
    WHEN p_total_questions > 0 THEN ROUND((p_correct_count::NUMERIC / p_total_questions) * 100)
    ELSE 0
  END;

  SELECT level_number, min_pass_score
  INTO v_curr_level_num, v_min_pass
  FROM public.quiz_levels
  WHERE id = p_level_id;

  -- 1. Simpan riwayat attempt
  INSERT INTO public.quiz_attempts (
    user_id, level_id, score, correct_count, total_questions,
    earned_points, answers, duration_seconds
  )
  VALUES (
    v_user_id, p_level_id, v_score, p_correct_count, p_total_questions,
    p_earned_points, p_answers, p_duration_seconds
  );

  -- 2. Update atau insert progres level saat ini
  INSERT INTO public.user_quiz_progress (
    user_id, level_id, status, best_score, last_score, attempts, completed_at
  )
  VALUES (
    v_user_id,
    p_level_id,
    CASE WHEN v_score >= v_min_pass THEN 'selesai' ELSE 'lanjut' END,
    v_score,
    v_score,
    1,
    CASE WHEN v_score >= v_min_pass THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id, level_id) DO UPDATE SET
    attempts = public.user_quiz_progress.attempts + 1,
    last_score = EXCLUDED.last_score,
    best_score = GREATEST(public.user_quiz_progress.best_score, EXCLUDED.best_score),
    status = CASE
      WHEN public.user_quiz_progress.status = 'selesai' OR v_score >= v_min_pass THEN 'selesai'
      ELSE 'lanjut'
    END,
    completed_at = COALESCE(public.user_quiz_progress.completed_at, EXCLUDED.completed_at),
    updated_at = NOW();

  -- 3. Tambah poin ke profil user
  UPDATE public.profiles
  SET total_points = total_points + p_earned_points,
      last_active_at = NOW()
  WHERE id = v_user_id;

  -- 4. Jika lulus, buka level berikutnya (level_number + 1)
  IF v_score >= v_min_pass THEN
    SELECT id INTO v_next_level_id
    FROM public.quiz_levels
    WHERE level_number = v_curr_level_num + 1
    LIMIT 1;

    IF v_next_level_id IS NOT NULL THEN
      INSERT INTO public.user_quiz_progress (user_id, level_id, status)
      VALUES (v_user_id, v_next_level_id, 'lanjut')
      ON CONFLICT (user_id, level_id) DO UPDATE SET
        status = CASE
          WHEN public.user_quiz_progress.status = 'terkunci' THEN 'lanjut'
          ELSE public.user_quiz_progress.status
        END,
        updated_at = NOW();
      v_unlocked_next := TRUE;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'score', v_score,
    'passed', v_score >= v_min_pass,
    'unlocked_next_level', v_unlocked_next,
    'next_level_id', v_next_level_id
  );
END;
$$;
```

---

## 5. Row Level Security (RLS) Policies

Aktifkan RLS di semua tabel agar keamanan data terjamin antara Pengunjung Publik, Siswa (`user`), dan Administrator (`admin`).

```sql
-- Helper function untuk cek role admin tanpa memicu rekursi RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocabulary_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: PROFILES
-- ============================================================
CREATE POLICY "User bisa lihat profil sendiri & admin lihat semua"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "User bisa update profil sendiri"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- POLICIES: CATEGORIES
-- ============================================================
CREATE POLICY "Semua orang bisa membaca kategori"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Hanya admin kelola kategori"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- POLICIES: VOCABULARIES
-- ============================================================
CREATE POLICY "Publik lihat kosakata aktif, admin lihat semua"
  ON public.vocabularies FOR SELECT
  USING (status = 'Aktif' OR public.is_admin());

CREATE POLICY "Hanya admin kelola kosakata"
  ON public.vocabularies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- POLICIES: QUIZ_LEVELS & QUIZ_QUESTIONS
-- ============================================================
CREATE POLICY "Semua orang bisa membaca level kuis"
  ON public.quiz_levels FOR SELECT
  USING (true);

CREATE POLICY "Hanya admin kelola level kuis"
  ON public.quiz_levels FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Semua orang bisa membaca soal kuis"
  ON public.quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Hanya admin kelola soal kuis"
  ON public.quiz_questions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- POLICIES: USER_QUIZ_PROGRESS, QUIZ_ATTEMPTS, VOCAB_HISTORY
-- ============================================================
CREATE POLICY "User lihat progres sendiri, admin lihat semua"
  ON public.user_quiz_progress FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "User update progres sendiri"
  ON public.user_quiz_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User lihat riwayat kuis sendiri, admin lihat semua"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "User catat histori belajar kosakata sendiri"
  ON public.user_vocabulary_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 6. Konfigurasi Supabase Storage & Policies

Buat **4 Storage Buckets** (semuanya berstatus **Public Bucket** agar URL video/icon dapat langsung diputar oleh `<video>` dan `<img>` di frontend):

| Nama Bucket | Fungsi | Batas Ukuran | Allowed MIME Types |
|---|---|---|---|
| `vocabulary-videos` | Video peragaan kosakata kamus (`AdminKamusPage`) | `50 MB` | `video/mp4`, `video/webm`, `video/quicktime` |
| `quiz-videos` | Video pertanyaan soal kuis (`AdminKuisPage` — wajib video) | `50 MB` | `video/mp4`, `video/webm`, `video/quicktime` |
| `category-icons` | Icon custom hasil *Browse Icon* (`AdminKategoriPage`) | `2 MB` | `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml` |
| `avatars` | Foto profil pengguna (`UserProfilePage`) | `2 MB` | `image/png`, `image/jpeg`, `image/webp` |

### SQL Storage Policies

```sql
-- Buat buckets secara otomatis via SQL
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('vocabulary-videos', 'vocabulary-videos', true, 52428800, ARRAY['video/mp4','video/webm','video/quicktime']),
  ('quiz-videos', 'quiz-videos', true, 52428800, ARRAY['video/mp4','video/webm','video/quicktime']),
  ('category-icons', 'category-icons', true, 2097152, ARRAY['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Publik bisa melihat/streaming seluruh file di 4 bucket
CREATE POLICY "Public Read Media"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('vocabulary-videos', 'quiz-videos', 'category-icons', 'avatars'));

-- Hanya Admin yang bisa upload, update, dan hapus video kamus, video kuis, dan icon kategori
CREATE POLICY "Admin Manage Course Media"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('vocabulary-videos', 'quiz-videos', 'category-icons')
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id IN ('vocabulary-videos', 'quiz-videos', 'category-icons')
    AND public.is_admin()
  );

-- User bisa upload/ubah avatar miliknya sendiri di folder /{user_id}/*
CREATE POLICY "User Manage Own Avatar"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 7. Integrasi dengan Frontend React

### 7.1 Instalasi & Environment Variables

Di dalam `packages/frontend`:

```bash
npm install @supabase/supabase-js
```

Buat file `packages/frontend/.env`:

```env
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Catatan:** Jangan pernah menaruh `service_role` key di `.env` frontend!

### 7.2 Client Supabase (`packages/frontend/src/lib/supabase.js`)

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
```

### 7.3 Helper Upload File ke Supabase Storage (`packages/frontend/src/lib/storage.js`)

```javascript
import { supabase } from './supabase'

export async function uploadMediaFile(bucket, file, folder = '') {
  const ext = file.name.split('.').pop()
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = folder ? `${folder}/${safeName}` : safeName

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return {
    publicUrl: data.publicUrl,
    filePath,
  }
}

export async function deleteMediaFile(bucket, filePath) {
  if (!filePath) return
  await supabase.storage.from(bucket).remove([filePath])
}
```

### 7.4 Contoh Integrasi per Context

#### A. Login & Register (`AuthContext.jsx` & `AdminAuthContext.jsx`)

```javascript
// Login Siswa / Admin via Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
if (error) throw error

// Ambil profil & verifikasi role (khusus AdminLoginPage cek profile.role === 'admin')
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', data.user.id)
  .single()
```

#### B. Tambah Kategori + Custom Icon (`DictionaryContext.jsx` / `AdminKategoriPage.jsx`)

```javascript
let customIconUrl = null
if (iconFile) {
  const uploaded = await uploadMediaFile('category-icons', iconFile)
  customIconUrl = uploaded.publicUrl
}

const { data, error } = await supabase
  .from('categories')
  .insert({
    id: slugify(catData.title),
    title: catData.title,
    topic: catData.topic,
    description: catData.description,
    icon_name: catData.iconName,
    custom_icon_url: customIconUrl,
    icon_color: catData.iconColor,
    bg_color: catData.bgColor,
    badge_color: catData.badgeColor,
  })
  .select()
  .single()
```

#### C. Tambah Soal Kuis Wajib Video (`QuizContext.jsx` / `AdminKuisPage.jsx`)

```javascript
// 1. Upload video soal ke bucket quiz-videos (wajib ada file video)
const { publicUrl, filePath } = await uploadMediaFile(
  'quiz-videos',
  videoFile,
  `level-${formData.levelId}`
)

// 2. Simpan soal ke tabel quiz_questions
const { data, error } = await supabase
  .from('quiz_questions')
  .insert({
    level_id: Number(formData.levelId),
    question: formData.question,
    media_type: 'video',
    media_url: publicUrl,
    media_path: filePath,
    options: formData.options,
    correct_answer: Number(formData.correctAnswer),
    explanation: formData.explanation,
    difficulty: formData.difficulty,
    points: Number(formData.points),
  })
  .select()
  .single()
```

#### D. Submit Kuis di Halaman Siswa (`UserQuizPage.jsx`)

```javascript
const { data, error } = await supabase.rpc('submit_quiz_attempt', {
  p_level_id: activeLevel.id,
  p_correct_count: correctCount,
  p_total_questions: activeQuestions.length,
  p_earned_points: earnedPoints,
  p_answers: userAnswersArray,
  p_duration_seconds: elapsedSeconds,
})
// Response: { score: 100, passed: true, unlocked_next_level: true, next_level_id: 3 }
```

---

## 8. Panduan Setup & Migrasi Data Awal

1. **Buat Project Supabase:**
   - Buka [supabase.com](https://supabase.com), buat project baru (region terdekat: **Singapore `ap-southeast-1`**).
2. **Jalankan SQL Migration:**
   - Buka **SQL Editor** → jalankan SQL dari **Bagian 3, 4, 5, dan 6** secara berurutan.
3. **Buat Akun Admin Pertama:**
   - Daftar lewat **Authentication → Users → Add User** (misal `admin@isyaratku.id`).
   - Ubah role-nya menjadi admin lewat SQL Editor:
     ```sql
     UPDATE public.profiles
     SET role = 'admin', badge = 'Super Admin', first_name = 'Budi', last_name = 'Santoso'
     WHERE email = 'admin@isyaratku.id';
     ```
4. **Migrasi Video Lokal (`Bahan_Video/`) ke Bucket `vocabulary-videos` & `quiz-videos`:**
   - Upload folder kategori dari `Bahan_Video/` ke bucket `vocabulary-videos` via Supabase Dashboard atau script Node.js menggunakan `@supabase/supabase-js` (`service_role` key hanya untuk script seeding lokal), lalu simpan `publicUrl` masing-masing ke tabel `public.vocabularies`.
5. **Seed 6 Level Awal Kuis:**
   ```sql
   INSERT INTO public.quiz_levels (subtitle) VALUES
     ('Dasar & Alfabet'),
     ('Keluarga & Sapaan'),
     ('Waktu & Hari'),
     ('Aktivitas Harian'),
     ('Emosi & Perasaan'),
     ('Kalimat Kompleks');
   ```
   *(Trigger `trg_before_insert_quiz_level` akan otomatis mengisi `level_number`, `title`, `is_default_unlocked`, dan `unlock_requirement` secara berurutan.)*
