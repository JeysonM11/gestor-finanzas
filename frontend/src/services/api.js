import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

/** Access token en memoria (no localStorage) */
let accessTokenMemory = null
let refreshPromise = null

export function setAccessToken(token) {
  accessTokenMemory = token || null
}

export function getAccessToken() {
  return accessTokenMemory
}

export function clearAccessToken() {
  accessTokenMemory = null
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = accessTokenMemory || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const token = res.data.accessToken || res.data.token
        setAccessToken(token)
        // Compat temporal durante migración
        if (token) localStorage.setItem('token', token)
        return token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const code = error.response?.data?.code
    const status = error.response?.status

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !String(original.url || '').includes('/auth/refresh') &&
      !String(original.url || '').includes('/auth/login') &&
      (code === 'ACCESS_TOKEN_EXPIRED' || code === 'TOKEN_INVALID' || !code)
    ) {
      // No reintentar si es legacy o sesión revocada definitivamente
      if (
        code === 'LEGACY_TOKEN' ||
        code === 'SESSION_REVOKED' ||
        code === 'REFRESH_REUSED' ||
        code === 'ACCOUNT_INACTIVE'
      ) {
        clearAccessToken()
        localStorage.removeItem('token')
        window.location.href = '/#/login'
        return Promise.reject(error)
      }

      original._retry = true
      try {
        const token = await refreshAccessToken()
        if (token) {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        }
      } catch (_) {
        clearAccessToken()
        localStorage.removeItem('token')
        window.location.href = '/#/login'
        return Promise.reject(error)
      }
    }

    if (status === 401) {
      clearAccessToken()
      localStorage.removeItem('token')
      window.location.href = '/#/login'
    }

    return Promise.reject(error)
  }
)

export default api
