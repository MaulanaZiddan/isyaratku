import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  User,
  CheckCircle2,
  Mail,
  ShieldAlert,
  KeyRound,
  X,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useAuthModal } from '@/context/AuthContext'
import ConfirmModal from '@/components/common/ConfirmModal'

const UserProfilePage = () => {
  const {
    user,
    updateProfile,
    requestEmailChange,
    verifyEmailOtp,
    updatePassword,
  } = useAuthModal()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user?.firstName || 'Andi')
  const [lastName, setLastName] = useState(user?.lastName || 'Pratama')
  const [email, setEmail] = useState(user?.email || 'andi.pratama@email.com')
  const [confirmDialog, setConfirmDialog] = useState(null) // { type: 'profile' | 'password', title, message }
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // State untuk modal OTP / Verifikasi Email
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [pendingNewEmail, setPendingNewEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isRequestingOtp, setIsRequestingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('')

  // State untuk ubah kata sandi
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [isChangingPass, setIsChangingPass] = useState(false)
  const [passError, setPassError] = useState('')
  const [passSuccess, setPassSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.name?.split(' ')[0] || '')
      setLastName(user.lastName || user.name?.split(' ').slice(1).join(' ') || '')
      setEmail(user.email || '')
    }
  }, [user])

  useEffect(() => {
    if (isOtpModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOtpModalOpen])

  const executeSaveProfile = async () => {
    // Cek apakah user ingin mengubah email
    const isEmailChanged = email.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase()

    if (isEmailChanged) {
      // Simpan perubahan nama terlebih dahulu
      await updateProfile({ firstName, lastName })

      // Buka modal verifikasi OTP untuk email baru
      setPendingNewEmail(email.trim())
      setOtpCode('')
      setOtpError('')
      setOtpSuccessMessage('')
      setIsOtpModalOpen(true)

      // Request kirim OTP ke email baru via Supabase
      setIsRequestingOtp(true)
      const { success, error } = await requestEmailChange(email.trim())
      setIsRequestingOtp(false)

      if (!success) {
        setOtpError(error || 'Gagal mengirim kode verifikasi ke email baru.')
      }
      return
    }

    // Jika hanya mengubah nama
    const { error } = await updateProfile({ firstName, lastName })
    if (error) {
      alert(`Gagal menyimpan profil: ${error}`)
      return
    }
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const hasProfileChanged =
    firstName.trim() !== (user?.firstName || '').trim() ||
    lastName.trim() !== (user?.lastName || '').trim() ||
    email.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase()

  const handleSave = (e) => {
    e.preventDefault()
    if (!hasProfileChanged) return
    const isEmailChanged = email.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase()
    setConfirmDialog({
      type: 'profile',
      title: isEmailChanged ? 'Konfirmasi Perubahan Email & Profil' : 'Konfirmasi Simpan Profil',
      message: isEmailChanged
        ? `Apakah Anda yakin ingin mengubah email ke "${email.trim()}" dan menyimpan perubahan profil? Kode verifikasi OTP akan dikirim ke email baru.`
        : `Apakah Anda yakin ingin menyimpan perubahan nama menjadi "${firstName} ${lastName}"?`,
    })
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otpCode.trim()) {
      setOtpError('Harap masukkan kode OTP.')
      return
    }

    setIsVerifyingOtp(true)
    setOtpError('')
    const { success, error } = await verifyEmailOtp(pendingNewEmail, otpCode.trim())
    setIsVerifyingOtp(false)

    if (!success) {
      setOtpError(error || 'Kode OTP tidak valid atau telah kedaluwarsa.')
      return
    }

    setOtpSuccessMessage('Email berhasil diverifikasi dan diperbarui!')
    setTimeout(() => {
      setIsOtpModalOpen(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }, 1200)
  }

  const handleResendOtp = async () => {
    setOtpError('')
    setOtpSuccessMessage('')
    setIsRequestingOtp(true)
    const { success, error } = await requestEmailChange(pendingNewEmail)
    setIsRequestingOtp(false)

    if (!success) {
      setOtpError(error || 'Gagal mengirim ulang kode OTP.')
    } else {
      setOtpSuccessMessage('Kode OTP baru telah dikirimkan ke email Anda.')
    }
  }

  const executePasswordChange = async () => {
    setIsChangingPass(true)
    try {
      const { error } = await updatePassword(newPassword)
      if (error) {
        setPassError(error)
        return
      }
      setPassSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPassSuccess(false), 3000)
    } finally {
      setIsChangingPass(false)
    }
  }

  // Handle Ubah Kata Sandi langsung di profil
  const handlePasswordChange = (e) => {
    e.preventDefault()
    setPassError('')
    setPassSuccess(false)

    if (!newPassword) {
      setPassError('Silakan masukkan kata sandi baru.')
      return
    }
    if (newPassword.length < 6) {
      setPassError('Kata sandi baru minimal 6 karakter.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPassError('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setConfirmDialog({
      type: 'password',
      title: 'Konfirmasi Ubah Kata Sandi',
      message: 'Apakah Anda yakin ingin memperbarui kata sandi akun Anda?',
    })
  }

  const handleConfirmDialogAction = async () => {
    if (!confirmDialog) return
    setIsConfirmLoading(true)
    const currentType = confirmDialog.type
    setConfirmDialog(null)
    try {
      if (currentType === 'profile') {
        await executeSaveProfile()
      } else if (currentType === 'password') {
        await executePasswordChange()
      }
    } finally {
      setIsConfirmLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Profil Pengguna
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Kelola informasi akun Anda dengan mudah.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
        {/* Left Column: User Card */}
        <div className="md:col-span-5 lg:col-span-4 md:sticky md:top-24 bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm flex items-center gap-4 text-left sm:block sm:text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 sm:mx-auto rounded-full overflow-hidden bg-gradient-to-br from-violet-100 to-purple-200 border-4 border-white shadow-md sm:mb-4 flex items-center justify-center shrink-0">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&h=250&fit=crop&auto=format"
              alt="Avatar Andi Pratama"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {firstName} {lastName}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 sm:mt-1 truncate">{email}</p>
            <div className="mt-2.5 sm:mt-4">
              <span className="inline-block bg-violet-100 text-violet-700 font-semibold text-[11px] sm:text-xs px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
                {user?.role || 'Siswa Terdaftar'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Sections */}
        <div className="md:col-span-7 lg:col-span-8 space-y-5 sm:space-y-6">
          {/* Card 1: Informasi Akun */}
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <User className="w-5 h-5 text-gray-700 shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Informasi Akun</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Nama Depan
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Nama Belakang
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-600">
                    Alamat Email
                  </label>
                  {email.trim().toLowerCase() !== (user?.email || '').trim().toLowerCase() && (
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Butuh Verifikasi OTP
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Untuk keamanan akun, mengganti alamat email memerlukan verifikasi kode OTP yang dikirim ke email baru.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
                {isSaved ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center justify-center sm:justify-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Perubahan berhasil disimpan!
                  </span>
                ) : (
                  <div className="hidden sm:block" />
                )}
                <button
                  type="submit"
                  disabled={!hasProfileChanged}
                  className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors shadow-sm active:scale-[0.99]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Keamanan & Kata Sandi */}
          <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <Lock className="w-5 h-5 text-gray-700 shrink-0" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Keamanan & Kata Sandi</h3>
                <p className="text-xs text-gray-400 mt-0.5">Perbarui kata sandi akun Anda secara berkala.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full px-3.5 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {passError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>Kata sandi berhasil diperbarui!</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full sm:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm active:scale-[0.99]"
                >
                  {isChangingPass ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL VERIFIKASI / OTP GANTI EMAIL (FULLSCREEN BLUR VIA PORTAL) */}
      {/* ======================================================== */}
      {isOtpModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-center relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  setIsOtpModalOpen(false)
                  setEmail(user?.email || '')
                }}
                className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                Verifikasi Email Baru
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Kami telah mengirimkan tautan konfirmasi atau kode verifikasi ke alamat email baru:
              </p>
              <p className="text-xs font-bold text-violet-700 mt-1 mb-5 bg-violet-50 py-1.5 px-3 rounded-lg inline-block border border-violet-100">
                {pendingNewEmail}
              </p>

              {otpError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-left text-xs text-rose-700 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpSuccessMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-left text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <span>{otpSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 text-left">
                    Masukkan Kode OTP (6 Digit / Token)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono tracking-widest text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-400">Tidak menerima kode?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isRequestingOtp}
                    className="font-semibold text-violet-600 hover:text-violet-700 disabled:text-gray-400"
                  >
                    {isRequestingOtp ? 'Mengirim...' : 'Kirim Ulang OTP'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpModalOpen(false)
                      setEmail(user?.email || '')
                    }}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingOtp}
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-violet-600/20"
                  >
                    {isVerifyingOtp ? 'Memverifikasi...' : 'Verifikasi'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      <ConfirmModal
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={handleConfirmDialogAction}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmText="Ya, Simpan"
        cancelText="Batal"
        isLoading={isConfirmLoading}
      />
    </div>
  )
}

export default UserProfilePage
