-- ============================================================
-- ISYARATKU — SEED DATA (Jalankan setelah 001_init_isyaratku.sql)
-- Isi tabel: categories, vocabularies, quiz_levels, quiz_questions
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. CATEGORIES (17 kategori sesuai frontend vocabularies.js)
-- ============================================================
INSERT INTO public.categories (id, title, topic, description, icon_name, icon_color, bg_color, badge_color, sort_order)
VALUES
  ('aktivitas',    'Aktivitas',      'Aktivitas Sehari-hari',  'Pelajari kosakata kata kerja dan aktivitas sehari-hari dalam Bahasa Isyarat Indonesia (BISINDO).', 'Activity',    'text-violet-600', 'bg-violet-50',  'bg-violet-100 text-violet-700',  1),
  ('alam',         'Alam & Cuaca',   'Alam & Cuaca',           'Kosakata BISINDO seputar fenomena alam, benda langit, dan kondisi cuaca.',                         'CloudSun',    'text-sky-600',    'bg-sky-50',     'bg-sky-100 text-sky-700',        2),
  ('angka',        'Angka',          'Angka & Bilangan',       'Pelajari isyarat angka satuan, belasan, puluhan, ratusan, hingga jutaan dan miliaran.',             'Hash',        'text-rose-600',   'bg-rose-50',    'bg-rose-100 text-rose-700',      3),
  ('bagian-tubuh', 'Bagian Tubuh',   'Anggota Tubuh',          'Kosakata BISINDO untuk mengenali berbagai bagian tubuh manusia.',                                   'Hand',        'text-amber-600',  'bg-amber-50',   'bg-amber-100 text-amber-700',    4),
  ('bulan',        'Bulan',          'Nama-nama Bulan',        'Pelajari isyarat 12 nama bulan dalam kalender Masehi dari Januari hingga Desember.',                'Calendar',    'text-indigo-600', 'bg-indigo-50',  'bg-indigo-100 text-indigo-700',  5),
  ('emosi',        'Emosi',          'Ekspresi & Perasaan',    'Ungkapkan perasaan dan emosi seperti senang, sedih, marah, kecewa, dan takut.',                    'Smile',       'text-pink-600',   'bg-pink-50',    'bg-pink-100 text-pink-700',      6),
  ('hari',         'Hari',           'Nama-nama Hari',         'Pelajari isyarat 7 nama hari dalam seminggu mulai dari Senin hingga Minggu.',                       'CalendarDays','text-teal-600',   'bg-teal-50',    'bg-teal-100 text-teal-700',      7),
  ('keluarga',     'Keluarga',       'Anggota Keluarga',       'Pelajari kosakata dasar anggota keluarga dalam Bahasa Isyarat Indonesia (BISINDO).',                'Users',       'text-orange-600', 'bg-orange-50',  'bg-orange-100 text-orange-700',  8),
  ('profesi',      'Profesi',        'Pekerjaan & Profesi',    'Kosakata BISINDO untuk berbagai profesi dan pekerjaan di masyarakat.',                              'Briefcase',   'text-cyan-600',   'bg-cyan-50',    'bg-cyan-100 text-cyan-700',      9),
  ('pronomina',    'Pronomina',      'Kata Ganti Orang',       'Kata ganti orang (Aku, Kamu, Dia, Kalian, Mereka) dalam percakapan BISINDO.',                       'UserCheck',   'text-purple-600', 'bg-purple-50',  'bg-purple-100 text-purple-700',  10),
  ('rasa',         'Rasa',           'Cita Rasa',              'Kosakata BISINDO untuk mendeskripsikan berbagai rasa makanan dan minuman.',                         'Utensils',    'text-lime-600',   'bg-lime-50',    'bg-lime-100 text-lime-700',      11),
  ('ruang-rumah',  'Ruang Rumah',    'Bagian Rumah',           'Kosakata BISINDO seputar ruangan dan area di dalam rumah.',                                         'Home',        'text-emerald-600','bg-emerald-50', 'bg-emerald-100 text-emerald-700',12),
  ('tempat',       'Tempat',         'Lokasi & Tempat Umum',   'Kosakata BISINDO untuk berbagai tempat umum, fasilitas transportasi, dan rumah ibadah.',            'MapPin',      'text-red-600',    'bg-red-50',     'bg-red-100 text-red-700',        13),
  ('transportasi', 'Transportasi',   'Alat Transportasi',      'Kosakata BISINDO untuk berbagai kendaraan darat, laut, dan udara.',                                 'Car',         'text-blue-600',   'bg-blue-50',    'bg-blue-100 text-blue-700',      14),
  ('ukuran',       'Ukuran',         'Dimensi & Ukuran',       'Kosakata BISINDO untuk menyatakan ukuran, dimensi, dan perbandingan benda.',                        'Maximize2',   'text-fuchsia-600','bg-fuchsia-50', 'bg-fuchsia-100 text-fuchsia-700',15),
  ('waktu',        'Waktu',          'Keterangan Waktu',       'Pelajari isyarat keterangan waktu dalam sehari: pagi, siang, sore, dan malam.',                    'Clock',       'text-violet-600', 'bg-violet-50',  'bg-violet-100 text-violet-700',  16),
  ('warna',        'Warna',          'Macam-macam Warna',      'Pelajari isyarat berbagai warna dasar dalam Bahasa Isyarat Indonesia (BISINDO).',                   'Palette',     'text-pink-600',   'bg-pink-50',    'bg-pink-100 text-pink-700',      17)
ON CONFLICT (id) DO UPDATE SET
  title       = EXCLUDED.title,
  topic       = EXCLUDED.topic,
  description = EXCLUDED.description,
  icon_name   = EXCLUDED.icon_name,
  icon_color  = EXCLUDED.icon_color,
  bg_color    = EXCLUDED.bg_color,
  badge_color = EXCLUDED.badge_color,
  sort_order  = EXCLUDED.sort_order;

