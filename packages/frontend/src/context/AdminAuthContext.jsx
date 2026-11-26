import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('isyaratku_admin')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loginError, setLoginError] = useState('')
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)

  const mapAdminProfile = (authUser, profile) => ({
    id: authUser.id,
    name: profile?.full_name || `${profile?.first_name || 'Admin'} ${profile?.last_name || ''}`.trim(),
    email: profile?.email || authUser.email,
    username: profile?.username || authUser.email?.split('@')[0],
    role: 'Administrator Utama',
    badge: profile?.badge || 'Super Admin',
    phone: profile?.phone || '',
    avatarUrl: profile?.avatar_url || '',
  })

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profile?.role === 'admin') {
        setAdmin(mapAdminProfile(session.user, profile))
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (admin) {
      localStorage.setItem('isyaratku_admin', JSON.stringify(admin))
    } else {
      localStorage.removeItem('isyaratku_admin')
    }
  }, [admin])

  const loginAdmin = async (email, password) => {
    setLoginError('')

    if (!isSupabaseConfigured || !supabase) {
      setLoginError('Supabase belum dikonfigurasi.')
      return false
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setLoginError('Email atau kata sandi salah. Silakan coba lagi.')
      return false
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileErr || profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setLoginError('Akun ini tidak memiliki hak akses Administrator.')
      return false
    }

    setAdmin(mapAdminProfile(data.user, profile))
    return true
  }

  const logoutAdmin = async () => {
    setAdmin(null)
    localStorage.removeItem('isyaratku_admin')
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key)
        }
      })
    } catch {
      // ignore storage errors
    }
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {})
    }
  }

  const updateAdmin = async (data) => {
    if (!admin) return
    if (isSupabaseConfigured && supabase && admin.id) {
      const parts = (data.name || admin.name).trim().split(/\s+/)
      await supabase
        .from('profiles')
        .update({
          first_name: parts[0] || '',
          last_name: parts.slice(1).join(' '),
          username: data.username ?? admin.username,
          phone: data.phone ?? admin.phone,
          ...(data.avatarUrl !== undefined && { avatar_url: data.avatarUrl }),
        })
        .eq('id', admin.id)
    }
    setAdmin((prev) => ({ ...prev, ...data }))
  }

  const updateAdminPassword = async (oldPassword, newPassword) => {
    if (!admin?.email) {
      return { success: false, error: 'Sesi admin tidak ditemukan.' }
    }
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase belum dikonfigurasi.' }
    }

    // Verifikasi kata sandi lama terlebih dahulu
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: admin.email,
      password: oldPassword,
    })

    if (verifyErr) {
      return { success: false, error: 'Kata sandi lama tidak sesuai.' }
    }

    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateErr) {
      return { success: false, error: updateErr.message }
    }

    return { success: true, error: null }
  }

  const requestAdminPasswordReset = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase belum dikonfigurasi.' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  }

  const completeAdminPasswordReset = async (newPassword) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase belum dikonfigurasi.' }
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profile?.role === 'admin') {
        setAdmin(mapAdminProfile(data.user, profile))
      }
    }

    setIsRecoveryMode(false)
    return { success: true, error: null }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAdminLoggedIn: !!admin,
        loginError,
        isRecoveryMode,
        setIsRecoveryMode,
        loginAdmin,
        logoutAdmin,
        updateAdmin,
        updateAdminPassword,
        requestAdminPasswordReset,
        completeAdminPasswordReset,
        setLoginError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
