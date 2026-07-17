import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { authService } from '../services/auth.service'
import { setAccessToken, clearAccessToken } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      // Limpia access legacy de localStorage (v1.4: solo memoria)
      try {
        localStorage.removeItem('token')
      } catch {
        /* ignore */
      }

      try {
        const refreshed = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const token = refreshed.data.accessToken || refreshed.data.token
        if (token) setAccessToken(token)
        if (refreshed.data.user) {
          setUser(refreshed.data.user)
          return
        }
        const me = await authService.getCurrentUser()
        if (me.user) setUser(me.user)
      } catch {
        clearAccessToken()
      }
    }

    bootstrap().finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    const token = response.accessToken || response.token
    setAccessToken(token)
    setUser(response.user)
    return response
  }

  const register = async (userData) => {
    const response = await authService.register(userData)
    const token = response.accessToken || response.token
    setAccessToken(token)
    setUser(response.user)
    return response
  }

  const logout = async () => {
    await authService.logout()
    clearAccessToken()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'ADMIN',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
