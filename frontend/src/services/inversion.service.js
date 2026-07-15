import api from './api'

export const inversionService = {
  async getAll() {
    const response = await api.get('/finanzas/inversiones')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/finanzas/inversiones/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/finanzas/inversiones', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/finanzas/inversiones/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/finanzas/inversiones/${id}`)
    return response.data
  },
}
