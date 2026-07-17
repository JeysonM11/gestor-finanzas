import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

/** Access token solo en memoria (refresh vía cookie HttpOnly) */
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
    const token = accessTokenMemory
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
      !String(original.url || '').includes('/auth/logout') &&
      (code === 'ACCESS_TOKEN_EXPIRED' || code === 'TOKEN_INVALID' || !code)
    ) {
      if (
        code === 'LEGACY_TOKEN' ||
        code === 'SESSION_REVOKED' ||
        code === 'REFRESH_REUSED' ||
        code === 'REFRESH_CONFLICT' ||
        code === 'ACCOUNT_INACTIVE'
      ) {
        clearAccessToken()
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
        window.location.href = '/#/login'
        return Promise.reject(error)
      }
    }

    if (status === 401 && !String(original?.url || '').includes('/auth/logout')) {
      clearAccessToken()
      window.location.href = '/#/login'
    }

    return Promise.reject(error)
  }
)

export default api
