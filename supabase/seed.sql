-- ============================================================
-- ISYARATKU — SEED DATA AWAL
-- Jalankan setelah 001_init_isyaratku.sql berhasil dijalankan
-- ============================================================

-- 1. Seed 6 Level Kuis Awal (Trigger otomatis mengisi level_number, title, dan syarat kunci)
INSERT INTO public.quiz_levels (subtitle)
SELECT v.subtitle
FROM (VALUES
  ('Dasar & Alfabet'),
  ('Keluarga & Sapaan'),
  ('Waktu & Hari'),
  ('Aktivitas Harian'),
  ('Emosi & Perasaan'),
  ('Kalimat Kompleks')
) AS v(subtitle)
WHERE NOT EXISTS (SELECT 1 FROM public.quiz_levels);

-- 2. Seed 17 Kategori Kosakata BISINDO
INSERT INTO public.categories (id, title, topic, description, icon_name, icon_color, bg_color, badge_color, sort_order)
VALUES
  ('aktivitas', 'Aktivitas', 'Aktivitas Sehari-hari', 'Pelajari kosakata kata kerja dan aktivitas sehari-hari dalam Bahasa Isyarat Indonesia (BISINDO).', 'Activity', 'text-violet-600', 'bg-violet-50', 'bg-violet-100 text-violet-700', 1),
  ('alam', 'Alam & Cuaca', 'Alam & Cuaca', 'Kosakata BISINDO seputar fenomena alam, benda langit, dan kondisi cuaca.', 'CloudSun', 'text-sky-600', 'bg-sky-50', 'bg-sky-100 text-sky-700', 2),
  ('angka', 'Angka', 'Angka & Bilangan', 'Pelajari isyarat angka satuan, belasan, puluhan, ratusan, hingga jutaan dan miliaran.', 'Hash', 'text-rose-600', 'bg-rose-50', 'bg-rose-100 text-rose-700', 3),
  ('bagian-tubuh', 'Bagian Tubuh', 'Anggota Tubuh', 'Kosakata BISINDO untuk mengenali berbagai bagian tubuh manusia.', 'Hand', 'text-amber-600', 'bg-amber-50', 'bg-amber-100 text-amber-700', 4),
  ('bulan', 'Bulan', 'Nama-nama Bulan', 'Pelajari isyarat 12 nama bulan dalam kalender Masehi dari Januari hingga Desember.', 'Calendar', 'text-indigo-600', 'bg-indigo-50', 'bg-indigo-100 text-indigo-700', 5),
  ('emosi', 'Emosi', 'Ekspresi & Perasaan', 'Ungkapkan perasaan dan emosi seperti senang, sedih, marah, kecewa, dan takut.', 'Smile', 'text-pink-600', 'bg-pink-50', 'bg-pink-100 text-pink-700', 6),
  ('hari', 'Hari', 'Nama-nama Hari', 'Kosakata BISINDO untuk 7 nama hari dalam seminggu.', 'CalendarDays', 'text-teal-600', 'bg-teal-50', 'bg-teal-100 text-teal-700', 7),
  ('keluarga', 'Keluarga', 'Anggota Keluarga', 'Kenali kosakata isyarat untuk memanggil dan menyebut anggota keluarga.', 'Users', 'text-emerald-600', 'bg-emerald-50', 'bg-emerald-100 text-emerald-700', 8),
  ('profesi', 'Profesi', 'Pekerjaan & Profesi', 'Pelajari berbagai kosakata profesi dan pekerjaan di sekitar kita.', 'Briefcase', 'text-blue-600', 'bg-blue-50', 'bg-blue-100 text-blue-700', 9),
  ('pronomina', 'Pronomina', 'Kata Ganti Orang', 'Kata ganti dasar seperti aku, kamu, dia, kalian, dan mereka.', 'UserCheck', 'text-purple-600', 'bg-purple-50', 'bg-purple-100 text-purple-700', 10),
  ('rasa', 'Rasa', 'Rasa Makanan & Minuman', 'Ekspresikan berbagai cita rasa seperti manis, asin, asam, pahit, dan pedas.', 'Utensils', 'text-orange-600', 'bg-orange-50', 'bg-orange-100 text-orange-700', 11),
  ('ruang-rumah', 'Ruang Rumah', 'Ruangan di Rumah', 'Kosakata isyarat untuk bagian dan ruangan di dalam rumah.', 'Home', 'text-cyan-600', 'bg-cyan-50', 'bg-cyan-100 text-cyan-700', 12),
  ('tempat', 'Tempat', 'Lokasi & Tempat Umum', 'Pelajari isyarat nama tempat umum seperti sekolah, rumah sakit, pasar, dan masjid.', 'MapPin', 'text-lime-700', 'bg-lime-50', 'bg-lime-100 text-lime-700', 13),
  ('transportasi', 'Transportasi', 'Alat Transportasi', 'Kosakata BISINDO untuk berbagai kendaraan darat, laut, dan udara.', 'Car', 'text-fuchsia-600', 'bg-fuchsia-50', 'bg-fuchsia-100 text-fuchsia-700', 14),
  ('ukuran', 'Ukuran', 'Ukuran & Perbandingan', 'Pelajari kata sifat ukuran seperti besar, kecil, panjang, pendek, tinggi, dan rendah.', 'Maximize2', 'text-violet-600', 'bg-violet-50', 'bg-violet-100 text-violet-700', 15),
  ('waktu', 'Waktu', 'Keterangan Waktu', 'Kosakata waktu seperti pagi, siang, sore, malam, sekarang, kemarin, dan besok.', 'Clock', 'text-amber-700', 'bg-amber-50', 'bg-amber-100 text-amber-700', 16),
  ('warna', 'Warna', 'Nama-nama Warna', 'Pelajari isyarat berbagai warna dasar dalam BISINDO.', 'Palette', 'text-rose-600', 'bg-rose-50', 'bg-rose-100 text-rose-700', 17)
ON CONFLICT (id) DO NOTHING;
