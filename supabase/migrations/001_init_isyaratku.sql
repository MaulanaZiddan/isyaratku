-- ============================================================
-- ISYARATKU — SUPABASE INITIAL MIGRATION
-- Jalankan seluruh skrip ini di Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. TABEL PROFILES (Siswa & Admin dalam 1 tabel dengan kolom role)
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- 3. TABEL CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'Folder',
  custom_icon_url TEXT,
  icon_color TEXT NOT NULL DEFAULT 'text-violet-600',
  bg_color TEXT NOT NULL DEFAULT 'bg-violet-50',
  badge_color TEXT NOT NULL DEFAULT 'bg-violet-100 text-violet-700',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABEL VOCABULARIES
CREATE TABLE IF NOT EXISTS public.vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  trans_en TEXT DEFAULT '',
  trans_ar TEXT DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  description_en TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  video_url TEXT NOT NULL,
  video_path TEXT,
  status TEXT NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Draft')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vocabularies_category ON public.vocabularies(category_id);
CREATE INDEX IF NOT EXISTS idx_vocabularies_word_trgm ON public.vocabularies USING GIN (LOWER(word) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vocabularies_trans_en_trgm ON public.vocabularies USING GIN (LOWER(trans_en) gin_trgm_ops);

-- 5. TABEL QUIZ_LEVELS
CREATE TABLE IF NOT EXISTS public.quiz_levels (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  unlock_requirement TEXT NOT NULL DEFAULT '',
  is_default_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  min_pass_score INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABEL QUIZ_QUESTIONS (Wajib Video)
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id BIGINT NOT NULL REFERENCES public.quiz_levels(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'video' CHECK (media_type = 'video'),
  media_url TEXT NOT NULL,
  media_path TEXT,
  options JSONB NOT NULL CHECK (jsonb_array_length(options) = 4),
  correct_answer SMALLINT NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
  explanation TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'Mudah' CHECK (difficulty IN ('Mudah', 'Sedang', 'Sulit')),
  points INTEGER NOT NULL DEFAULT 10 CHECK (points >= 5 AND points <= 100),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_level ON public.quiz_questions(level_id);

-- 7. TABEL USER_QUIZ_PROGRESS
CREATE TABLE IF NOT EXISTS public.user_quiz_progress (
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

CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user ON public.user_quiz_progress(user_id);

-- 8. TABEL QUIZ_ATTEMPTS
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level_id BIGINT NOT NULL REFERENCES public.quiz_levels(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  earned_points INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON public.quiz_attempts(user_id, created_at DESC);

-- 9. TABEL USER_VOCABULARY_HISTORY
CREATE TABLE IF NOT EXISTS public.user_vocabulary_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES public.vocabularies(id) ON DELETE CASCADE,
  watched_count INTEGER NOT NULL DEFAULT 1,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, vocabulary_id)
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
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

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated ON public.categories;
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_vocabularies_updated ON public.vocabularies;
CREATE TRIGGER trg_vocabularies_updated BEFORE UPDATE ON public.vocabularies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_quiz_levels_updated ON public.quiz_levels;
CREATE TRIGGER trg_quiz_levels_updated BEFORE UPDATE ON public.quiz_levels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_quiz_questions_updated ON public.quiz_questions;
CREATE TRIGGER trg_quiz_questions_updated BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile saat user register & buka Level 1
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
  )
  ON CONFLICT (id) DO NOTHING;

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

-- Auto-numbering level & syarat buka kunci
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

-- RPC: Submit kuis & otomatis buka level berikutnya
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

  INSERT INTO public.quiz_attempts (
    user_id, level_id, score, correct_count, total_questions,
    earned_points, answers, duration_seconds
  )
  VALUES (
    v_user_id, p_level_id, v_score, p_correct_count, p_total_questions,
    p_earned_points, p_answers, p_duration_seconds
  );

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

  UPDATE public.profiles
  SET total_points = total_points + p_earned_points,
      last_active_at = NOW()
  WHERE id = v_user_id;

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

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vocabulary_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User bisa lihat profil sendiri & admin lihat semua" ON public.profiles;
CREATE POLICY "User bisa lihat profil sendiri & admin lihat semua"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "User bisa update profil sendiri" ON public.profiles;
CREATE POLICY "User bisa update profil sendiri"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Semua orang bisa membaca kategori" ON public.categories;
CREATE POLICY "Semua orang bisa membaca kategori"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Hanya admin kelola kategori" ON public.categories;
CREATE POLICY "Hanya admin kelola kategori"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Publik lihat kosakata aktif, admin lihat semua" ON public.vocabularies;
CREATE POLICY "Publik lihat kosakata aktif, admin lihat semua"
  ON public.vocabularies FOR SELECT
  USING (status = 'Aktif' OR public.is_admin());

DROP POLICY IF EXISTS "Hanya admin kelola kosakata" ON public.vocabularies;
CREATE POLICY "Hanya admin kelola kosakata"
  ON public.vocabularies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Semua orang bisa membaca level kuis" ON public.quiz_levels;
CREATE POLICY "Semua orang bisa membaca level kuis"
  ON public.quiz_levels FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Hanya admin kelola level kuis" ON public.quiz_levels;
CREATE POLICY "Hanya admin kelola level kuis"
  ON public.quiz_levels FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Semua orang bisa membaca soal kuis" ON public.quiz_questions;
CREATE POLICY "Semua orang bisa membaca soal kuis"
  ON public.quiz_questions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Hanya admin kelola soal kuis" ON public.quiz_questions;
CREATE POLICY "Hanya admin kelola soal kuis"
  ON public.quiz_questions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "User lihat progres sendiri, admin lihat semua" ON public.user_quiz_progress;
CREATE POLICY "User lihat progres sendiri, admin lihat semua"
  ON public.user_quiz_progress FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "User update progres sendiri" ON public.user_quiz_progress;
CREATE POLICY "User update progres sendiri"
  ON public.user_quiz_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User lihat riwayat kuis sendiri, admin lihat semua" ON public.quiz_attempts;
CREATE POLICY "User lihat riwayat kuis sendiri, admin lihat semua"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "User catat histori belajar kosakata sendiri" ON public.user_vocabulary_history;
CREATE POLICY "User catat histori belajar kosakata sendiri"
  ON public.user_vocabulary_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS & POLICIES
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('vocabulary-videos', 'vocabulary-videos', true, 52428800, ARRAY['video/mp4','video/webm','video/quicktime']),
  ('quiz-videos', 'quiz-videos', true, 52428800, ARRAY['video/mp4','video/webm','video/quicktime']),
  ('category-icons', 'category-icons', true, 2097152, ARRAY['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Media" ON storage.objects;
CREATE POLICY "Public Read Media"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('vocabulary-videos', 'quiz-videos', 'category-icons', 'avatars'));

DROP POLICY IF EXISTS "Admin Manage Course Media" ON storage.objects;
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

DROP POLICY IF EXISTS "User Manage Own Avatar" ON storage.objects;
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