-- ============================================================
-- 2. VOCABULARIES — semua kosakata sesuai vocabularies.js
-- ============================================================
INSERT INTO public.vocabularies (category_id, word, trans_en, trans_ar, description, description_en, description_ar, video_url, status, sort_order)
VALUES
  -- AKTIVITAS (13 kata)
  ('aktivitas','Belajar',      'Learn / Study',  'يتعلّم',         'Peragaan gestur BISINDO untuk kosakata "Belajar" dalam kategori Aktivitas.',   'BISINDO sign language demonstration for "Learn / Study" in Activities.',   'عرض BISINDO لكلمة يتعلّم في الأنشطة.',          '/videos/Aktivitas/belajar.mp4',      'Aktif', 1),
  ('aktivitas','Berbicara',    'Speak / Talk',   'يتكلّم',         'Peragaan gestur BISINDO untuk kosakata "Berbicara" dalam kategori Aktivitas.',  'BISINDO sign language demonstration for "Speak / Talk" in Activities.',    'عرض BISINDO لكلمة يتكلّم في الأنشطة.',          '/videos/Aktivitas/berbicara.mp4',    'Aktif', 2),
  ('aktivitas','Berjalan',     'Walk',           'يمشي',           'Peragaan gestur BISINDO untuk kosakata "Berjalan" dalam kategori Aktivitas.',   'BISINDO sign language demonstration for "Walk" in Activities.',            'عرض BISINDO لكلمة يمشي في الأنشطة.',            '/videos/Aktivitas/berjalan.mp4',     'Aktif', 3),
  ('aktivitas','Berlari',      'Run',            'يجري',           'Peragaan gestur BISINDO untuk kosakata "Berlari" dalam kategori Aktivitas.',    'BISINDO sign language demonstration for "Run" in Activities.',             'عرض BISINDO لكلمة يجري في الأنشطة.',            '/videos/Aktivitas/berlari.mp4',      'Aktif', 4),
  ('aktivitas','Makan',        'Eat',            'يأكل',           'Peragaan gestur BISINDO untuk kosakata "Makan" dalam kategori Aktivitas.',      'BISINDO sign language demonstration for "Eat" in Activities.',             'عرض BISINDO لكلمة يأكل في الأنشطة.',            '/videos/Aktivitas/makan.mp4',        'Aktif', 5),
  ('aktivitas','Mandi',        'Take a Bath',    'يستحمّ',         'Peragaan gestur BISINDO untuk kosakata "Mandi" dalam kategori Aktivitas.',      'BISINDO sign language demonstration for "Take a Bath" in Activities.',     'عرض BISINDO لكلمة يستحمّ في الأنشطة.',          '/videos/Aktivitas/mandi.mp4',        'Aktif', 6),
  ('aktivitas','Memasak',      'Cook',           'يطبخ',           'Peragaan gestur BISINDO untuk kosakata "Memasak" dalam kategori Aktivitas.',    'BISINDO sign language demonstration for "Cook" in Activities.',            'عرض BISINDO لكلمة يطبخ في الأنشطة.',            '/videos/Aktivitas/memasak.mp4',      'Aktif', 7),
  ('aktivitas','Membaca',      'Read',           'يقرأ',           'Peragaan gestur BISINDO untuk kosakata "Membaca" dalam kategori Aktivitas.',    'BISINDO sign language demonstration for "Read" in Activities.',            'عرض BISINDO لكلمة يقرأ في الأنشطة.',            '/videos/Aktivitas/membaca.mp4',      'Aktif', 8),
  ('aktivitas','Menari',       'Dance',          'يرقص',           'Peragaan gestur BISINDO untuk kosakata "Menari" dalam kategori Aktivitas.',     'BISINDO sign language demonstration for "Dance" in Activities.',           'عرض BISINDO لكلمة يرقص في الأنشطة.',            '/videos/Aktivitas/menari.mp4',       'Aktif', 9),
  ('aktivitas','Menulis',      'Write',          'يكتب',           'Peragaan gestur BISINDO untuk kosakata "Menulis" dalam kategori Aktivitas.',    'BISINDO sign language demonstration for "Write" in Activities.',           'عرض BISINDO لكلمة يكتب في الأنشطة.',            '/videos/Aktivitas/menulis.mp4',      'Aktif', 10),
  ('aktivitas','Menyanyi',     'Sing',           'يغنّي',          'Peragaan gestur BISINDO untuk kosakata "Menyanyi" dalam kategori Aktivitas.',   'BISINDO sign language demonstration for "Sing" in Activities.',            'عرض BISINDO لكلمة يغنّي في الأنشطة.',           '/videos/Aktivitas/menyanyi.mp4',     'Aktif', 11),
  ('aktivitas','Minum',        'Drink',          'يشرب',           'Peragaan gestur BISINDO untuk kosakata "Minum" dalam kategori Aktivitas.',      'BISINDO sign language demonstration for "Drink" in Activities.',           'عرض BISINDO لكلمة يشرب في الأنشطة.',            '/videos/Aktivitas/minum.mp4',        'Aktif', 12),
  ('aktivitas','Tidur',        'Sleep',          'ينام',           'Peragaan gestur BISINDO untuk kosakata "Tidur" dalam kategori Aktivitas.',      'BISINDO sign language demonstration for "Sleep" in Activities.',           'عرض BISINDO لكلمة ينام في الأنشطة.',            '/videos/Aktivitas/tidur.mp4',        'Aktif', 13),

  -- ALAM & CUACA (15 kata)
  ('alam','Angin',       'Wind',               'رياح',       '/videos/Alam/angin.mp4',       'BISINDO sign for Wind.',     'عرض BISINDO لكلمة رياح.',    '/videos/Alam/angin.mp4',       'Aktif', 1),
  ('alam','Awan',        'Cloud',              'سحاب',       '/videos/Alam/awan.mp4',        'BISINDO sign for Cloud.',    'عرض BISINDO لكلمة سحاب.',    '/videos/Alam/awan.mp4',        'Aktif', 2),
  ('alam','Bintang',     'Star',               'نجم',        '/videos/Alam/bintang.mp4',     'BISINDO sign for Star.',     'عرض BISINDO لكلمة نجم.',     '/videos/Alam/bintang.mp4',     'Aktif', 3),
  ('alam','Bulan',       'Moon',               'قمر',        '/videos/Alam/bulan.mp4',       'BISINDO sign for Moon.',     'عرض BISINDO لكلمة قمر.',     '/videos/Alam/bulan.mp4',       'Aktif', 4),
  ('alam','Bumi',        'Earth',              'الأرض',      '/videos/Alam/bumi.mp4',        'BISINDO sign for Earth.',    'عرض BISINDO لكلمة الأرض.',   '/videos/Alam/bumi.mp4',        'Aktif', 5),
  ('alam','Dingin',      'Cold',               'بارد',       '/videos/Alam/dingin.mp4',      'BISINDO sign for Cold.',     'عرض BISINDO لكلمة بارد.',    '/videos/Alam/dingin.mp4',      'Aktif', 6),
  ('alam','Gerimis',     'Drizzle',            'رذاذ المطر', '/videos/Alam/gerimis.mp4',     'BISINDO sign for Drizzle.',  'عرض BISINDO لكلمة رذاذ.',    '/videos/Alam/gerimis.mp4',     'Aktif', 7),
  ('alam','Hujan',       'Rain',               'مطر',        '/videos/Alam/hujan.mp4',       'BISINDO sign for Rain.',     'عرض BISINDO لكلمة مطر.',     '/videos/Alam/hujan.mp4',       'Aktif', 8),
  ('alam','Langit',      'Sky',                'سماء',       '/videos/Alam/langit.mp4',      'BISINDO sign for Sky.',      'عرض BISINDO لكلمة سماء.',    '/videos/Alam/langit.mp4',      'Aktif', 9),
  ('alam','Matahari',    'Sun',                'شمس',        '/videos/Alam/matahari.mp4',    'BISINDO sign for Sun.',      'عرض BISINDO لكلمة شمس.',     '/videos/Alam/matahari.mp4',    'Aktif', 10),
  ('alam','Mendung',     'Cloudy / Overcast',  'غائم',       '/videos/Alam/mendung.mp4',     'BISINDO sign for Cloudy.',   'عرض BISINDO لكلمة غائم.',    '/videos/Alam/mendung.mp4',     'Aktif', 11),
  ('alam','Panas',       'Hot',                'حارّ',       '/videos/Alam/panas.mp4',       'BISINDO sign for Hot.',      'عرض BISINDO لكلمة حارّ.',    '/videos/Alam/panas.mp4',       'Aktif', 12),
  ('alam','Pelangi',     'Rainbow',            'قوس قزح',    '/videos/Alam/pelangi.mp4',     'BISINDO sign for Rainbow.',  'عرض BISINDO لكلمة قوس قزح.', '/videos/Alam/pelangi.mp4',     'Aktif', 13),
  ('alam','Petir',       'Lightning / Thunder','برق',         '/videos/Alam/petir.mp4',       'BISINDO sign for Lightning.','عرض BISINDO لكلمة برق.',     '/videos/Alam/petir.mp4',       'Aktif', 14),
  ('alam','Sejuk',       'Cool / Breezy',      'منعش',       '/videos/Alam/sejuk.mp4',       'BISINDO sign for Cool.',     'عرض BISINDO لكلمة منعش.',    '/videos/Alam/sejuk.mp4',       'Aktif', 15),

  -- ANGKA (19 kata)
  ('angka','Satu',           'One (1)',           'واحد',         'Isyarat BISINDO untuk Satu.',    'BISINDO sign for One.',    'عرض BISINDO للعدد واحد.',   '/videos/Angka/satu.mp4',           'Aktif', 1),
  ('angka','Dua',            'Two (2)',           'اثنان',        'Isyarat BISINDO untuk Dua.',     'BISINDO sign for Two.',    'عرض BISINDO للعدد اثنان.',  '/videos/Angka/dua.mp4',            'Aktif', 2),
  ('angka','Tiga',           'Three (3)',         'ثلاثة',        'Isyarat BISINDO untuk Tiga.',    'BISINDO sign for Three.',  'عرض BISINDO للعدد ثلاثة.',  '/videos/Angka/tiga.mp4',           'Aktif', 3),
  ('angka','Empat',          'Four (4)',          'أربعة',        'Isyarat BISINDO untuk Empat.',   'BISINDO sign for Four.',   'عرض BISINDO للعدد أربعة.',  '/videos/Angka/empat.mp4',          'Aktif', 4),
  ('angka','Lima',           'Five (5)',          'خمسة',         'Isyarat BISINDO untuk Lima.',    'BISINDO sign for Five.',   'عرض BISINDO للعدد خمسة.',   '/videos/Angka/lima.mp4',           'Aktif', 5),
  ('angka','Enam',           'Six (6)',           'ستة',          'Isyarat BISINDO untuk Enam.',    'BISINDO sign for Six.',    'عرض BISINDO للعدد ستة.',    '/videos/Angka/enam.mp4',           'Aktif', 6),
  ('angka','Tujuh',          'Seven (7)',         'سبعة',         'Isyarat BISINDO untuk Tujuh.',   'BISINDO sign for Seven.',  'عرض BISINDO للعدد سبعة.',   '/videos/Angka/tujuh.mp4',          'Aktif', 7),
  ('angka','Delapan',        'Eight (8)',         'ثمانية',       'Isyarat BISINDO untuk Delapan.', 'BISINDO sign for Eight.',  'عرض BISINDO للعدد ثمانية.', '/videos/Angka/delapan.mp4',        'Aktif', 8),
  ('angka','Sembilan',       'Nine (9)',          'تسعة',         'Isyarat BISINDO untuk Sembilan.','BISINDO sign for Nine.',   'عرض BISINDO للعدد تسعة.',   '/videos/Angka/sembilan.mp4',       'Aktif', 9),
  ('angka','Sepuluh',        'Ten (10)',          'عشرة',         'Isyarat BISINDO untuk Sepuluh.', 'BISINDO sign for Ten.',    'عرض BISINDO للعدد عشرة.',   '/videos/Angka/sepuluh.mp4',        'Aktif', 10),
  ('angka','Sebelas',        'Eleven (11)',       'أحد عشر',      'Isyarat BISINDO untuk Sebelas.', 'BISINDO sign for Eleven.', 'عرض BISINDO للعدد أحد عشر.','/videos/Angka/sebelas.mp4',        'Aktif', 11),
  ('angka','Dua Belas',      'Twelve (12)',       'اثنا عشر',     'Isyarat BISINDO untuk Dua Belas.','BISINDO sign for Twelve.','عرض BISINDO للعدد اثنا عشر.','/videos/Angka/dua belas.mp4',    'Aktif', 12),
  ('angka','Dua Puluh Satu', 'Twenty-One (21)',   'واحد وعشرون',  'Isyarat BISINDO untuk 21.',     'BISINDO sign for 21.',     'عرض BISINDO للعدد 21.',     '/videos/Angka/dua puluh satu.mp4', 'Aktif', 13),
  ('angka','Tiga Puluh Lima','Thirty-Five (35)',  'خمسة وثلاثون', 'Isyarat BISINDO untuk 35.',     'BISINDO sign for 35.',     'عرض BISINDO للعدد 35.',     '/videos/Angka/tiga puluh lima.mp4','Aktif', 14),
  ('angka','Lima Puluh',     'Fifty (50)',        'خمسون',        'Isyarat BISINDO untuk 50.',     'BISINDO sign for 50.',     'عرض BISINDO للعدد 50.',     '/videos/Angka/lima puluh.mp4',     'Aktif', 15),
  ('angka','Seratus',        'One Hundred (100)', 'مئة',          'Isyarat BISINDO untuk 100.',    'BISINDO sign for 100.',    'عرض BISINDO للعدد 100.',    '/videos/Angka/seratus.mp4',        'Aktif', 16),
  ('angka','Seribu',         'One Thousand (1000)','ألف',         'Isyarat BISINDO untuk 1000.',   'BISINDO sign for 1000.',   'عرض BISINDO للعدد 1000.',   '/videos/Angka/seribu.mp4',         'Aktif', 17),
  ('angka','Satu Juta',      'One Million',       'مليون',        'Isyarat BISINDO untuk 1 Juta.', 'BISINDO sign for 1M.',     'عرض BISINDO للعدد مليون.',  '/videos/Angka/satu juta.mp4',      'Aktif', 18),
  ('angka','Satu Miliar',    'One Billion',       'مليار',        'Isyarat BISINDO untuk 1 Miliar.','BISINDO sign for 1B.',    'عرض BISINDO للعدد مليار.',  '/videos/Angka/satu miliar.mp4',    'Aktif', 19),

  -- BAGIAN TUBUH (9 kata)
  ('bagian-tubuh','Hidung',  'Nose',   'أنف',   'BISINDO untuk Hidung.', 'BISINDO sign for Nose.',   'عرض BISINDO أنف.',  '/videos/Bagian Tubuh/hidung.mp4',  'Aktif', 1),
  ('bagian-tubuh','Jari',    'Finger', 'إصبع',  'BISINDO untuk Jari.',   'BISINDO sign for Finger.', 'عرض BISINDO إصبع.', '/videos/Bagian Tubuh/Jari.mp4',    'Aktif', 2),
  ('bagian-tubuh','Kaki',    'Foot',   'قدم',   'BISINDO untuk Kaki.',   'BISINDO sign for Foot.',   'عرض BISINDO قدم.',  '/videos/Bagian Tubuh/kaki.mp4',    'Aktif', 3),
  ('bagian-tubuh','Mata',    'Eye',    'عين',   'BISINDO untuk Mata.',   'BISINDO sign for Eye.',    'عرض BISINDO عين.',  '/videos/Bagian Tubuh/mata.mp4',    'Aktif', 4),
  ('bagian-tubuh','Mulut',   'Mouth',  'فم',    'BISINDO untuk Mulut.',  'BISINDO sign for Mouth.',  'عرض BISINDO فم.',   '/videos/Bagian Tubuh/mulut.mp4',   'Aktif', 5),
  ('bagian-tubuh','Pipi',    'Cheek',  'خد',    'BISINDO untuk Pipi.',   'BISINDO sign for Cheek.',  'عرض BISINDO خد.',   '/videos/Bagian Tubuh/pipi.mp4',    'Aktif', 6),
  ('bagian-tubuh','Rambut',  'Hair',   'شعر',   'BISINDO untuk Rambut.', 'BISINDO sign for Hair.',   'عرض BISINDO شعر.',  '/videos/Bagian Tubuh/rambut.mp4',  'Aktif', 7),
  ('bagian-tubuh','Sikut',   'Elbow',  'كوع',   'BISINDO untuk Sikut.',  'BISINDO sign for Elbow.',  'عرض BISINDO كوع.',  '/videos/Bagian Tubuh/sikut.mp4',   'Aktif', 8),
  ('bagian-tubuh','Tangan',  'Hand',   'يد',    'BISINDO untuk Tangan.', 'BISINDO sign for Hand.',   'عرض BISINDO يد.',   '/videos/Bagian Tubuh/tangan.mp4',  'Aktif', 9),

  -- BULAN (12 kata)
  ('bulan','Januari',  'January',   'يناير',   'BISINDO untuk Januari.',  'BISINDO sign for January.',   'عرض BISINDO يناير.',   '/videos/Bulan/januari.mp4',  'Aktif', 1),
  ('bulan','Februari', 'February',  'فبراير',  'BISINDO untuk Februari.', 'BISINDO sign for February.',  'عرض BISINDO فبراير.',  '/videos/Bulan/februari.mp4', 'Aktif', 2),
  ('bulan','Maret',    'March',     'مارس',    'BISINDO untuk Maret.',    'BISINDO sign for March.',     'عرض BISINDO مارس.',    '/videos/Bulan/maret.mp4',    'Aktif', 3),
  ('bulan','April',    'April',     'أبريل',   'BISINDO untuk April.',    'BISINDO sign for April.',     'عرض BISINDO أبريل.',   '/videos/Bulan/april.mp4',    'Aktif', 4),
  ('bulan','Mei',      'May',       'مايو',    'BISINDO untuk Mei.',      'BISINDO sign for May.',       'عرض BISINDO مايو.',    '/videos/Bulan/mei.mp4',      'Aktif', 5),
  ('bulan','Juni',     'June',      'يونيو',   'BISINDO untuk Juni.',     'BISINDO sign for June.',      'عرض BISINDO يونيو.',   '/videos/Bulan/juni.mp4',     'Aktif', 6),
  ('bulan','Juli',     'July',      'يوليو',   'BISINDO untuk Juli.',     'BISINDO sign for July.',      'عرض BISINDO يوليو.',   '/videos/Bulan/juli.mp4',     'Aktif', 7),
  ('bulan','Agustus',  'August',    'أغسطس',   'BISINDO untuk Agustus.', 'BISINDO sign for August.',    'عرض BISINDO أغسطس.',   '/videos/Bulan/agustus.mp4',  'Aktif', 8),
  ('bulan','September','September', 'سبتمبر',  'BISINDO untuk September.','BISINDO sign for September.', 'عرض BISINDO سبتمبر.', '/videos/Bulan/september.mp4','Aktif', 9),
  ('bulan','Oktober',  'October',   'أكتوبر',  'BISINDO untuk Oktober.',  'BISINDO sign for October.',   'عرض BISINDO أكتوبر.',  '/videos/Bulan/oktober.mp4',  'Aktif', 10),
  ('bulan','November', 'November',  'نوفمبر',  'BISINDO untuk November.', 'BISINDO sign for November.',  'عرض BISINDO نوفمبر.',  '/videos/Bulan/november.mp4', 'Aktif', 11),
  ('bulan','Desember', 'December',  'ديسمبر',  'BISINDO untuk Desember.', 'BISINDO sign for December.',  'عرض BISINDO ديسمبر.',  '/videos/Bulan/desember.mp4', 'Aktif', 12),

  -- EMOSI (5 kata)
  ('emosi','Senang', 'Happy',         'سعيد',          'BISINDO untuk Senang.', 'BISINDO sign for Happy.',         'عرض BISINDO سعيد.',          '/videos/Emosi/senang.mp4', 'Aktif', 1),
  ('emosi','Sedih',  'Sad',           'حزين',          'BISINDO untuk Sedih.',  'BISINDO sign for Sad.',           'عرض BISINDO حزين.',          '/videos/Emosi/sedih.mp4',  'Aktif', 2),
  ('emosi','Marah',  'Angry',         'غاضب',          'BISINDO untuk Marah.',  'BISINDO sign for Angry.',         'عرض BISINDO غاضب.',          '/videos/Emosi/marah.mp4',  'Aktif', 3),
  ('emosi','Kecewa', 'Disappointed',  'خائب الأمل',    'BISINDO untuk Kecewa.', 'BISINDO sign for Disappointed.',  'عرض BISINDO خائب الأمل.',    '/videos/Emosi/kecewa.mp4', 'Aktif', 4),
  ('emosi','Takut',  'Scared',        'خائف',          'BISINDO untuk Takut.',  'BISINDO sign for Scared.',        'عرض BISINDO خائف.',          '/videos/Emosi/takut.mp4',  'Aktif', 5),

  -- HARI (7 kata)
  ('hari','Senin',  'Monday',    'الإثنين',  'BISINDO untuk Senin.',  'BISINDO sign for Monday.',    'عرض BISINDO الإثنين.',   '/videos/Hari/senin.mp4',  'Aktif', 1),
  ('hari','Selasa', 'Tuesday',   'الثلاثاء', 'BISINDO untuk Selasa.', 'BISINDO sign for Tuesday.',   'عرض BISINDO الثلاثاء.',  '/videos/Hari/selasa.mp4', 'Aktif', 2),
  ('hari','Rabu',   'Wednesday', 'الأربعاء', 'BISINDO untuk Rabu.',   'BISINDO sign for Wednesday.', 'عرض BISINDO الأربعاء.',  '/videos/Hari/rabu.mp4',   'Aktif', 3),
  ('hari','Kamis',  'Thursday',  'الخميس',   'BISINDO untuk Kamis.',  'BISINDO sign for Thursday.',  'عرض BISINDO الخميس.',    '/videos/Hari/kamis.mp4',  'Aktif', 4),
  ('hari','Jumat',  'Friday',    'الجمعة',   'BISINDO untuk Jumat.',  'BISINDO sign for Friday.',    'عرض BISINDO الجمعة.',    '/videos/Hari/jumat.mp4',  'Aktif', 5),
  ('hari','Sabtu',  'Saturday',  'السبت',    'BISINDO untuk Sabtu.',  'BISINDO sign for Saturday.',  'عرض BISINDO السبت.',     '/videos/Hari/sabtu.mp4',  'Aktif', 6),
  ('hari','Minggu', 'Sunday',    'الأحد',    'BISINDO untuk Minggu.', 'BISINDO sign for Sunday.',    'عرض BISINDO الأحد.',     '/videos/Hari/minggu.mp4', 'Aktif', 7),

  -- KELUARGA (9 kata)
  ('keluarga','Bapak',          'Father',         'أب',        'BISINDO untuk Bapak.',           'BISINDO sign for Father.',         'عرض BISINDO أب.',        '/videos/Keluarga/bapak.mp4',          'Aktif', 1),
  ('keluarga','Ibu',            'Mother',         'أمّ',       'BISINDO untuk Ibu.',             'BISINDO sign for Mother.',         'عرض BISINDO أمّ.',       '/videos/Keluarga/ibu.mp4',            'Aktif', 2),
  ('keluarga','Anak',           'Child',          'طفل / ابن', 'BISINDO untuk Anak.',            'BISINDO sign for Child.',          'عرض BISINDO طفل.',       '/videos/Keluarga/anak.mp4',           'Aktif', 3),
  ('keluarga','Kakak Laki-laki','Older Brother',  'أخ أكبر',   'BISINDO untuk Kakak Laki-laki.', 'BISINDO sign for Older Brother.',  'عرض BISINDO أخ أكبر.',   '/videos/Keluarga/kakak laki-laki.mp4','Aktif', 4),
  ('keluarga','Kakak Perempuan','Older Sister',   'أخت كبرى',  'BISINDO untuk Kakak Perempuan.', 'BISINDO sign for Older Sister.',   'عرض BISINDO أخت كبرى.',  '/videos/Keluarga/kakak perempuan.mp4','Aktif', 5),
  ('keluarga','Adik Laki-laki', 'Younger Brother','أخ أصغر',   'BISINDO untuk Adik Laki-laki.',  'BISINDO sign for Younger Brother.',  'عرض BISINDO أخ أصغر.', '/videos/Keluarga/adik laki-laki.mp4', 'Aktif', 6),
  ('keluarga','Adik Perempuan', 'Younger Sister', 'أخت صغرى',  'BISINDO untuk Adik Perempuan.',  'BISINDO sign for Younger Sister.',   'عرض BISINDO أخت صغرى.','/videos/Keluarga/adik perempuan.mp4', 'Aktif', 7),
  ('keluarga','Kakek',          'Grandfather',    'جدّ',       'BISINDO untuk Kakek.',           'BISINDO sign for Grandfather.',    'عرض BISINDO جدّ.',       '/videos/Keluarga/kakek.mp4',          'Aktif', 8),
  ('keluarga','Nenek',          'Grandmother',    'جدّة',      'BISINDO untuk Nenek.',           'BISINDO sign for Grandmother.',    'عرض BISINDO جدّة.',      '/videos/Keluarga/nenek.mp4',          'Aktif', 9),

  -- PROFESI (7 kata)
  ('profesi','Dokter',   'Doctor',         'طبيب',  'BISINDO untuk Dokter.',   'BISINDO sign for Doctor.',          'عرض BISINDO طبيب.',   '/videos/Profesi/dokter.mp4',   'Aktif', 1),
  ('profesi','Guru',     'Teacher',        'معلّم', 'BISINDO untuk Guru.',     'BISINDO sign for Teacher.',         'عرض BISINDO معلّم.',  '/videos/Profesi/guru.mp4',     'Aktif', 2),
  ('profesi','Hakim',    'Judge',          'قاضٍ',  'BISINDO untuk Hakim.',    'BISINDO sign for Judge.',           'عرض BISINDO قاضٍ.',   '/videos/Profesi/hakim.mp4',    'Aktif', 3),
  ('profesi','Perawat',  'Nurse',          'ممرّض', 'BISINDO untuk Perawat.',  'BISINDO sign for Nurse.',           'عرض BISINDO ممرّض.',  '/videos/Profesi/perawat.mp4',  'Aktif', 4),
  ('profesi','Pilot',    'Pilot',          'طيّار', 'BISINDO untuk Pilot.',    'BISINDO sign for Pilot.',           'عرض BISINDO طيّار.',  '/videos/Profesi/pilot.mp4',    'Aktif', 5),
  ('profesi','Polisi',   'Police Officer', 'شرطي',  'BISINDO untuk Polisi.',   'BISINDO sign for Police Officer.',  'عرض BISINDO شرطي.',   '/videos/Profesi/polisi.mp4',   'Aktif', 6),
  ('profesi','Wartawan', 'Journalist',     'صحفي',  'BISINDO untuk Wartawan.', 'BISINDO sign for Journalist.',      'عرض BISINDO صحفي.',   '/videos/Profesi/wartawan.mp4', 'Aktif', 7),

  -- PRONOMINA (5 kata)
  ('pronomina','Aku',    'I / Me',         'أنا',         'BISINDO untuk Aku.',    'BISINDO sign for I / Me.',         'عرض BISINDO أنا.',         '/videos/pronomina/aku.mp4',    'Aktif', 1),
  ('pronomina','Kamu',   'You (Singular)', 'أنتَ / أنتِ', 'BISINDO untuk Kamu.',   'BISINDO sign for You (Singular).',  'عرض BISINDO أنتَ / أنتِ.', '/videos/pronomina/kamu.mp4',   'Aktif', 2),
  ('pronomina','Dia',    'He / She',       'هو / هي',     'BISINDO untuk Dia.',    'BISINDO sign for He / She.',       'عرض BISINDO هو / هي.',     '/videos/pronomina/dia.mp4',    'Aktif', 3),
  ('pronomina','Kalian', 'You (Plural)',   'أنتم',        'BISINDO untuk Kalian.', 'BISINDO sign for You (Plural).',   'عرض BISINDO أنتم.',        '/videos/pronomina/kalian.mp4', 'Aktif', 4),
  ('pronomina','Mereka', 'They',           'هم',          'BISINDO untuk Mereka.', 'BISINDO sign for They.',           'عرض BISINDO هم.',          '/videos/pronomina/mereka.mp4', 'Aktif', 5),

  -- RASA (5 kata)
  ('rasa','Manis', 'Sweet',  'حلو',          'BISINDO untuk Manis.', 'BISINDO sign for Sweet.',  'عرض BISINDO حلو.',          '/videos/Rasa/manis.mp4', 'Aktif', 1),
  ('rasa','Asam',  'Sour',   'حامض',         'BISINDO untuk Asam.',  'BISINDO sign for Sour.',   'عرض BISINDO حامض.',         '/videos/Rasa/asam.mp4',  'Aktif', 2),
  ('rasa','Asin',  'Salty',  'مالح',         'BISINDO untuk Asin.',  'BISINDO sign for Salty.',  'عرض BISINDO مالح.',         '/videos/Rasa/asin.mp4',  'Aktif', 3),
  ('rasa','Pahit', 'Bitter', 'مرّ',          'BISINDO untuk Pahit.', 'BISINDO sign for Bitter.', 'عرض BISINDO مرّ.',          '/videos/Rasa/pahit.mp4', 'Aktif', 4),
  ('rasa','Pedas', 'Spicy',  'حارّ / لاذع', 'BISINDO untuk Pedas.', 'BISINDO sign for Spicy.',  'عرض BISINDO حارّ / لاذع.', '/videos/Rasa/pedas.mp4', 'Aktif', 5),

  -- RUANG RUMAH (5 kata)
  ('ruang-rumah','Ruang Tamu', 'Living Room', 'غرفة الجلوس','BISINDO untuk Ruang Tamu.', 'BISINDO sign for Living Room.',  'عرض BISINDO غرفة الجلوس.','/videos/Ruang Rumah/ruang tamu.mp4','Aktif', 1),
  ('ruang-rumah','Kamar Tidur','Bedroom',     'غرفة النوم', 'BISINDO untuk Kamar Tidur.','BISINDO sign for Bedroom.',      'عرض BISINDO غرفة النوم.', '/videos/Ruang Rumah/kamar tidur.mp4','Aktif',2),
  ('ruang-rumah','Kamar Mandi','Bathroom',    'حمّام',      'BISINDO untuk Kamar Mandi.','BISINDO sign for Bathroom.',     'عرض BISINDO حمّام.',      '/videos/Ruang Rumah/kamar mandi.mp4','Aktif',3),
  ('ruang-rumah','Dapur',      'Kitchen',     'مطبخ',       'BISINDO untuk Dapur.',      'BISINDO sign for Kitchen.',      'عرض BISINDO مطبخ.',       '/videos/Ruang Rumah/dapur.mp4',      'Aktif', 4),
  ('ruang-rumah','Halaman',    'Yard / Garden','فناء المنزل','BISINDO untuk Halaman.',   'BISINDO sign for Yard.',         'عرض BISINDO فناء المنزل.','/videos/Ruang Rumah/halaman.mp4',    'Aktif', 5),

  -- TEMPAT (13 kata)
  ('tempat','Rumah',    'House / Home',    'منزل',            'BISINDO untuk Rumah.',    'BISINDO sign for House.',          'عرض BISINDO منزل.',            '/videos/Tempat/rumah.mp4',    'Aktif', 1),
  ('tempat','Sekolah',  'School',          'مدرسة',           'BISINDO untuk Sekolah.',  'BISINDO sign for School.',         'عرض BISINDO مدرسة.',           '/videos/Tempat/sekolah.mp4',  'Aktif', 2),
  ('tempat','Kantor',   'Office',          'مكتب',            'BISINDO untuk Kantor.',   'BISINDO sign for Office.',         'عرض BISINDO مكتب.',            '/videos/Tempat/kantor.mp4',   'Aktif', 3),
  ('tempat','Pasar',    'Market',          'سوق',             'BISINDO untuk Pasar.',    'BISINDO sign for Market.',         'عرض BISINDO سوق.',             '/videos/Tempat/pasar.mp4',    'Aktif', 4),
  ('tempat','Taman',    'Park',            'حديقة',           'BISINDO untuk Taman.',    'BISINDO sign for Park.',           'عرض BISINDO حديقة.',           '/videos/Tempat/taman.mp4',    'Aktif', 5),
  ('tempat','Bandara',  'Airport',         'مطار',            'BISINDO untuk Bandara.',  'BISINDO sign for Airport.',        'عرض BISINDO مطار.',            '/videos/Tempat/bandara.mp4',  'Aktif', 6),
  ('tempat','Stasiun',  'Train Station',   'محطة قطار',       'BISINDO untuk Stasiun.',  'BISINDO sign for Train Station.',  'عرض BISINDO محطة قطار.',       '/videos/Tempat/stasiun.mp4',  'Aktif', 7),
  ('tempat','Terminal', 'Bus Terminal',    'محطة الحافلات',   'BISINDO untuk Terminal.', 'BISINDO sign for Bus Terminal.',   'عرض BISINDO محطة الحافلات.',   '/videos/Tempat/terminal.mp4', 'Aktif', 8),
  ('tempat','Pelabuhan','Seaport',         'ميناء',           'BISINDO untuk Pelabuhan.','BISINDO sign for Seaport.',        'عرض BISINDO ميناء.',           '/videos/Tempat/pelabuhan.mp4','Aktif', 9),
  ('tempat','Masjid',   'Mosque',          'مسجد',            'BISINDO untuk Masjid.',   'BISINDO sign for Mosque.',         'عرض BISINDO مسجد.',            '/videos/Tempat/masjid.mp4',   'Aktif', 10),
  ('tempat','Gereja',   'Church',          'كنيسة',           'BISINDO untuk Gereja.',   'BISINDO sign for Church.',         'عرض BISINDO كنيسة.',           '/videos/Tempat/gereja.mp4',   'Aktif', 11),
  ('tempat','Pura',     'Hindu Temple',    'معبد هندوسي',     'BISINDO untuk Pura.',     'BISINDO sign for Hindu Temple.',   'عرض BISINDO معبد هندوسي.',     '/videos/Tempat/pura.mp4',     'Aktif', 12),
  ('tempat','Wihara',   'Buddhist Temple', 'معبد بوذي',       'BISINDO untuk Wihara.',   'BISINDO sign for Buddhist Temple.','عرض BISINDO معبد بوذي.',       '/videos/Tempat/wihara.mp4',   'Aktif', 13),

  -- TRANSPORTASI (8 kata)
  ('transportasi','Sepeda',       'Bicycle',    'دراجة',       'BISINDO untuk Sepeda.',       'BISINDO sign for Bicycle.',    'عرض BISINDO دراجة.',       '/videos/Transportasi/sepeda.mp4',       'Aktif', 1),
  ('transportasi','Sepeda Motor', 'Motorcycle', 'دراجة نارية', 'BISINDO untuk Sepeda Motor.', 'BISINDO sign for Motorcycle.', 'عرض BISINDO دراجة نارية.', '/videos/Transportasi/sepeda motor.mp4', 'Aktif', 2),
  ('transportasi','Mobil',        'Car',        'سيارة',       'BISINDO untuk Mobil.',        'BISINDO sign for Car.',        'عرض BISINDO سيارة.',       '/videos/Transportasi/mobil.mp4',        'Aktif', 3),
  ('transportasi','Bus',          'Bus',        'حافلة',       'BISINDO untuk Bus.',           'BISINDO sign for Bus.',        'عرض BISINDO حافلة.',       '/videos/Transportasi/bus.mp4',          'Aktif', 4),
  ('transportasi','Kereta',       'Train',      'قطار',        'BISINDO untuk Kereta.',        'BISINDO sign for Train.',      'عرض BISINDO قطار.',        '/videos/Transportasi/kereta.mp4',       'Aktif', 5),
  ('transportasi','Kapal',        'Ship',       'سفينة',       'BISINDO untuk Kapal.',         'BISINDO sign for Ship.',       'عرض BISINDO سفينة.',       '/videos/Transportasi/kapal.mp4',        'Aktif', 6),
  ('transportasi','Pesawat',      'Airplane',   'طائرة',       'BISINDO untuk Pesawat.',       'BISINDO sign for Airplane.',   'عرض BISINDO طائرة.',       '/videos/Transportasi/pesawat.mp4',      'Aktif', 7),
  ('transportasi','Ambulans',     'Ambulance',  'سيارة إسعاف', 'BISINDO untuk Ambulans.',      'BISINDO sign for Ambulance.',  'عرض BISINDO سيارة إسعاف.','/videos/Transportasi/ambulans.mp4',     'Aktif', 8),

  -- UKURAN (10 kata)
  ('ukuran','Besar',  'Big / Large', 'كبير',  'BISINDO untuk Besar.', 'BISINDO sign for Big.',      'عرض BISINDO كبير.', '/videos/Ukuran/besar.mp4',  'Aktif', 1),
  ('ukuran','Kecil',  'Small',       'صغير',  'BISINDO untuk Kecil.', 'BISINDO sign for Small.',    'عرض BISINDO صغير.', '/videos/Ukuran/kecil.mp4',  'Aktif', 2),
  ('ukuran','Panjang','Long',        'طويل',  'BISINDO untuk Panjang.','BISINDO sign for Long.',    'عرض BISINDO طويل.', '/videos/Ukuran/panjang.mp4','Aktif', 3),
  ('ukuran','Pendek', 'Short',       'قصير',  'BISINDO untuk Pendek.', 'BISINDO sign for Short.',   'عرض BISINDO قصير.', '/videos/Ukuran/pendek.mp4', 'Aktif', 4),
  ('ukuran','Tinggi', 'Tall / High', 'عالٍ',  'BISINDO untuk Tinggi.', 'BISINDO sign for Tall.',    'عرض BISINDO عالٍ.', '/videos/Ukuran/tinggi.mp4', 'Aktif', 5),
  ('ukuran','Rendah', 'Low',         'منخفض', 'BISINDO untuk Rendah.', 'BISINDO sign for Low.',     'عرض BISINDO منخفض.','/videos/Ukuran/rendah.mp4', 'Aktif', 6),
  ('ukuran','Lebar',  'Wide',        'عريض',  'BISINDO untuk Lebar.',  'BISINDO sign for Wide.',    'عرض BISINDO عريض.', '/videos/Ukuran/lebar.mp4',  'Aktif', 7),
  ('ukuran','Luas',   'Spacious',    'واسع',  'BISINDO untuk Luas.',   'BISINDO sign for Spacious.','عرض BISINDO واسع.', '/videos/Ukuran/luas.mp4',   'Aktif', 8),
  ('ukuran','Tebal',  'Thick',       'سميك',  'BISINDO untuk Tebal.',  'BISINDO sign for Thick.',   'عرض BISINDO سميك.', '/videos/Ukuran/tebal.mp4',  'Aktif', 9),
  ('ukuran','Tipis',  'Thin',        'رفيع',  'BISINDO untuk Tipis.',  'BISINDO sign for Thin.',    'عرض BISINDO رفيع.', '/videos/Ukuran/tipis.mp4',  'Aktif', 10),

  -- WAKTU (4 kata)
  ('waktu','Pagi',  'Morning',   'الصباح',  'BISINDO untuk Pagi.',  'BISINDO sign for Morning.',   'عرض BISINDO الصباح.', '/videos/Waktu/pagi.mp4',  'Aktif', 1),
  ('waktu','Siang', 'Afternoon', 'الظهيرة', 'BISINDO untuk Siang.', 'BISINDO sign for Afternoon.', 'عرض BISINDO الظهيرة.','/videos/Waktu/siang.mp4', 'Aktif', 2),
  ('waktu','Sore',  'Evening',   'المساء',  'BISINDO untuk Sore.',  'BISINDO sign for Evening.',   'عرض BISINDO المساء.', '/videos/Waktu/sore.mp4',  'Aktif', 3),
  ('waktu','Malam', 'Night',     'الليل',   'BISINDO untuk Malam.', 'BISINDO sign for Night.',     'عرض BISINDO الليل.',  '/videos/Waktu/malam.mp4', 'Aktif', 4),

  -- WARNA (8 kata)
  ('warna','Merah',  'Red',    'أحمر',   'BISINDO untuk Merah.',  'BISINDO sign for Red.',    'عرض BISINDO أحمر.',  '/videos/Warna/merah.mp4',  'Aktif', 1),
  ('warna','Biru',   'Blue',   'أزرق',   'BISINDO untuk Biru.',   'BISINDO sign for Blue.',   'عرض BISINDO أزرق.',  '/videos/Warna/biru.mp4',   'Aktif', 2),
  ('warna','Kuning', 'Yellow', 'أصفر',   'BISINDO untuk Kuning.', 'BISINDO sign for Yellow.', 'عرض BISINDO أصفر.',  '/videos/Warna/kuning.mp4', 'Aktif', 3),
  ('warna','Hijau',  'Green',  'أخضر',   'BISINDO untuk Hijau.',  'BISINDO sign for Green.',  'عرض BISINDO أخضر.',  '/videos/Warna/hijau.mp4',  'Aktif', 4),
  ('warna','Ungu',   'Purple', 'بنفسجي', 'BISINDO untuk Ungu.',   'BISINDO sign for Purple.', 'عرض BISINDO بنفسجي.','/videos/Warna/ungu.mp4',   'Aktif', 5),
  ('warna','Coklat', 'Brown',  'بني',    'BISINDO untuk Coklat.', 'BISINDO sign for Brown.',  'عرض BISINDO بني.',   '/videos/Warna/coklat.mp4', 'Aktif', 6),
  ('warna','Hitam',  'Black',  'أسود',   'BISINDO untuk Hitam.',  'BISINDO sign for Black.',  'عرض BISINDO أسود.',  '/videos/Warna/hitam.mp4',  'Aktif', 7),
  ('warna','Putih',  'White',  'أبيض',   'BISINDO untuk Putih.',  'BISINDO sign for White.',  'عرض BISINDO أبيض.',  '/videos/Warna/putih.mp4',  'Aktif', 8)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. QUIZ LEVELS (6 level sesuai QuizContext.jsx)
