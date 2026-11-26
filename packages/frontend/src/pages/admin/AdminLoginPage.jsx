import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const {
    loginAdmin,
    loginError,
    isAdminLoggedIn,
    isRecoveryMode,
    setIsRecoveryMode,
    requestAdminPasswordReset,
    completeAdminPasswordReset,
    setLoginError,
  } = useAdminAuth()

  const [viewMode, setViewMode] = useState('login') // 'login' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')

  // Redirect if already logged in and not in recovery mode
  if (isAdminLoggedIn && !isRecoveryMode) {
    navigate('/admin/dashboard', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')

    const success = await loginAdmin(email, password)
    setIsLoading(false)
    if (success) {
      navigate('/admin/dashboard')
    }
  }

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetMessage('')
    setIsLoading(true)

    const { success, error } = await requestAdminPasswordReset(email)
    setIsLoading(false)

    if (!success) {
      setResetError(error || 'Gagal mengirim tautan reset kata sandi.')
      return
    }

    setResetMessage(
      `Tautan reset kata sandi telah dikirim ke ${email}. Silakan periksa kotak masuk atau folder spam Anda.`
    )
  }

  const handleCompleteRecovery = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetMessage('')

    if (newPassword.length < 6) {
      setResetError('Kata sandi baru minimal harus 6 karakter.')
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setIsLoading(true)
    const { success, error } = await completeAdminPasswordReset(newPassword)
    setIsLoading(false)

    if (!success) {
      setResetError(error || 'Gagal memperbarui kata sandi.')
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-600 rounded-2xl shadow-lg shadow-violet-600/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="font-extrabold text-2xl text-white tracking-tight">
              Isyaratku
            </span>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            Admin Panel — Masuk sebagai administrator
          </p>
        </div>

        {/* Login / Reset Password Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          {isRecoveryMode ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Atur Ulang Kata Sandi Admin
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Masukkan kata sandi baru untuk akun administrator Anda.
              </p>

              {resetError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700 font-medium">{resetError}</p>
                </div>
              )}

              <form onSubmit={handleCompleteRecovery} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Ulangi kata sandi baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(false)
                    setResetError('')
                  }}
                  className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  Batal & Kembali ke Login
                </button>
              </form>
            </>
          ) : viewMode === 'forgot' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setViewMode('login')
                  setResetError('')
                  setResetMessage('')
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-violet-600 mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Login
              </button>

              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Reset Kata Sandi Admin
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Masukkan email administrator Anda untuk menerima tautan pengaturan ulang kata sandi.
              </p>

              {resetError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700 font-medium">{resetError}</p>
                </div>
              )}

              {resetMessage && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 font-medium">{resetMessage}</p>
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Administrator
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="admin@isyaratku.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mengirim Tautan...</span>
                    </>
                  ) : (
                    <span>Kirim Tautan Reset</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Masuk ke Panel Admin
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Gunakan kredensial administrator Anda untuk melanjutkan.
              </p>

              {/* Error Alert */}
              {loginError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700 font-medium">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Administrator
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="admin@isyaratku.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('forgot')
                        setLoginError('')
                        setResetError('')
                        setResetMessage('')
                      }}
                      className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Masuk sebagai Admin</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Back to main site */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-xs text-gray-400 hover:text-violet-600 font-medium transition-colors"
            >
              ← Kembali ke halaman utama
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
