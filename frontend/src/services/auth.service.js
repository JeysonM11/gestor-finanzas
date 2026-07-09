import api from './api'

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async updateProfile(data) {
    const response = await api.put('/auth/profile', data)
    return response.data
  },

  async changePassword(data) {
    const response = await api.put('/auth/change-password', data)
    return response.data
  },

  async updatePreferences(data) {
    const response = await api.put('/auth/preferences', data)
    return response.data
  },

  async logout() {
    // Aquí podrías llamar a un endpoint de logout si existe
    localStorage.removeItem('token')
  }
}