-- CATATAN: Trigger otomatis mengisi level_number, title, is_default_unlocked
-- ============================================================
INSERT INTO public.quiz_levels (subtitle, min_pass_score)
VALUES
  ('Dasar & Alfabet',    75),
  ('Keluarga & Sapaan',  75),
  ('Waktu & Hari',       75),
  ('Aktivitas Harian',   75),
  ('Emosi & Perasaan',   75),
  ('Kalimat Kompleks',   75)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. QUIZ QUESTIONS (6 soal sesuai initialQuizQuestions)
-- ============================================================
DO $$
DECLARE
  v_level1 BIGINT;
  v_level2 BIGINT;
  v_level3 BIGINT;
BEGIN
  SELECT id INTO v_level1 FROM public.quiz_levels WHERE level_number = 1 LIMIT 1;
  SELECT id INTO v_level2 FROM public.quiz_levels WHERE level_number = 2 LIMIT 1;
  SELECT id INTO v_level3 FROM public.quiz_levels WHERE level_number = 3 LIMIT 1;

  IF v_level1 IS NULL OR v_level2 IS NULL OR v_level3 IS NULL THEN
    RAISE EXCEPTION 'Level kuis tidak ditemukan. Pastikan INSERT quiz_levels berhasil terlebih dahulu.';
  END IF;

  INSERT INTO public.quiz_questions (level_id, question, media_type, media_url, options, correct_answer, explanation, difficulty, points)
  VALUES
    (
      v_level1,
      'Perhatikan video peragaan BISINDO berikut. Kata ganti orang apakah yang sedang diisyaratkan?',
      'video', '/videos/pronomina/aku.mp4',
      '["Aku / Saya", "Kamu", "Mereka", "Dia"]'::jsonb,
      0, 'Gerakan jari telunjuk mengarah ke dada sendiri menunjukkan kata ganti orang pertama tunggal "Aku / Saya" dalam BISINDO.',
      'Mudah', 10
    ),
    (
      v_level1,
      'Amati gerakan tangan pada video berikut. Isyarat tersebut berarti:',
      'video', '/videos/pronomina/kamu.mp4',
      '["Kamu", "Aku", "Kalian", "Ibu"]'::jsonb,
      0, 'Isyarat "Kamu" dilakukan dengan mengarahkan jari telunjuk lurus ke arah lawan bicara.',
      'Mudah', 10
    ),
    (
      v_level2,
      'Perhatikan video isyarat anggota keluarga berikut. Kosakata apakah yang diperagakan?',
      'video', '/videos/Keluarga/kakek.mp4',
      '["Adik Laki-laki", "Kakek", "Nenek", "Anak"]'::jsonb,
      1, 'Video tersebut memperagakan isyarat BISINDO untuk anggota keluarga "Kakek".',
      'Sedang', 15
    ),
    (
      v_level2,
      'Isyarat untuk kata "Ibu" dalam BISINDO diperagakan pada video berikut. Di manakah posisi gerakan tangannya?',
      'video', '/videos/Keluarga/ibu.mp4',
      '["Dahi", "Dagu / Pipi bawah", "Dada", "Bahu"]'::jsonb,
      1, 'Isyarat Ibu dilakukan di area dagu/pipi bagian bawah dengan gerakan lembut seperti pada video.',
      'Mudah', 10
    ),
    (
      v_level2,
      'Amati video peragaan berikut. Isyarat apakah yang ditampilkan untuk anggota keluarga ini?',
      'video', '/videos/Keluarga/bapak.mp4',
      '["Ayah / Bapak", "Kakak Perempuan", "Adik", "Ibu"]'::jsonb,
      0, 'Isyarat Ayah / Bapak dilakukan dengan gerakan di area dahi/wajah bagian atas seperti pada video.',
      'Mudah', 10
    ),
    (
      v_level3,
      'Perhatikan video peragaan waktu berikut. Keterangan waktu apakah yang sedang diisyaratkan?',
      'video', '/videos/Waktu/pagi.mp4',
      '["Pagi", "Siang", "Sore", "Malam"]'::jsonb,
      0, 'Isyarat "Pagi" disimbolkan dengan gerakan tangan yang naik ke atas merepresentasikan matahari terbit.',
      'Sedang', 15
    );

  RAISE NOTICE 'Seed quiz_questions berhasil: 2 soal Level %, 3 soal Level %, 1 soal Level %', v_level1, v_level2, v_level3;
END;
$$;

-- ============================================================
-- VERIFIKASI HASIL SEED
-- ============================================================
SELECT tabel, jumlah FROM (
  SELECT 'categories'    AS tabel, COUNT(*)::INT AS jumlah FROM public.categories    UNION ALL
  SELECT 'vocabularies'  AS tabel, COUNT(*)::INT            FROM public.vocabularies  UNION ALL
  SELECT 'quiz_levels'   AS tabel, COUNT(*)::INT            FROM public.quiz_levels   UNION ALL
  SELECT 'quiz_questions'AS tabel, COUNT(*)::INT            FROM public.quiz_questions
) t ORDER BY tabel;
