import { useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useTheme } from './ThemeContext'

/**
 * Aplica el tema guardado en preferencias del usuario al iniciar sesión.
 * No pisa cambios locales posteriores en la misma sesión.
 */
const ThemeUserSync = () => {
  const { user } = useAuth()
  const { setTheme } = useTheme()
  const syncedForUser = useRef(null)

  useEffect(() => {
    if (!user?.id) {
      syncedForUser.current = null
      return
    }
    if (syncedForUser.current === user.id) return

    const tema = user.configuracion?.tema
    if (tema === 'light' || tema === 'dark' || tema === 'system') {
      setTheme(tema)
    }
    syncedForUser.current = user.id
  }, [user, setTheme])

  return null
}

export default ThemeUserSync
