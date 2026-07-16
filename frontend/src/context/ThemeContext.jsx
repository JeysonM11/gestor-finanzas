import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'theme'
const ThemeContext = createContext(null)

const THEMES = ['light', 'dark', 'system']

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveDark(theme) {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return getSystemDark()
}

function applyThemeClass(theme) {
  document.documentElement.classList.toggle('dark', resolveDark(theme))
}

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (THEMES.includes(stored)) return stored
  } catch {
    /* ignore */
  }
  return 'system'
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readStoredTheme)

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const resolved = prev === 'system' ? (getSystemDark() ? 'dark' : 'light') : prev
      return resolved === 'dark' ? 'light' : 'dark'
    })
  }, [])

  useEffect(() => {
    applyThemeClass(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return undefined
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyThemeClass('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  const isDark = resolveDark(theme)

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark,
      themes: THEMES,
    }),
    [theme, setTheme, toggleTheme, isDark]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
