import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  BarChart3,
  Activity,
  RefreshCw,
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useDictionary } from '@/context/DictionaryContext'

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const ORDERED_DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const formatRelativeTime = (isoDate) => {
  if (!isoDate) return '-'
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  return new Date(isoDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { categories, vocabularies } = useDictionary()

  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [attempts, setAttempts] = useState([])
  const [vocabHistory, setVocabHistory] = useState([])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false)
      return
    }

    try {
      const [usersRes, attemptsRes, historyRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name, email, role, created_at, last_active_at')
          .eq('role', 'user')
          .order('created_at', { ascending: false }),
        supabase
          .from('quiz_attempts')
          .select('id, user_id, score, duration_seconds, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('user_vocabulary_history')
          .select('vocabulary_id, watched_count, last_watched_at'),
      ])

      setUsers(usersRes.data || [])
      setAttempts(attemptsRes.data || [])
      setVocabHistory(historyRes.data || [])
    } catch (err) {
      console.warn('Gagal memuat data dashboard admin:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const { statCards, weeklyActivity, popularCategories, recentUsers } = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = getStartOfWeek(now)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const newUsersThisMonth = users.filter(
      (u) => u.created_at && new Date(u.created_at) >= startOfMonth
    ).length

    const activeVocabCount = vocabularies.filter((v) => v.status === 'Aktif').length

    const weeklyAttemptsCount = attempts.filter(
      (a) => a.created_at && new Date(a.created_at) >= startOfWeek
    ).length

    const avgScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + (Number(a.score) || 0), 0) / attempts.length
          )
        : 0

    const scoreBadge =
      attempts.length === 0
        ? 'Belum ada data'
        : avgScore >= 85
        ? 'Sangat Baik'
        : avgScore >= 75
        ? 'Predikat Baik'
        : 'Perlu Ditingkatkan'

    const cards = [
      {
        label: 'Total Pengguna',
        value: users.length.toLocaleString('id-ID'),
        change: `+${newUsersThisMonth} bulan ini`,
        changeBg: 'bg-emerald-50 text-emerald-700',
        icon: Users,
        iconBg: 'bg-violet-100 text-violet-600',
      },
      {
        label: 'Kosakata Tersedia',
        value: activeVocabCount.toLocaleString('id-ID'),
        change: `${categories.length} kategori`,
        changeBg: 'bg-blue-50 text-blue-700',
        icon: BookOpen,
        iconBg: 'bg-blue-100 text-blue-600',
      },
      {
        label: 'Total Kuis Dikerjakan',
        value: attempts.length.toLocaleString('id-ID'),
        change: `+${weeklyAttemptsCount} minggu ini`,
        changeBg: 'bg-emerald-50 text-emerald-700',
        icon: HelpCircle,
        iconBg: 'bg-purple-100 text-purple-600',
      },
      {
        label: 'Rata-rata Skor Kuis',
        value: `${avgScore}%`,
        change: scoreBadge,
        changeBg: 'bg-amber-50 text-amber-700',
        icon: TrendingUp,
        iconBg: 'bg-rose-100 text-rose-600',
      },
    ]

    // Aktivitas Mingguan (Sen - Min)
    const countByDay = { Sen: 0, Sel: 0, Rab: 0, Kam: 0, Jum: 0, Sab: 0, Min: 0 }
    attempts.forEach((a) => {
      if (!a.created_at || new Date(a.created_at) < startOfWeek) return
      const dayName = DAY_LABELS[new Date(a.created_at).getDay()]
      if (countByDay[dayName] !== undefined) countByDay[dayName] += 1
    })
    vocabHistory.forEach((v) => {
      if (!v.last_watched_at || new Date(v.last_watched_at) < startOfWeek) return
      const dayName = DAY_LABELS[new Date(v.last_watched_at).getDay()]
      if (countByDay[dayName] !== undefined) countByDay[dayName] += 1
    })

    const maxActivity = Math.max(...Object.values(countByDay), 0)
    const weeklyData = ORDERED_DAYS.map((day) => {
      const count = countByDay[day]
      const pct = maxActivity > 0 ? Math.max(count > 0 ? 15 : 6, Math.round((count / maxActivity) * 100)) : 6
      return {
        day,
        value: count,
        height: pct,
        isMax: maxActivity > 0 && count === maxActivity,
      }
    })

    // Kategori Populer (gabungan jumlah tayangan video & jumlah kosakata per kategori)
    const viewsByVocabId = {}
    vocabHistory.forEach((h) => {
      viewsByVocabId[h.vocabulary_id] = (viewsByVocabId[h.vocabulary_id] || 0) + (h.watched_count || 1)
    })

    const catStats = categories.map((cat) => {
      const catVocabs = vocabularies.filter(
        (v) => v.category === cat.title || v.categoryId === cat.id
      )
      const watchSum = catVocabs.reduce((sum, v) => sum + (viewsByVocabId[v.id] || 0), 0)
      return {
        name: cat.title,
        vocabCount: catVocabs.length,
        views: watchSum > 0 ? watchSum : catVocabs.length,
        hasRealViews: watchSum > 0,
      }
    })

    catStats.sort((a, b) => b.views - a.views)
    const topCats = catStats.slice(0, 5)
    const maxCatVal = Math.max(...topCats.map((c) => c.views), 1)
    const popCats = topCats.map((c) => ({
      ...c,
      percentage: Math.round((c.views / maxCatVal) * 100),
    }))

    // Pengguna Terbaru (5 terakhir)
    const recent = users.slice(0, 5).map((u) => {
      const displayName =
        u.full_name ||
        `${u.first_name || ''} ${u.last_name || ''}`.trim() ||
        u.email?.split('@')[0] ||
        'Pengguna'
      const isActive = u.last_active_at && new Date(u.last_active_at) >= sevenDaysAgo
      return {
        id: u.id,
        name: displayName,
        email: u.email,
        joined: formatRelativeTime(u.created_at),
        status: isActive ? 'Aktif' : 'Nonaktif',
      }
    })

    return {
      statCards: cards,
      weeklyActivity: weeklyData,
      popularCategories: popCats,
      recentUsers: recent,
    }
  }, [users, attempts, vocabHistory, categories, vocabularies])

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ringkasan statistik dan aktivitas terkini dari database Isyaratku.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl shadow-sm transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Memuat...' : 'Muat Ulang Data'}</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-black text-gray-900">{card.value}</p>
              <div className="flex items-center justify-between mt-2 gap-2">
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${card.changeBg}`}
                >
                  {card.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Middle Row: Weekly Activity + Popular Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-bold text-gray-900">Aktivitas Mingguan</h3>
            </div>
            <span className="text-xs font-semibold text-gray-400">Minggu ini (sesi kuis & kamus)</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 px-2 pb-2 border-b border-gray-100">
            {weeklyActivity.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                {item.isMax && (
                  <span className="text-[11px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                    {item.value}
                  </span>
                )}
                <div className="w-full max-w-[40px] bg-gray-100 h-36 rounded-xl overflow-hidden flex items-end">
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      item.isMax
                        ? 'bg-violet-600 shadow-md shadow-violet-600/30'
                        : item.value > 0
                        ? 'bg-violet-300 group-hover:bg-violet-400'
                        : 'bg-gray-200'
                    }`}
                    style={{ height: `${item.height}%` }}
                    title={`${item.day}: ${item.value} aktivitas`}
                  />
                </div>
                <span
                  className={`text-xs font-semibold ${
                    item.isMax ? 'text-violet-600 font-bold' : 'text-gray-400'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Categories (Span 1) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Kategori Teratas</h3>
            </div>
          </div>
          <div className="space-y-4">
            {popularCategories.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  <span className="text-xs font-bold text-gray-500">
                    {cat.hasRealViews ? `${cat.views.toLocaleString('id-ID')} views` : `${cat.vocabCount} kata`}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Users */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Pengguna Terbaru</h3>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/analisis')}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700"
          >
            Lihat Semua →
          </button>
        </div>

        {recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Bergabung
                  </th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-500">{u.email}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{u.joined}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          u.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            {isLoading ? 'Memuat data pengguna...' : 'Belum ada pengguna terdaftar.'}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
