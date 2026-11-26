import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  TrendingUp,
  Clock,
  Award,
  Search,
  ChevronDown,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  RefreshCw,
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const PERIOD_OPTIONS = [
  { id: 'month', label: 'Bulan Ini' },
  { id: 'week', label: '7 Hari Terakhir' },
  { id: 'all', label: 'Semua Waktu' },
]

const LEVEL_COLORS = [
  'bg-violet-200',
  'bg-violet-400',
  'bg-violet-500',
  'bg-violet-600',
  'bg-violet-700',
  'bg-violet-800',
]

const AdminAnalisisPage = () => {
  const [periodFilter, setPeriodFilter] = useState('month') // 'week' | 'month' | 'all'
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchStudent, setSearchStudent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [profiles, setProfiles] = useState([])
  const [attempts, setAttempts] = useState([])
  const [progressRows, setProgressRows] = useState([])
  const [quizLevels, setQuizLevels] = useState([])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false)
      return
    }

    try {
      const [profilesRes, attemptsRes, progressRes, levelsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name, email, total_points, streak_days, last_active_at, created_at')
          .eq('role', 'user')
          .order('created_at', { ascending: false }),
        supabase
          .from('quiz_attempts')
          .select('id, user_id, level_id, score, duration_seconds, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('user_quiz_progress')
          .select('user_id, level_id, status, best_score, attempts'),
        supabase
          .from('quiz_levels')
          .select('id, level_number, title, subtitle')
          .order('level_number', { ascending: true }),
      ])

      setProfiles(profilesRes.data || [])
      setAttempts(attemptsRes.data || [])
      setProgressRows(progressRes.data || [])
      setQuizLevels(levelsRes.data || [])
    } catch (err) {
      console.warn('Gagal memuat data analisis pengguna:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const { userStats, levelDistribution, quizPerformance, topStudents } = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const isInPeriod = (isoDate) => {
      if (!isoDate) return false
      const d = new Date(isoDate)
      if (periodFilter === 'week') return d >= sevenDaysAgo
      if (periodFilter === 'month') return d >= startOfMonth
      return true
    }

    const filteredAttempts = attempts.filter((a) => isInPeriod(a.created_at))
    const activeUsers7d = profiles.filter(
      (p) => p.last_active_at && new Date(p.last_active_at) >= sevenDaysAgo
    ).length
    const newUsersInPeriod = profiles.filter((p) => isInPeriod(p.created_at)).length

    const avgDurationMinutes =
      filteredAttempts.length > 0
        ? Math.round(
            filteredAttempts.reduce((sum, a) => sum + (Number(a.duration_seconds) || 60), 0) /
              filteredAttempts.length /
              60
          )
        : 0

    const avgScore =
      filteredAttempts.length > 0
        ? Math.round(
            filteredAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) /
              filteredAttempts.length
          )
        : 0

    const stats = [
      {
        label: 'Total Pengguna',
        value: profiles.length.toLocaleString('id-ID'),
        change: `+${newUsersInPeriod} baru`,
        icon: Users,
        iconBg: 'bg-violet-100 text-violet-600',
      },
      {
        label: 'Pengguna Aktif (7 hari)',
        value: activeUsers7d.toLocaleString('id-ID'),
        change:
          profiles.length > 0
            ? `${Math.round((activeUsers7d / profiles.length) * 100)}% aktif`
            : '0% aktif',
        icon: TrendingUp,
        iconBg: 'bg-emerald-100 text-emerald-600',
      },
      {
        label: 'Rata-rata Durasi Kuis',
        value: `${avgDurationMinutes} min`,
        change: `${filteredAttempts.length} sesi`,
        icon: Clock,
        iconBg: 'bg-blue-100 text-blue-600',
      },
      {
        label: 'Rata-rata Skor Kuis',
        value: `${avgScore}%`,
        change: avgScore >= 75 ? 'Lulus KKM' : filteredAttempts.length ? 'Di bawah KKM' : 'Belum ada',
        icon: Award,
        iconBg: 'bg-purple-100 text-purple-600',
      },
    ]

    // Map level_id -> level_number
    const levelNumberById = {}
    quizLevels.forEach((l) => {
      levelNumberById[l.id] = l.level_number
    })

    // Distribusi Level Pengguna: cari level tertinggi yang terbuka/selesai per user
    const highestLevelPerUser = {}
    progressRows.forEach((row) => {
      if (row.status === 'terkunci') return
      const lvlNum = levelNumberById[row.level_id] || 1
      highestLevelPerUser[row.user_id] = Math.max(highestLevelPerUser[row.user_id] || 1, lvlNum)
    })

    // User yang belum punya record progress dianggap berada di Level 1
    profiles.forEach((p) => {
      if (!highestLevelPerUser[p.id]) {
        highestLevelPerUser[p.id] = 1
      }
    })

    const totalUsersForDist = Math.max(profiles.length, 1)
    const dist = quizLevels.map((lvl, idx) => {
      const count = Object.values(highestLevelPerUser).filter((num) => num === lvl.level_number).length
      const pct = profiles.length > 0 ? Math.round((count / totalUsersForDist) * 100) : 0
      return {
        level: lvl.title || `Level ${lvl.level_number}`,
        count,
        percentage: pct,
        color: LEVEL_COLORS[idx % LEVEL_COLORS.length],
      }
    })

    // Performa Kuis per Level
    const perf = quizLevels.map((lvl) => {
      const lvlAttempts = filteredAttempts.filter((a) => a.level_id === lvl.id)
      const lvlAvg =
        lvlAttempts.length > 0
          ? Math.round(
              lvlAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / lvlAttempts.length
            )
          : 0
      return {
        category: `${lvl.title}: ${lvl.subtitle}`,
        avgScore: lvlAvg,
        totalAttempts: lvlAttempts.length,
      }
    })

    // Siswa Terbaik
    const students = profiles.map((p) => {
      const displayName =
        p.full_name ||
        `${p.first_name || ''} ${p.last_name || ''}`.trim() ||
        p.email?.split('@')[0] ||
        'Siswa'

      const userAttempts = attempts.filter((a) => a.user_id === p.id)
      const userAvgScore =
        userAttempts.length > 0
          ? Math.round(
              userAttempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / userAttempts.length
            )
          : 0
      const highestLvlNum = highestLevelPerUser[p.id] || 1

      return {
        id: p.id,
        name: displayName,
        email: p.email || '',
        score: userAvgScore,
        quizDone: userAttempts.length,
        streak: p.streak_days || 0,
        points: p.total_points || 0,
        level: `Level ${highestLvlNum}`,
      }
    })

    students.sort((a, b) => b.score - a.score || b.quizDone - a.quizDone || b.points - a.points)

    const queryLower = searchStudent.trim().toLowerCase()
    const filteredStudents = queryLower
      ? students.filter(
          (s) =>
            s.name.toLowerCase().includes(queryLower) ||
            s.email.toLowerCase().includes(queryLower)
        )
      : students

    return {
      userStats: stats,
      levelDistribution: dist,
      quizPerformance: perf,
      topStudents: filteredStudents,
    }
  }, [profiles, attempts, progressRows, quizLevels, periodFilter, searchStudent])

  const activePeriodLabel =
    PERIOD_OPTIONS.find((p) => p.id === periodFilter)?.label || 'Bulan Ini'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Analisis Pengguna
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Data dan statistik perilaku belajar pengguna langsung dari database Isyaratku.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAnalyticsData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3.5 py-2 rounded-full hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Memuat...' : 'Refresh'}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 px-4 py-2 rounded-full hover:bg-violet-100 transition-colors"
            >
              <span>{activePeriodLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-lg py-1.5 z-20">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setPeriodFilter(opt.id)
                      setIsFilterOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                      periodFilter === opt.id
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {userStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Middle Row: Level Distribution + Quiz Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Distribution */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            <h3 className="text-lg font-bold text-gray-900">Distribusi Level Pengguna</h3>
          </div>
          {levelDistribution.length > 0 ? (
            <div className="space-y-3">
              {levelDistribution.map((lvl) => (
                <div key={lvl.level} className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-gray-600 w-16 flex-shrink-0">
                    {lvl.level}
                  </span>
                  <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full ${lvl.color} rounded-lg transition-all duration-500 flex items-center`}
                      style={{ width: `${lvl.percentage}%` }}
                    />
                  </div>
                  <div className="text-right flex-shrink-0 w-20">
                    <span className="text-xs font-bold text-gray-900">{lvl.count}</span>
                    <span className="text-[11px] text-gray-400 ml-1">({lvl.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">
              Belum ada data level kuis di database.
            </p>
          )}
        </div>

        {/* Quiz Performance by Level */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Performa Kuis per Level</h3>
          </div>
          {quizPerformance.length > 0 ? (
            <div className="space-y-3">
              {quizPerformance.map((quiz) => (
                <div
                  key={quiz.category}
                  className="p-3 rounded-xl border border-gray-50 hover:border-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{quiz.category}</span>
                    <span className="text-xs font-bold text-violet-600">{quiz.avgScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        quiz.avgScore >= 80
                          ? 'bg-emerald-500'
                          : quiz.avgScore >= 70
                          ? 'bg-violet-500'
                          : quiz.avgScore > 0
                          ? 'bg-amber-500'
                          : 'bg-gray-200'
                      }`}
                      style={{ width: `${quiz.avgScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {quiz.totalAttempts.toLocaleString('id-ID')} total percobaan ({activePeriodLabel})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">
              Belum ada data performa kuis.
            </p>
          )}
        </div>
      </div>

      {/* Bottom: Top Students Leaderboard */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900">Siswa Terbaik</h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="Cari nama atau email siswa..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </div>
        </div>

        {topStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Skor Rata-rata
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Kuis Dikerjakan
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Streak
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-700'
                            : idx === 1
                            ? 'bg-gray-200 text-gray-600'
                            : idx === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 block">{student.name}</span>
                          <span className="text-[11px] text-gray-400">{student.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-bold text-gray-900">{student.score}%</span>
                    </td>
                    <td className="py-3 px-2 text-gray-500">{student.quizDone} kuis</td>
                    <td className="py-3 px-2">
                      <span className="text-xs font-semibold text-orange-600">
                        🔥 {student.streak} hari
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full">
                        {student.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            {isLoading ? 'Memuat data siswa...' : 'Belum ada data siswa yang cocok.'}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAnalisisPage
