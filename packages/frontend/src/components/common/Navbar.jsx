import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, Menu, X, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react'
import { useAuthModal } from '@/context/AuthContext'
import { useUserTheme } from '@/hooks/useUserTheme'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { openLogin, openRegister, isLoggedIn, logout, user } = useAuthModal()
  const { isDark, toggleTheme } = useUserTheme()

  const toggleMenu = () => setIsOpen((prev) => !prev)

  const isKamusActive = location.pathname === '/kamus' || location.pathname === '/app/kamus'
  const isKuisActive = location.pathname === '/kuis' || location.pathname === '/app/kuis'
  const isTutorialActive = location.pathname === '/tutorial'

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-600" />
            <span className="font-bold text-xl text-gray-900">Isyaratku</span>
          </Link>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 h-full">
            <Link
              to={isLoggedIn ? '/app/kamus' : '/kamus'}
              className={`h-full flex items-center text-sm transition-colors border-b-2 ${
                isKamusActive
                  ? 'border-violet-600 text-violet-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-violet-600 font-medium'
              }`}
            >
              Kamus
            </Link>
            <Link
              to={isLoggedIn ? '/app/kuis' : '/kuis'}
              className={`h-full flex items-center text-sm transition-colors border-b-2 ${
                isKuisActive
                  ? 'border-violet-600 text-violet-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-violet-600 font-medium'
              }`}
            >
              Kuis
            </Link>
            <Link
              to="/tutorial"
              className={`h-full flex items-center text-sm transition-colors border-b-2 ${
                isTutorialActive
                  ? 'border-violet-600 text-violet-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-violet-600 font-medium'
              }`}
            >
              Tutorial
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gray-200 text-gray-600 hover:text-violet-600 hover:bg-gray-50 transition-colors"
              title={isDark ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              aria-label={isDark ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/app/kuis"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-semibold rounded-full px-4 py-2 transition-all shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Portal Belajar</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLogin}
                  className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors px-3 py-1.5 rounded-lg"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={openRegister}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full px-5 py-2 transition-all shadow-sm active:scale-[0.98]"
                >
                  Daftar
                </button>
              </>
            )}
          </div>

          {/* Mobile: Theme Toggle & Hamburger Button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 hover:text-violet-600 hover:bg-gray-100 transition-colors"
              title={isDark ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              aria-label={isDark ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-600"
              aria-label="Toggle navigation menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 px-4 pt-2 pb-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 space-y-3">
            <nav className="flex flex-col space-y-2">
              <Link
                to={isLoggedIn ? '/app/kamus' : '/kamus'}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isKamusActive
                    ? 'bg-violet-50 text-violet-600 font-semibold'
                    : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
                }`}
              >
                Kamus
              </Link>
              <Link
                to={isLoggedIn ? '/app/kuis' : '/kuis'}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isKuisActive
                    ? 'bg-violet-50 text-violet-600 font-semibold'
                    : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
                }`}
              >
                Kuis
              </Link>
              <Link
                to="/tutorial"
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isTutorialActive
                    ? 'bg-violet-50 text-violet-600 font-semibold'
                    : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
                }`}
              >
                Tutorial
              </Link>
            </nav>

            <hr className="border-gray-200 my-2" />

            <div className="flex flex-col space-y-2 pt-1">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/app/kuis"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full px-5 py-2.5 transition-colors shadow-sm"
                  >
                    Portal Belajar
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      logout()
                    }}
                    className="w-full px-3 py-2 text-center rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      openLogin()
                    }}
                    className="w-full px-3 py-2 text-center rounded-lg text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      openRegister()
                    }}
                    className="w-full text-center bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full px-5 py-2.5 transition-colors shadow-sm"
                  >
                    Daftar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
