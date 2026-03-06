import api from './api'

export const transaccionRecurrenteService = {
  async getAll() {
    const response = await api.get('/sistema/recurrentes')
    return response.data
  },

  async create(data) {
    const response = await api.post('/sistema/recurrentes', data)
    return response.data
  },

  async ejecutar() {
    const response = await api.post('/sistema/recurrentes/ejecutar')
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/sistema/recurrentes/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/sistema/recurrentes/${id}`)
    return response.data
  },

  async toggleActivo(id, activa) {
    const response = await api.put(`/sistema/recurrentes/${id}/toggle`, { activa })
    return response.data
  }
}
