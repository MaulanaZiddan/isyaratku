import { useState, useEffect, useCallback } from 'react'

const USER_THEME_KEY = 'isyaratku_user_theme'
const THEME_EVENT = 'isyaratku_user_theme_changed'

const getStoredTheme = () => {
  try {
    const saved = localStorage.getItem(USER_THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // ignore
  }
  return 'light'
}

export const useUserTheme = () => {
  const [theme, setTheme] = useState(getStoredTheme)

  useEffect(() => {
    const applyTheme = () => {
      const current = getStoredTheme()
      setTheme(current)
      document.documentElement.classList.toggle('dark', current === 'dark')
    }

    applyTheme()
    window.addEventListener(THEME_EVENT, applyTheme)
    window.addEventListener('storage', applyTheme)

    return () => {
      window.removeEventListener(THEME_EVENT, applyTheme)
      window.removeEventListener('storage', applyTheme)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const next = getStoredTheme() === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(USER_THEME_KEY, next)
    } catch {
      // ignore
    }
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    window.dispatchEvent(new Event(THEME_EVENT))
  }, [])

  return { theme, isDark: theme === 'dark', toggleTheme }
}
