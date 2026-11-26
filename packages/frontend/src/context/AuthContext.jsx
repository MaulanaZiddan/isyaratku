import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const AuthContext = createContext(null)

function mapProfileToUser(authUser, profile) {
  const metaName = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || ''
  const metaParts = metaName.trim().split(/\s+/).filter(Boolean)

  const firstName =
    profile?.first_name ||
    authUser?.user_metadata?.first_name ||
    metaParts[0] ||
    authUser?.email?.split('@')[0] ||
    'Pengguna'
  const lastName =
    profile?.last_name ||
    authUser?.user_metadata?.last_name ||
    metaParts.slice(1).join(' ') ||
    ''
  const fullName = profile?.full_name || `${firstName} ${lastName}`.trim()

  return {
    id: authUser.id,
    firstName,
    lastName,
    name: fullName,
    email: profile?.email || authUser.email,
    role: profile?.badge || (profile?.role === 'admin' ? 'Administrator' : 'Siswa Terdaftar'),
    dbRole: profile?.role || 'user',
    totalPoints: profile?.total_points ?? 0,
    streakDays: profile?.streak_days ?? 0,
    avatarUrl: profile?.avatar_url || authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture || null,
  }
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [verificationMessage, setVerificationMessage] = useState('')
  const [authToast, setAuthToast] = useState('')
  const handlingRedirectRef = useRef(false)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('isyaratku_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const fetchAndSetUser = async (authUser) => {
    if (!authUser || !supabase) {
      setUser(null)
      return null
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    // Role 'admin' tidak boleh masuk ke state Portal User
    if (profile?.role === 'admin') {
      setUser(null)
      return { isAdminAccount: true }
    }

    const mapped = mapProfileToUser(authUser, profile)
    setUser(mapped)
    return mapped
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const isSignupVerified =
      params.get('verified') === 'true' || hashParams.get('type') === 'signup'
    const oauthIntent =
      params.get('auth_action') === 'google_register'
        ? 'register'
        : params.get('auth_action') === 'google_login'
        ? 'login'
        : sessionStorage.getItem('isyaratku_oauth_intent')

    const handlePostAuthRedirect = async (session) => {
      if (handlingRedirectRef.current) return

      if (isSignupVerified) {
        handlingRedirectRef.current = true
        await supabase.auth.signOut()
        setUser(null)
        setVerificationMessage('Email berhasil diverifikasi! Silakan masuk menggunakan akun Anda.')
        setMode('login')
        setIsOpen(true)
        window.history.replaceState({}, '', '/')
        return
      }

      if (oauthIntent === 'register' && session?.user) {
        handlingRedirectRef.current = true
        sessionStorage.removeItem('isyaratku_oauth_intent')
        await supabase.auth.signOut()
        setUser(null)
        setVerificationMessage(
          'Pendaftaran dengan akun Google berhasil! Silakan masuk menggunakan akun Anda.'
        )
        setMode('login')
        setIsOpen(true)
        window.history.replaceState({}, '', '/')
        return
      }

      if (oauthIntent === 'login' && session?.user) {
        handlingRedirectRef.current = true
        sessionStorage.removeItem('isyaratku_oauth_intent')
        const res = await fetchAndSetUser(session.user)
        if (res?.isAdminAccount) {
          await supabase.auth.signOut()
          setVerificationMessage(
            'Akun Administrator hanya dapat masuk melalui Panel Admin (/admin/login).'
          )
          setMode('login')
          setIsOpen(true)
          window.history.replaceState({}, '', '/')
          return
        }
        setAuthToast('Login dengan akun Google berhasil! Selamat datang di Isyaratku.')
        setTimeout(() => setAuthToast(''), 4500)
        window.history.replaceState({}, '', '/app/kuis')
        navigate('/app/kuis', { replace: true })
        return
      }

      if (session?.user) {
        await fetchAndSetUser(session.user)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isSignupVerified) {
        handlePostAuthRedirect(session)
      } else if (session) {
        handlePostAuthRedirect(session)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('forgot')
        setIsOpen(true)
      }
      if (event === 'SIGNED_IN' && session?.user) {
        handlePostAuthRedirect(session)
      } else if (event === 'SIGNED_OUT' && !handlingRedirectRef.current) {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (user) {
      localStorage.setItem('isyaratku_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('isyaratku_user')
    }
  }, [user])

  const openLogin = () => {
    setMode('login')
    setIsOpen(true)
  }

  const openRegister = () => {
    setMode('register')
    setIsOpen(true)
  }

  const openForgotPassword = () => {
    setMode('forgot')
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
  }

  const loginWithEmail = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      const fallback = {
        name: email.split('@')[0],
        email,
        role: 'Siswa Terdaftar',
      }
      setUser(fallback)
      setIsOpen(false)
      setAuthToast('Login berhasil! Selamat datang di Isyaratku.')
      setTimeout(() => setAuthToast(''), 4500)
      navigate('/app/kuis', { replace: true })
      return { user: fallback, error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      return { user: null, error: error.message }
    }

    const result = await fetchAndSetUser(data.user)
    if (result?.isAdminAccount) {
      await supabase.auth.signOut()
      return {
        user: null,
        error: 'Akun Administrator hanya dapat masuk melalui Panel Admin (/admin/login).',
      }
    }

    setIsOpen(false)
    setAuthToast('Login berhasil! Selamat datang di Isyaratku.')
    setTimeout(() => setAuthToast(''), 4500)
    navigate('/app/kuis', { replace: true })
    return { user: result, error: null }
  }

  const loginWithGoogle = async (intent = 'login') => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase belum dikonfigurasi.' }
    }

    sessionStorage.setItem('isyaratku_oauth_intent', intent)
    const actionParam = intent === 'register' ? 'google_register' : 'google_login'

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/?auth_action=${actionParam}`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      sessionStorage.removeItem('isyaratku_oauth_intent')
      return { error: error.message }
    }

    return { error: null }
  }

  const registerWithEmail = async (fullName, email, password) => {
    const parts = fullName.trim().split(/\s+/)
    const firstName = parts[0] || email.split('@')[0]
    const lastName = parts.slice(1).join(' ')

    if (!isSupabaseConfigured || !supabase) {
      const fallback = {
        firstName,
        lastName,
        name: fullName.trim() || firstName,
        email,
        role: 'Siswa Terdaftar',
      }
      setUser(fallback)
      setIsOpen(false)
      return { user: fallback, needsEmailConfirmation: false, error: null }
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/?verified=true`,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'user',
        },
      },
    })

    if (error) {
      return { user: null, needsEmailConfirmation: false, error: error.message }
    }

    // Jika Confirm Email diaktifkan di Supabase, session bisa null sampai klik link verifikasi
    if (!data.session) {
      return { user: data.user, needsEmailConfirmation: true, error: null }
    }

    const mapped = await fetchAndSetUser(data.user)
    setIsOpen(false)
    return { user: mapped, needsEmailConfirmation: false, error: null }
  }

  const updateProfile = async ({ firstName, lastName, newEmail }) => {
    if (!user) return { error: 'Belum masuk' }

    const updated = {
      ...user,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      name: `${firstName ?? user.firstName} ${lastName ?? user.lastName}`.trim(),
    }

    if (isSupabaseConfigured && supabase && user.id) {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updated.firstName,
          last_name: updated.lastName,
        })
        .eq('id', user.id)

      if (error) return { error: error.message }
    }

    setUser(updated)
    return { error: null }
  }

  // Request ganti email (Supabase akan mengirim token / OTP ke email baru)
  const requestEmailChange = async (newEmail) => {
    if (!user) return { error: 'Belum masuk' }
    if (!isSupabaseConfigured || !supabase) {
      // Mock / fallback jika offline
      return { success: true, isMock: true, error: null }
    }

    const { error } = await supabase.auth.updateUser({
      email: newEmail.trim(),
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, isMock: false, error: null }
  }

  // Verifikasi OTP ganti email menggunakan supabase.auth.verifyOtp
  const verifyEmailOtp = async (newEmail, token) => {
    if (!user) return { error: 'Belum masuk' }

    if (!isSupabaseConfigured || !supabase) {
      // Mock / fallback
      const updated = { ...user, email: newEmail.trim() }
      setUser(updated)
      return { success: true, error: null }
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: newEmail.trim(),
      token: token.trim(),
      type: 'email_change',
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Update email di tabel profiles
    await supabase
      .from('profiles')
      .update({ email: newEmail.trim() })
      .eq('id', user.id)

    const mapped = await fetchAndSetUser(data.user || { id: user.id, email: newEmail })
    return { success: true, user: mapped, error: null }
  }

  // Kirim link & OTP Reset Password ke email
  const requestPasswordReset = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true, isMock: true, error: null }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/app/profil`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, isMock: false, error: null }
  }

  // Verifikasi OTP dan set kata sandi baru
  const resetPasswordWithOtp = async (email, token, newPassword) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true, error: null }
    }

    // Verifikasi OTP recovery
    const { data, error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'recovery',
    })

    if (otpError) {
      return { success: false, error: otpError.message }
    }

    // Update password setelah token diverifikasi
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    if (data.user) {
      await fetchAndSetUser(data.user)
    }

    return { success: true, error: null }
  }

  // Ubah kata sandi untuk pengguna yang sedang login
  const updatePassword = async (newPassword) => {
    if (!user) return { error: 'Belum masuk' }
    if (!isSupabaseConfigured || !supabase) {
      return { error: null }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  }

  const login = (userData) => {
    const newUser = userData || {
      name: 'Maulana Ziddan',
      email: 'mziddan98@gmail.com',
      role: 'Siswa Terdaftar',
    }
    setUser(newUser)
    setIsOpen(false)
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('isyaratku_user')
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {})
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isOpen,
        mode,
        user,
        isLoggedIn: !!user,
        openLogin,
        openRegister,
        openForgotPassword,
        closeModal,
        switchMode,
        verificationMessage,
        clearVerificationMessage: () => setVerificationMessage(''),
        authToast,
        clearAuthToast: () => setAuthToast(''),
        login,
        loginWithEmail,
        loginWithGoogle,
        registerWithEmail,
        updateProfile,
        requestEmailChange,
        verifyEmailOtp,
        requestPasswordReset,
        resetPasswordWithOtp,
        updatePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthModal = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthProvider')
  }
  return context
}

export const useAuth = useAuthModal
