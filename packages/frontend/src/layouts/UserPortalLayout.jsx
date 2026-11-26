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

  // RBAC: Hanya role 'user' yang boleh mengakses Portal User
  if (!user) {
    return <Navigate to="/" replace />
  }
  if (user.dbRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/')
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
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              title="Pusat Bantuan"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <div className="h-5 w-px bg-gray-200 mx-1" />

            <button
              type="button"
              onClick={handleLogout}
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
      </div>
    </div>
  )
}

export default UserPortalLayout
