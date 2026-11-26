import { useState } from 'react'
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  BarChart2,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuthModal } from '@/context/AuthContext'
import { useUserTheme } from '@/hooks/useUserTheme'
import ConfirmModal from '@/components/common/ConfirmModal'

const navItems = [
  { to: '/app/kamus', label: 'Kamus', icon: BookOpen },
  { to: '/app/kuis', label: 'Kuis', icon: HelpCircle },
  { to: '/app/progres', label: 'Progres Saya', icon: BarChart2 },
  { to: '/app/profil', label: 'Profil', icon: User },
]

const UserPortalLayout = () => {
  const { logout, user } = useAuthModal()
  const { isDark, toggleTheme } = useUserTheme()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // RBAC: Hanya role 'user' yang boleh mengakses Portal User
  if (!user) {
    return <Navigate to="/" replace />
  }
  if (user.dbRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
    setShowLogoutConfirm(false)
    navigate('/', { replace: true })
  }

  return (
    <div className="user-theme-shell min-h-screen bg-gray-50/40 flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-100 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-violet-600" />
                <span className="font-extrabold text-xl text-gray-900 tracking-tight">
                  Isyaratku
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 ml-8 font-medium">
                Belajar BISINDO
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-violet-600 font-semibold bg-violet-50/70'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 transition-colors ${
                          isActive ? 'text-violet-600' : 'text-gray-400'
                        }`}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute right-0 top-2 bottom-2 w-1 bg-violet-600 rounded-l-full" />
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* User Badge in Sidebar Footer */}
        <div className="p-4 m-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.name || 'Andi Pratama'}
            </p>
            <p className="text-xs text-violet-600 font-medium truncate">
              {user?.role || 'Siswa Terdaftar'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm sm:text-base font-semibold text-gray-800">
              Portal Belajar
            </h1>
          </div>

          {/* Right Actions: Theme, Notifications, Help, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-violet-600 hover:bg-gray-100 transition-colors"
              title={isDark ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              aria-label={isDark ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                title="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full" />
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-40">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-900">Notifikasi Belajar</h4>
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-[11px] text-gray-400 hover:text-gray-600"
                    >
                      Tutup
                    </button>
                  </div>
                  <div className="space-y-2 text-xs text-gray-600">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotifOpen(false)
                        navigate('/app/kuis')
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-gray-50 hover:bg-violet-50 transition-colors"
                    >
                      <p className="font-semibold text-gray-900">Lanjutkan Kuis BISINDO</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Raih skor minimal 75 untuk membuka level kuis berikutnya.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotifOpen(false)
                        navigate('/app/progres')
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-gray-50 hover:bg-violet-50 transition-colors"
                    >
                      <p className="font-semibold text-gray-900">Cek Progres & Pencapaian</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Lihat grafik aktivitas mingguan dan lencana pencapaian Anda.
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              title="Pusat Bantuan"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <div className="h-5 w-px bg-gray-200 mx-1" />

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-red-700 hover:bg-red-800 text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Modal Pusat Bantuan */}
        {isHelpOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsHelpOpen(false)
            }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Pusat Bantuan Isyaratku</h3>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-gray-600">
                <div className="p-3 rounded-2xl bg-gray-50">
                  <p className="font-bold text-gray-900">1. Kamus Digital (3 Bahasa)</p>
                  <p className="mt-0.5">
                    Pilih bahasa Indonesia, English, atau العربية untuk mencari kosakata BISINDO dan memutar video peragaannya.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50">
                  <p className="font-bold text-gray-900">2. Kuis Bertahap (KKM 75)</p>
                  <p className="mt-0.5">
                    Selesaikan setiap level dengan nilai minimal 75 untuk membuka level berikutnya secara otomatis.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50">
                  <p className="font-bold text-gray-900">3. Progres & Pencapaian</p>
                  <p className="mt-0.5">
                    Pantau aktivitas belajar mingguan dan buka seluruh lencana pencapaian Anda.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsHelpOpen(false)
                    navigate('/tutorial')
                  }}
                  className="px-4 py-2 text-xs font-semibold text-violet-600 hover:bg-violet-50 rounded-xl"
                >
                  Buka Halaman Tutorial
                </button>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-violet-600 text-white rounded-xl hover:bg-violet-700"
                >
                  Mengerti
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_-6px_rgba(0,0,0,0.08)]">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors min-w-[64px] ${
                    isActive
                      ? 'text-violet-600 bg-violet-50/80'
                      : 'text-gray-500 hover:text-gray-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
                    <span className="truncate">{item.label === 'Progres Saya' ? 'Progres' : item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
        <ConfirmModal
          isOpen={showLogoutConfirm}
          title="Konfirmasi Keluar"
          message="Apakah Anda yakin ingin keluar dari Portal Belajar?"
          confirmLabel="Ya, Keluar"
          cancelLabel="Batal"
          variant="danger"
          isLoading={isLoggingOut}
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </div>
    </div>
  )
}

export default UserPortalLayout
