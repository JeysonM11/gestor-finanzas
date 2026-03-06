import api from './api'

export const notificacionService = {
  async getAll() {
    const response = await api.get('/sistema/notificaciones')
    return response.data
  },

  async create(data) {
    const response = await api.post('/sistema/notificaciones', data)
    return response.data
  },

  async marcarLeida(id) {
    const response = await api.put(`/sistema/notificaciones/${id}/leida`)
    return response.data
  },

  async marcarTodasLeidas() {
    const response = await api.put('/sistema/notificaciones/todas-leidas')
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/sistema/notificaciones/${id}`)
    return response.data
  },

  async getNoLeidas() {
    const response = await api.get('/sistema/notificaciones', { params: { leida: false } })
    return response.data
  }
}
