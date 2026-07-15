import { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/auth.service'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un token guardado
    const token = localStorage.getItem('token')
    if (token) {
      // Validar el token con el backend
      authService.getCurrentUser()
        .then(response => {
          if (response.user) {
            setUser(response.user)
          }
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    setUser(response.user)
    localStorage.setItem('token', response.token)
    return response
  }

  const register = async (userData) => {
    const response = await authService.register(userData)
    setUser(response.user)
    localStorage.setItem('token', response.token)
    return response
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    refreshUser: async () => {
      const response = await authService.getCurrentUser()
      if (response.user) {
        setUser(response.user)
      }
      return response.user
    },
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'ADMIN',
    hasRole: (rol) => user?.rol === rol
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
