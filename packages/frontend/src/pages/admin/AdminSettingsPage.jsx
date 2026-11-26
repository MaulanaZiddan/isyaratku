import { useState, useRef, useEffect } from 'react'
import {
  User,
  Shield,
  Sliders,
  CheckCircle2,
  Pencil,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Bell,
  Globe,
  Palette,
  AlertCircle,
} from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import ConfirmModal from '@/components/common/ConfirmModal'

const PREFS_KEY = 'isyaratku_admin_prefs'

const loadAdminPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const AdminSettingsPage = () => {
  const { admin, updateAdmin, updateAdminPassword } = useAdminAuth()
  const avatarInputRef = useRef(null)

  // Tabs
  const [activeTab, setActiveTab] = useState('profil') // 'profil' | 'keamanan' | 'preferensi'

  // Profile form state
  const [fullName, setFullName] = useState(admin?.name || 'Admin Isyaratku')
  const [username, setUsername] = useState(admin?.username || 'admin_isyaratku')
  const [email, setEmail] = useState(admin?.email || 'admin@isyaratku.id')
  const [phone, setPhone] = useState(admin?.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(admin?.avatarUrl || '')
  const [isSaved, setIsSaved] = useState(false)

  // Security state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null) // { type: 'profile' | 'password', title, message }

  // Preferences state (persisted)
  const initialPrefs = loadAdminPrefs()
  const [notifEmail, setNotifEmail] = useState(initialPrefs.notifEmail ?? true)
  const [notifBrowser, setNotifBrowser] = useState(initialPrefs.notifBrowser ?? false)
  const [browserNotifNote, setBrowserNotifNote] = useState('')
  const [language, setLanguage] = useState(initialPrefs.language || 'id')
  const [theme, setTheme] = useState(initialPrefs.theme || 'light')
  const [prefSavedMsg, setPrefSavedMsg] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ notifEmail, notifBrowser, language, theme })
      )
      window.dispatchEvent(new Event('isyaratku_admin_theme_changed'))
    } catch {
      // ignore storage quota errors
    }
  }, [notifEmail, notifBrowser, language, theme])

  const showPrefFeedback = (msg) => {
    setPrefSavedMsg(msg)
    setTimeout(() => setPrefSavedMsg(''), 2200)
  }

  const handleToggleBrowserNotif = async () => {
    const nextVal = !notifBrowser
    if (nextVal && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') {
          setBrowserNotifNote('Izin notifikasi ditolak oleh browser.')
          setNotifBrowser(false)
          return
        }
      } else if (Notification.permission === 'denied') {
        setBrowserNotifNote('Notifikasi diblokir di pengaturan browser Anda.')
        setNotifBrowser(false)
        return
      }
      setBrowserNotifNote('Notifikasi browser aktif.')
    } else {
      setBrowserNotifNote('')
    }
    setNotifBrowser(nextVal)
    showPrefFeedback(nextVal ? 'Notifikasi browser diaktifkan.' : 'Notifikasi browser dimatikan.')
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (isSupabaseConfigured && supabase && admin?.id) {
      const ext = file.name.split('.').pop() || 'png'
      const path = `${admin.id}/avatar-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (!uploadErr) {
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
        if (pub?.publicUrl) {
          setAvatarUrl(pub.publicUrl)
          await updateAdmin({ avatarUrl: pub.publicUrl })
          setIsSaved(true)
          setTimeout(() => setIsSaved(false), 2000)
          return
        }
      }
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = String(reader.result || '')
      setAvatarUrl(dataUrl)
      await updateAdmin({ avatarUrl: dataUrl })
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
    reader.readAsDataURL(file)
  }

  const hasAdminProfileChanged =
    fullName.trim() !== (admin?.name || '').trim() ||
    username.trim() !== (admin?.username || '').trim() ||
    email.trim().toLowerCase() !== (admin?.email || '').trim().toLowerCase() ||
    phone.trim() !== (admin?.phone || '').trim()

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!hasAdminProfileChanged) return
    setConfirmDialog({
      type: 'profile',
      title: isEn ? 'Confirm Profile Update' : 'Konfirmasi Perubahan Profil Admin',
      message: isEn
        ? 'Are you sure you want to save changes to your administrator name, username, email, or phone?'
        : 'Apakah Anda yakin ingin menyimpan perubahan data profil administrator (nama, username, email, atau nomor telepon)?',
    })
  }

  const executeSaveProfile = async () => {
    await updateAdmin({ name: fullName, username, email, phone })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSaved(false)

    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal harus 6 karakter.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.')
      return
    }

    setConfirmDialog({
      type: 'password',
      title: isEn ? 'Confirm Password Change' : 'Konfirmasi Ubah Kata Sandi Admin',
      message: isEn
        ? 'Are you sure you want to update your administrator password?'
        : 'Apakah Anda yakin ingin memperbarui kata sandi akun administrator?',
    })
  }

  const executeChangePassword = async () => {
    setIsUpdatingPassword(true)
    const { success, error } = await updateAdminPassword(oldPassword, newPassword)
    setIsUpdatingPassword(false)

    if (!success) {
      setPasswordError(error || 'Gagal memperbarui kata sandi.')
      return
    }

    setPasswordSaved(true)
    setShowChangePassword(false)
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => setPasswordSaved(false), 3000)
  }

  const handleConfirmDialogAction = async () => {
    if (!confirmDialog) return
    const type = confirmDialog.type
    setConfirmDialog(null)
    if (type === 'profile') {
      await executeSaveProfile()
    } else if (type === 'password') {
      await executeChangePassword()
    }
  }

  const isEn = language === 'en'

  const tabs = [
    { id: 'profil', label: isEn ? 'Personal Profile' : 'Profil Pribadi', icon: User },
    { id: 'keamanan', label: isEn ? 'Account Security' : 'Keamanan Akun', icon: Shield },
    { id: 'preferensi', label: isEn ? 'App Preferences' : 'Preferensi Aplikasi', icon: Sliders },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {isEn ? 'System Settings' : 'Pengaturan Sistem'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEn
            ? 'Manage administrator profile, security, and preferences.'
            : 'Kelola profil, keamanan, dan preferensi administrator.'}
        </p>
      </div>

      {/* Main Grid: Left Profile Card + Right Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Profile Card + Tab Navigation */}
        <div className="space-y-6">
          {/* Admin Profile Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
            {/* Avatar */}
            <div className="relative w-28 h-28 mx-auto mb-4">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-violet-100 to-purple-200 border-4 border-white shadow-md flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar Admin"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-violet-700">
                    {(fullName || 'A').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-violet-700 transition-colors"
                title={isEn ? 'Change Photo' : 'Ubah Foto'}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-gray-900">{fullName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {admin?.role || 'Administrator Utama'}
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-full">
              {admin?.badge || 'Super Admin'}
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all border-l-[3px] ${
                    isActive
                      ? 'border-l-violet-600 bg-violet-50/50 text-violet-700 font-semibold'
                      : 'border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] ${
                      isActive ? 'text-violet-600' : 'text-gray-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Content based on Tab */}
        <div className="lg:col-span-2 space-y-6">
          {/* ========== TAB: Profil Pribadi ========== */}
          {activeTab === 'profil' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Dasar</h2>

              {isSaved && (
                <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">
                    Perubahan berhasil disimpan!
                  </p>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!hasAdminProfileChanged}
                    className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========== TAB: Keamanan Akun ========== */}
          {activeTab === 'keamanan' && (
            <div className="space-y-6">
              {passwordSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">
                    Kata sandi berhasil diperbarui!
                  </p>
                </div>
              )}

              {/* Password Section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Keamanan Akun</h2>

                {/* Change Password Row */}
                <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Kata Sandi</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Terakhir diubah 3 bulan yang lalu.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="px-4 py-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors"
                  >
                    Ubah Sandi
                  </button>
                </div>

                {/* Change Password Form (Expandable) */}
                {showChangePassword && (
                  <form
                    onSubmit={handleChangePassword}
                    className="mt-4 p-5 border border-violet-200 bg-violet-50/30 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200"
                  >
                    {passwordError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Kata Sandi Lama
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showOld ? 'text' : 'password'}
                          required
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOld(!showOld)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Kata Sandi Baru
                        </label>
                        <div className="relative">
                          <input
                            type={showNew ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Konfirmasi Sandi Baru
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowChangePassword(false)
                          setPasswordError('')
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold text-xs rounded-xl transition-colors"
                      >
                        {isUpdatingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ========== TAB: Preferensi Aplikasi ========== */}
          {activeTab === 'preferensi' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEn ? 'Application Preferences' : 'Preferensi Aplikasi'}
                </h2>
                {prefSavedMsg && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {prefSavedMsg}
                  </span>
                )}
              </div>

              {/* Notification Preferences */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-violet-600" />
                  <h3 className="text-base font-bold text-gray-900">
                    {isEn ? 'Notifications' : 'Notifikasi'}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {isEn ? 'Email Notifications' : 'Notifikasi Email'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isEn
                          ? 'Receive new user alerts and weekly summaries via email.'
                          : 'Terima notifikasi pengguna baru dan laporan mingguan via email.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !notifEmail
                        setNotifEmail(next)
                        showPrefFeedback(
                          next ? 'Notifikasi email diaktifkan.' : 'Notifikasi email dimatikan.'
                        )
                      }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                        notifEmail ? 'bg-violet-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          notifEmail ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {isEn ? 'Browser Notifications' : 'Notifikasi Browser'}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isEn
                          ? 'Show push notifications in browser for important activity.'
                          : 'Tampilkan push notification di browser saat ada aktivitas penting.'}
                      </p>
                      {browserNotifNote && (
                        <p className="text-[11px] font-medium text-violet-600 mt-1">
                          {browserNotifNote}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleBrowserNotif}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
                        notifBrowser ? 'bg-violet-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          notifBrowser ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Language Preference */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-gray-900">
                    {isEn ? 'Interface Language' : 'Bahasa Antarmuka'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'id', label: 'Bahasa Indonesia', desc: 'Default (Rekomendasi)' },
                    { id: 'en', label: 'English', desc: 'English Interface' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.id)
                        showPrefFeedback(
                          lang.id === 'en'
                            ? 'Language changed to English.'
                            : 'Bahasa diubah ke Indonesia.'
                        )
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        language === lang.id
                          ? 'border-violet-600 bg-violet-50/40'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-gray-900">{lang.label}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{lang.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-gray-900">
                    {isEn ? 'Display Theme' : 'Tema Tampilan'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: isEn ? 'Light' : 'Terang', desc: 'Default' },
                    { id: 'dark', label: isEn ? 'Dark' : 'Gelap', desc: isEn ? 'Dark mode' : 'Mode gelap' },
                    { id: 'system', label: isEn ? 'System' : 'Sistem', desc: isEn ? 'Follow device' : 'Ikuti perangkat' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id)
                        showPrefFeedback(
                          isEn ? `Theme set to ${t.label}.` : `Tema diubah ke ${t.label}.`
                        )
                      }}
                      className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        theme === t.id
                          ? 'border-violet-600 bg-violet-50/40'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-gray-900">{t.label}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={handleConfirmDialogAction}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmText={isEn ? 'Yes, Save' : 'Ya, Simpan'}
        cancelText={isEn ? 'Cancel' : 'Batal'}
        isLoading={isUpdatingPassword}
      />
    </div>
  )
}

export default AdminSettingsPage
