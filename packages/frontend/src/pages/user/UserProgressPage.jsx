import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Award, Flame, Play, Lock, ChevronDown, CheckCircle2, X } from 'lucide-react'
import { useQuiz } from '@/context/QuizContext'
import { useAuth } from '@/context/AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const ORDERED_DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const FILTER_OPTIONS = [
  { id: 'week', label: 'Minggu Ini' },
  { id: 'month', label: 'Bulan Ini' },
  { id: 'all', label: 'Semua Waktu' },
]

const levelEmojis = {
  1: '👋',
  2: '👥',
  3: '⏰',
  4: '🏃',
  5: '😊',
  6: '💬',
}

const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Senin sebagai awal minggu
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const UserProgressPage = () => {
  const { levels, questions } = useQuiz()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [refreshTick, setRefreshTick] = useState(0)
  const [activityFilter, setActivityFilter] = useState('week') // 'week' | 'month' | 'all'
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [attemptLogs, setAttemptLogs] = useState([])
  const [vocabHistoryCount, setVocabHistoryCount] = useState(0)
  const [vocabLogs, setVocabLogs] = useState([])

  // Auto-refresh saat ada perubahan data kuis
  useEffect(() => {
    const handleUpdate = () => setRefreshTick((t) => t + 1)
    window.addEventListener('isyaratku_quiz_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('isyaratku_quiz_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Muat aktivitas belajar & histori kuis dari Supabase (dengan fallback localStorage)
  useEffect(() => {
    let isMounted = true

    const loadActivityFromLocal = () => {
      try {
        const raw = localStorage.getItem('isyaratku_quiz_activity')
        return raw ? JSON.parse(raw) : []
      } catch {
        return []
      }
    }

    const fetchUserActivity = async () => {
      const localLogs = loadActivityFromLocal()

      if (!isSupabaseConfigured || !supabase || !user?.id) {
        if (isMounted) {
          setAttemptLogs(localLogs)
          setVocabLogs([])
          setVocabHistoryCount(0)
        }
        return
      }

      try {
        const [attemptsRes, vocabRes] = await Promise.all([
          supabase
            .from('quiz_attempts')
            .select('id, level_id, score, total_questions, duration_seconds, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('user_vocabulary_history')
            .select('id, watched_count, last_watched_at')
            .eq('user_id', user.id),
        ])

        if (!isMounted) return

        const dbAttempts = (attemptsRes.data || []).map((a) => ({
          id: a.id,
          levelId: a.level_id,
          score: a.score,
          totalQuestions: a.total_questions,
          durationSeconds: a.duration_seconds || Math.max(60, (a.total_questions || 2) * 30),
          createdAt: a.created_at,
        }))

        const dbVocabs = (vocabRes.data || []).map((v) => ({
          id: v.id,
          watchedCount: v.watched_count || 1,
          createdAt: v.last_watched_at,
        }))

        setAttemptLogs(dbAttempts.length > 0 ? dbAttempts : localLogs)
        setVocabLogs(dbVocabs)
        setVocabHistoryCount(dbVocabs.length)
      } catch (err) {
        console.warn('Gagal memuat aktivitas mingguan dari Supabase:', err)
        if (isMounted) {
          setAttemptLogs(localLogs)
        }
      }
    }

    fetchUserActivity()
    return () => {
      isMounted = false
    }
  }, [user?.id, refreshTick])

  // 1. Filter level yang sedang atau sudah dikerjakan
  const activeOrCompletedLevels = levels.filter(
    (l) => l.status === 'selesai' || l.status === 'lanjut' || !l.locked || l.score
  )

  // 2. Hitung Rata-rata Kuis dari level yang sudah memiliki skor
  const scoredLevels = levels.filter((l) => l.score || l.status === 'selesai')
  const avgScore =
    scoredLevels.length > 0
      ? Math.round(
          scoredLevels.reduce((acc, l) => {
            const parsed = parseInt(String(l.score).match(/\d+/)?.[0] || '0', 10)
            return acc + (l.status === 'selesai' && parsed < 75 ? 100 : parsed)
          }, 0) / scoredLevels.length
        )
      : 0

  // 3. Hitung Soal / Kosakata Dikuasai
  const completedLevels = levels.filter((l) => l.status === 'selesai')
  const wordsMasteredFromQuiz = completedLevels.reduce((acc, lvl) => {
    const count = questions.filter((q) => q.levelId === lvl.id).length
    return acc + (count > 0 ? count : 5)
  }, 0)
  const wordsMastered = wordsMasteredFromQuiz + vocabHistoryCount

  // 4. Hitung Aktivitas Mingguan sesuai filter ('week' | 'month' | 'all')
  const { weeklyActivity, totalMinutesInFilter } = useMemo(() => {
    const now = new Date()
    const startOfWeek = getStartOfWeek(now)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const minutesByDay = {
      Sen: 0,
      Sel: 0,
      Rab: 0,
      Kam: 0,
      Jum: 0,
      Sab: 0,
      Min: 0,
    }

    const isInPeriod = (isoDate) => {
      if (!isoDate) return false
      const d = new Date(isoDate)
      if (Number.isNaN(d.getTime())) return false
      if (activityFilter === 'week') return d >= startOfWeek
      if (activityFilter === 'month') return d >= startOfMonth
      return true
    }

    attemptLogs.forEach((log) => {
      if (!isInPeriod(log.createdAt)) return
      const dayName = DAY_LABELS[new Date(log.createdAt).getDay()]
      const mins = Math.max(1, Math.round((log.durationSeconds || 60) / 60))
      if (minutesByDay[dayName] !== undefined) {
        minutesByDay[dayName] += mins
      }
    })

    vocabLogs.forEach((log) => {
      if (!isInPeriod(log.createdAt)) return
      const dayName = DAY_LABELS[new Date(log.createdAt).getDay()]
      const mins = Math.max(1, Number(log.watchedCount) || 1)
      if (minutesByDay[dayName] !== undefined) {
        minutesByDay[dayName] += mins
      }
    })

    const maxMinutes = Math.max(...Object.values(minutesByDay), 0)
    const totalMins = Object.values(minutesByDay).reduce((sum, m) => sum + m, 0)

    const chartData = ORDERED_DAYS.map((day) => {
      const mins = minutesByDay[day]
      const pct = maxMinutes > 0 ? Math.max(mins > 0 ? 14 : 6, Math.round((mins / maxMinutes) * 100)) : 6
      return {
        day,
        rawMinutes: mins,
        minutes: `${mins}m`,
        height: `${pct}%`,
        active: maxMinutes > 0 && mins === maxMinutes,
      }
    })

    return { weeklyActivity: chartData, totalMinutesInFilter: totalMins }
  }, [attemptLogs, vocabLogs, activityFilter])

  // 5. Hitung Pencapaian (Achievements) secara dinamis dari database
  const achievements = useMemo(() => {
    const bestLevelScore = levels.reduce((max, l) => {
      const parsed = parseInt(String(l.score).match(/\d+/)?.[0] || '0', 10)
      return Math.max(max, parsed)
    }, 0)
    const bestAttemptScore = attemptLogs.reduce((max, a) => Math.max(max, Number(a.score) || 0), 0)
    const highestScoreOverall = Math.max(bestLevelScore, bestAttemptScore)
    const totalQuizSessions = Math.max(attemptLogs.length, scoredLevels.length)

    const list = [
      {
        id: 'first-step',
        title: 'Langkah Pertama',
        desc: 'Selesaikan 1 level kuis BISINDO',
        progressText: `${Math.min(completedLevels.length, 1)}/1 level`,
        unlocked: completedLevels.length >= 1,
        iconBg: 'bg-purple-100 text-purple-600',
      },
      {
        id: 'pemula-handal',
        title: 'Pemula Handal',
        desc: 'Selesaikan 3 level kuis',
        progressText: `${Math.min(completedLevels.length, 3)}/3 level`,
        unlocked: completedLevels.length >= 3,
        iconBg: 'bg-emerald-100 text-emerald-600',
      },
      {
        id: 'skor-tinggi',
        title: 'Skor Gemilang',
        desc: 'Raih nilai kuis minimal 90',
        progressText: `${Math.min(highestScoreOverall, 90)}/90 poin`,
        unlocked: highestScoreOverall >= 90,
        iconBg: 'bg-amber-100 text-amber-600',
      },
      {
        id: 'rajin-kuis',
        title: 'Pembelajar Aktif',
        desc: 'Selesaikan 5 kali latihan kuis',
        progressText: `${Math.min(totalQuizSessions, 5)}/5 sesi`,
        unlocked: totalQuizSessions >= 5,
        iconBg: 'bg-rose-100 text-rose-600',
      },
      {
        id: 'kolektor-kata',
        title: 'Ahli Kosakata',
        desc: 'Kuasai 20 kosakata BISINDO',
        progressText: `${Math.min(wordsMastered, 20)}/20 kata`,
        unlocked: wordsMastered >= 20,
        iconBg: 'bg-blue-100 text-blue-600',
      },
      {
        id: 'master-bisindo',
        title: 'Master BISINDO',
        desc: `Tamatkan seluruh ${levels.length} level kuis`,
        progressText: `${completedLevels.length}/${levels.length} level`,
        unlocked: levels.length > 0 && completedLevels.length >= levels.length,
        iconBg: 'bg-violet-100 text-violet-600',
      },
    ]

    // Urutkan yang sudah terbuka terlebih dahulu
    return list.sort((a, b) => Number(b.unlocked) - Number(a.unlocked))
  }, [completedLevels.length, levels, attemptLogs, scoredLevels.length, wordsMastered])

  const activeFilterLabel =
    FILTER_OPTIONS.find((f) => f.id === activityFilter)?.label || 'Minggu Ini'

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Progres Saya
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Lacak perkembangan belajar BISINDO dan hasil level kuis Anda.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Kata Dikuasai */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-gray-500">Kata Dikuasai</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900">{wordsMastered}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {completedLevels.length} Level Selesai
            </span>
          </div>
        </div>

        {/* Card 2: Rata-rata Kuis */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-gray-500">Rata-rata Kuis</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900">{avgScore}%</span>
            <span
              className={`text-xs font-medium ${
                avgScore >= 75 ? 'text-emerald-600' : avgScore > 0 ? 'text-amber-600' : 'text-gray-400'
              }`}
            >
              {avgScore >= 85
                ? 'Predikat Sangat Baik'
                : avgScore >= 75
                ? 'Lulus KKM (≥ 75%)'
                : avgScore > 0
                ? 'Perlu Peningkatan'
                : 'Belum Ada Kuis'}
            </span>
          </div>
        </div>

        {/* Card 3: Hari Beruntun */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-gray-500">Level Terbuka</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900">
              {levels.filter((l) => !l.locked).length}
            </span>
            <span className="text-xs font-medium text-gray-500">
              dari {levels.length} Level
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Aktivitas Mingguan & Pencapaian */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aktivitas Mingguan (Span 2) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Aktivitas Mingguan</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Total durasi belajar ({activeFilterLabel}):{' '}
                <strong className="text-gray-700">{totalMinutesInFilter} menit</strong>
              </p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 px-3.5 py-1.5 rounded-full transition-colors"
              >
                <span>{activeFilterLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-lg py-1.5 z-20">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setActivityFilter(opt.id)
                        setIsFilterOpen(false)
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors ${
                        activityFilter === opt.id
                          ? 'bg-violet-50 text-violet-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-4 pb-2 border-b border-gray-100">
            {weeklyActivity.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                {item.active ? (
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                    {item.minutes}
                  </span>
                ) : item.rawMinutes > 0 ? (
                  <span className="text-[11px] font-semibold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.minutes}
                  </span>
                ) : null}
                <div className="w-full max-w-[36px] bg-gray-100 h-32 rounded-xl overflow-hidden flex items-end">
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      item.active
                        ? 'bg-violet-600 shadow-md shadow-violet-600/30'
                        : item.rawMinutes > 0
                        ? 'bg-violet-300 group-hover:bg-violet-400'
                        : 'bg-gray-200'
                    }`}
                    style={{ height: item.height }}
                    title={`${item.day}: ${item.minutes}`}
                  />
                </div>
                <span
                  className={`text-xs font-semibold ${
                    item.active ? 'text-violet-600 font-bold' : 'text-gray-400'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
          {totalMinutesInFilter === 0 && (
            <p className="text-[11px] text-gray-400 text-center mt-3">
              Belum ada aktivitas belajar pada periode {activeFilterLabel.toLowerCase()}. Kerjakan kuis atau pelajari kosakata untuk mencatat aktivitas.
            </p>
          )}
        </div>

        {/* Pencapaian Card (Span 1) */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Pencapaian</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {achievements.filter((a) => a.unlocked).length} dari {achievements.length} terbuka
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAllAchievements(true)}
              className="text-xs font-semibold text-violet-600 hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-4">
            {achievements.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3.5 p-3 rounded-2xl border border-gray-50 hover:border-gray-100 transition-colors"
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    item.unlocked ? item.iconBg : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {item.unlocked ? (
                    <Award className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                      {item.progressText}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Materi Sedang Dipelajari (Sinkron dengan Level Kuis) */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Materi Kuis yang Sedang & Sudah Dikerjakan
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Sinkron otomatis dengan progres pengerjaan level kuis Anda.
            </p>
          </div>
          <button
            onClick={() => navigate('/app/kuis')}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1"
          >
            <span>Buka Semua Level</span>
          </button>
        </div>

        <div className="space-y-4">
          {activeOrCompletedLevels.length > 0 ? (
            activeOrCompletedLevels.map((lvl) => {
              const scoreNum = parseInt(String(lvl.score).match(/\d+/)?.[0] || '0', 10)
              const percent =
                lvl.status === 'selesai'
                  ? 100
                  : Math.max(lvl.progress || 0, scoreNum)

              return (
                <div
                  key={lvl.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 hover:border-violet-200 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 text-xl">
                      <span>{levelEmojis[lvl.levelNumber || lvl.id] || '📚'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">
                            {lvl.title}: {lvl.subtitle}
                          </h4>
                          {lvl.status === 'selesai' && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Lulus
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-600">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            lvl.status === 'selesai'
                              ? 'bg-emerald-500'
                              : 'bg-violet-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {lvl.status === 'selesai'
                          ? `Level Selesai • Skor Tertinggi: ${lvl.score || '100/100'}`
                          : lvl.score
                          ? `Skor Tertinggi: ${lvl.score} • Nilai di bawah KKM (75)`
                          : 'Sedang dipelajari / Level Terbuka'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/app/kuis')}
                    className="w-10 h-10 rounded-full border border-gray-200 hover:bg-violet-600 hover:border-violet-600 hover:text-white flex items-center justify-center text-gray-600 transition-colors self-end sm:self-center shrink-0"
                    title={`Kerjakan ${lvl.title}`}
                  >
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  </button>
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center text-gray-400">
              <p className="text-sm">Belum ada level kuis yang dikerjakan.</p>
              <button
                onClick={() => navigate('/app/kuis')}
                className="mt-3 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700"
              >
                Mulai Kuis Level 1
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Lihat Semua Pencapaian */}
      {showAllAchievements && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAllAchievements(false)
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Semua Pencapaian</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {achievements.filter((a) => a.unlocked).length} dari {achievements.length} pencapaian berhasil dibuka
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllAchievements(false)}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {achievements.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                    item.unlocked
                      ? 'border-violet-100 bg-violet-50/30'
                      : 'border-gray-100 bg-gray-50/50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      item.unlocked ? item.iconBg : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {item.unlocked ? (
                      <Award className="w-6 h-6" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.unlocked
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {item.unlocked ? 'Tercapai' : item.progressText}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProgressPage
