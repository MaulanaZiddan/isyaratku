import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom'
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  FolderPlus,
  HelpCircle,
  Users,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  UserCircle,
} from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import ConfirmModal from '@/components/common/ConfirmModal'

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/kamus', label: 'Kamus', icon: BookOpen },
  { to: '/admin/kategori', label: 'Tambah Kategori', icon: FolderPlus },
  { to: '/admin/kuis', label: 'Tambah Kuis', icon: HelpCircle },
  { to: '/admin/analisis', label: 'Analisis Pengguna', icon: Users },
  { to: '/admin/pengaturan', label: 'Pengaturan', icon: Settings },
]

const AdminLayout = () => {
  const { admin, isAdminLoggedIn, logoutAdmin } = useAdminAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // Terapkan tema gelap / terang / sistem pada Admin Panel
  useEffect(() => {
    const applyAdminTheme = () => {
      try {
        const saved = localStorage.getItem('isyaratku_admin_prefs')
        const prefs = saved ? JSON.parse(saved) : {}
        const theme = prefs.theme || 'light'
        const isDark =
          theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.classList.toggle('dark', isDark)
      } catch {
        document.documentElement.classList.remove('dark')
      }
    }

    applyAdminTheme()
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', applyAdminTheme)
    window.addEventListener('isyaratku_admin_theme_changed', applyAdminTheme)

    return () => {
      media.removeEventListener('change', applyAdminTheme)
      window.removeEventListener('isyaratku_admin_theme_changed', applyAdminTheme)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Redirect to login if not authenticated or not admin role
  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />
  }

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false)
    document.documentElement.classList.remove('dark')
    await logoutAdmin()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell min-h-screen bg-gray-50/40 flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-60 bg-white border-r border-gray-100 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-violet-600" />
                <span className="font-extrabold text-lg text-gray-900 tracking-tight">
                  Isyaratku
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 ml-8 font-medium tracking-wide">
                Admin Panel
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
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'text-violet-600 font-semibold bg-violet-50/70'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-[18px] h-[18px] transition-colors ${
                          isActive ? 'text-violet-600' : 'text-gray-400'
                        }`}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute right-0 top-1.5 bottom-1.5 w-1 bg-violet-600 rounded-l-full" />
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Admin Badge in Sidebar Footer */}
        <div className="p-3 m-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
            {admin?.name ? admin.name.charAt(0) : 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 truncate">
              {admin?.name || 'Administrator'}
            </p>
            <p className="text-[11px] text-violet-600 font-medium truncate">
              {admin?.role || 'Admin'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
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
                    <h4 className="text-xs font-bold text-gray-900">Notifikasi Admin</h4>
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
                        navigate('/admin/analisis')
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-gray-50 hover:bg-violet-50 transition-colors"
                    >
                      <p className="font-semibold text-gray-900">Pantau Aktivitas Siswa</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Lihat statistik terbaru pengguna & hasil kuis di Analisis Pengguna.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotifOpen(false)
                        navigate('/admin/pengaturan')
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-gray-50 hover:bg-violet-50 transition-colors"
                    >
                      <p className="font-semibold text-gray-900">Pengaturan Sistem</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Atur tema gelap/terang, bahasa, dan kata sandi admin.
                      </p>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/pengaturan')}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              title="Profil Admin"
            >
              <UserCircle className="w-5 h-5" />
            </button>

            <div className="h-5 w-px bg-gray-200 mx-1" />

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="bg-red-700 hover:bg-red-800 text-white px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Modal Konfirmasi Keluar Admin */}
        <ConfirmModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
          title="Konfirmasi Keluar Admin"
          message="Apakah Anda yakin ingin keluar dari Panel Admin Isyaratku?"
          confirmText="Ya, Keluar"
          cancelText="Batal"
          variant="danger"
        />
      </div>
    </div>
  )
}

export default AdminLayout
