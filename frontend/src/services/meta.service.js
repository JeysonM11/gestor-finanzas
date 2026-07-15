import api from './api'

export const metaService = {
  async getAll(params) {
    const response = await api.get('/finanzas/metas', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/finanzas/metas/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/finanzas/metas', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/finanzas/metas/${id}`, data)
    return response.data
  },

  async aportar(id, monto) {
    const response = await api.post(`/finanzas/metas/${id}/aportar`, { monto })
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/finanzas/metas/${id}`)
    return response.data
  },
}
