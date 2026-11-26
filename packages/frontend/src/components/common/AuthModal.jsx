import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  RotateCw,
} from 'lucide-react'
import { useAuthModal } from '@/context/AuthContext'

const AuthModal = () => {
  const {
    isOpen,
    mode,
    closeModal,
    switchMode,
    verificationMessage,
    clearVerificationMessage,
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    requestPasswordReset,
    resetPasswordWithOtp,
  } = useAuthModal()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    rememberMe: false,
  })

  // State untuk Reset Password
  const [forgotStep, setForgotStep] = useState(1) // 1: kirim email, 2: input OTP & password baru
  const [otpToken, setOtpToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isResendingOtp, setIsResendingOtp] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeModal])

  // Reset state saat modal dibuka atau mode berubah
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('')
      setInfoMessage('')
      if (mode !== 'forgot') {
        setForgotStep(1)
        setOtpToken('')
        setNewPassword('')
        setConfirmNewPassword('')
      }
    }
  }, [isOpen, mode])

  if (!isOpen) return null

  const isLogin = mode === 'login'
  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'

  const handleGoogleAuth = async () => {
    setErrorMessage('')
    setInfoMessage('')
    setIsLoading(true)
    try {
      const { error } = await loginWithGoogle(isLogin ? 'login' : 'register')
      if (error) {
        setErrorMessage(
          error.includes('provider is not enabled')
            ? 'Login Google belum diaktifkan di Supabase Dashboard (Authentication → Providers → Google).'
            : error
        )
      }
    } catch {
      setErrorMessage('Gagal menghubungkan ke akun Google.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    if (isRegister) {
      if (formData.password.length < 6) {
        setErrorMessage('Kata sandi minimal 6 karakter.')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage('Konfirmasi kata sandi tidak cocok.')
        return
      }
    }

    setIsLoading(true)
    try {
      if (isLogin) {
        const { error } = await loginWithEmail(formData.email, formData.password)
        if (error) {
          setErrorMessage(
            error.includes('Invalid login credentials')
              ? 'Email atau kata sandi salah.'
              : error
          )
          return
        }
        setIsSubmitted(true)
        clearVerificationMessage()
        setTimeout(() => {
          setIsSubmitted(false)
          navigate('/app/kuis')
        }, 500)
      } else if (isRegister) {
        const { needsEmailConfirmation, error } = await registerWithEmail(
          formData.name,
          formData.email,
          formData.password
        )
        if (error) {
          setErrorMessage(error)
          return
        }
        if (needsEmailConfirmation) {
          setInfoMessage(
            'Pendaftaran berhasil! Silakan cek inbox email Anda untuk konfirmasi akun sebelum masuk.'
          )
          return
        }
        setIsSubmitted(true)
        clearVerificationMessage()
        setTimeout(() => {
          setIsSubmitted(false)
          navigate('/app/kuis')
        }, 500)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle pengiriman link/OTP reset password
  const handleRequestReset = async (e) => {
    e.preventDefault()
    if (!formData.email) {
      setErrorMessage('Silakan masukkan alamat email Anda.')
      return
    }

    setErrorMessage('')
    setInfoMessage('')
    setIsLoading(true)

    try {
      const { success, error } = await requestPasswordReset(formData.email)
      if (!success) {
        setErrorMessage(error || 'Gagal mengirim instruksi reset kata sandi.')
        return
      }
      setForgotStep(2)
      setInfoMessage(
        'Kode OTP verifikasi telah dikirimkan ke email Anda. Silakan cek inbox atau folder spam.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Handle verifikasi OTP dan simpan password baru
  const handleVerifyReset = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    if (!otpToken.trim()) {
      setErrorMessage('Silakan masukkan kode OTP dari email Anda.')
      return
    }
    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal 6 karakter.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak cocok.')
      return
    }

    setIsLoading(true)
    try {
      const { success, error } = await resetPasswordWithOtp(
        formData.email,
        otpToken,
        newPassword
      )

      if (!success) {
        setErrorMessage(error || 'Kode OTP tidak valid atau sudah kedaluwarsa.')
        return
      }

      setIsSubmitted(true)
      setTimeout(() => {
        setIsSubmitted(false)
        switchMode('login')
        setForgotStep(1)
        setInfoMessage('Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.')
      }, 1500)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle kirim ulang OTP
  const handleResendOtp = async () => {
    setErrorMessage('')
    setInfoMessage('')
    setIsResendingOtp(true)
    try {
      const { success, error } = await requestPasswordReset(formData.email)
      if (!success) {
        setErrorMessage(error || 'Gagal mengirim ulang OTP.')
      } else {
        setInfoMessage('Kode OTP baru telah dikirimkan ke email Anda.')
      }
    } finally {
      setIsResendingOtp(false)
    }
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal()
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 my-8">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Tutup form"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-violet-600" />
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">
              Isyaratku
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {isForgot
              ? 'Atur Ulang Kata Sandi'
              : isLogin
              ? 'Masuk ke Akun Anda'
              : 'Buat Akun Gratis'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isForgot
              ? forgotStep === 1
                ? 'Masukkan email untuk menerima kode OTP & link reset.'
                : 'Masukkan kode OTP dan buat kata sandi baru Anda.'
              : isLogin
              ? 'Lanjutkan perjalanan belajar BISINDO Anda.'
              : 'Mulai simpan progres dan akses materi lengkap.'}
          </p>
        </div>

        {/* Tab Toggle: Masuk / Daftar OR Tombol Kembali untuk Lupa Sandi */}
        {!isForgot ? (
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('')
                setInfoMessage('')
                switchMode('login')
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMessage('')
                setInfoMessage('')
                switchMode('register')
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Daftar Akun
            </button>
          </div>
        ) : (
          <div className="mb-5">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('')
                setInfoMessage('')
                switchMode('login')
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Masuk</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {(infoMessage || verificationMessage) && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-700 text-xs font-medium">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>{infoMessage || verificationMessage}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="py-10 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {isForgot
                ? 'Kata Sandi Berhasil Diperbarui!'
                : isLogin
                ? 'Berhasil Masuk!'
                : 'Pendaftaran Berhasil!'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isForgot
                ? 'Mengarahkan ke form masuk...'
                : 'Menghubungkan ke sesi belajar Anda...'}
            </p>
          </div>
        ) : isForgot ? (
          /* ======================================================== */
          /* FORM LUPA / ATUR ULANG KATA SANDI */
          /* ======================================================== */
          forgotStep === 1 ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alamat Email Akun
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                  Kami akan mengirimkan kode OTP dan tautan reset kata sandi ke alamat email Anda.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-violet-600/25 active:scale-[0.99] mt-2"
              >
                {isLoading ? 'Mengirim...' : 'Kirim Kode Reset'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyReset} className="space-y-4">
              <div className="p-3 bg-violet-50/70 border border-violet-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[220px]">
                  Terkirim ke: <strong className="text-violet-700">{formData.email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  className="text-violet-600 hover:underline font-semibold shrink-0"
                >
                  Ubah Email
                </button>
              </div>

              {/* Input OTP */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kode OTP (6 Digit / Token dari Email)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="Contoh: 123456"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono tracking-widest text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
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

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi kata sandi baru"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-400">Tidak menerima kode?</span>
                <button
                  type="button"
                  disabled={isResendingOtp}
                  onClick={handleResendOtp}
                  className="text-violet-600 hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
                >
                  <RotateCw className={`w-3 h-3 ${isResendingOtp ? 'animate-spin' : ''}`} />
                  <span>Kirim Ulang OTP</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-violet-600/25 active:scale-[0.99] mt-2"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Register */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimal 8 karakter"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
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

            {/* Confirm Password for Register */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi kata sandi Anda"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Login Extra Options */}
            {isLogin ? (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData({ ...formData, rememberMe: e.target.checked })
                    }
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span>Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('')
                    setInfoMessage('')
                    switchMode('forgot')
                  }}
                  className="text-violet-600 hover:underline font-medium"
                >
                  Lupa kata sandi?
                </button>
              </div>
            ) : (
              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer leading-tight">
                  <input
                    type="checkbox"
                    required
                    checked={formData.agreeTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, agreeTerms: e.target.checked })
                    }
                    className="mt-0.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span>
                    Saya menyetujui{' '}
                    <span className="text-violet-600 font-medium">Syarat & Ketentuan</span>{' '}
                    serta{' '}
                    <span className="text-violet-600 font-medium">Kebijakan Privasi</span>.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-violet-600/25 active:scale-[0.99] mt-2"
            >
              {isLoading ? 'Memproses...' : isLogin ? 'Masuk Sekarang' : 'Daftar Akun Gratis'}
            </button>

            {/* Social Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                atau
              </span>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-medium text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2.5 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLogin ? 'Masuk dengan Google' : 'Daftar dengan Google'}</span>
            </button>
          </form>
        )}

        {/* Bottom Switch Mode Link */}
        <div className="mt-6 text-center text-xs text-gray-500">
          {isForgot ? (
            <p>
              Sudah ingat kata sandi Anda?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('')
                  setInfoMessage('')
                  switchMode('login')
                }}
                className="text-violet-600 font-semibold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          ) : isLogin ? (
            <p>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="text-violet-600 font-semibold hover:underline"
              >
                Daftar Sekarang
              </button>
            </p>
          ) : (
            <p>
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-violet-600 font-semibold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
