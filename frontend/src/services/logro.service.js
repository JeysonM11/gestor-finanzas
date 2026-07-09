import api from './api'

export const logroService = {
  async getAll() {
    const response = await api.get('/finanzas/logros')
    return response.data
  },

  async getResumen() {
    const response = await api.get('/finanzas/logros/resumen')
    return response.data
  },

  async getHistorialPuntos() {
    const response = await api.get('/finanzas/logros/historial')
    return response.data
  },

  async verificar() {
    const response = await api.post('/finanzas/logros/verificar')
    return response.data
  }
}
