import api from './api'

export const presupuestoService = {
  async getAll(params) {
    const response = await api.get('/finanzas/presupuestos', { params })
    return response.data
  },

  async create(data) {
    const response = await api.post('/finanzas/presupuestos', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/finanzas/presupuestos/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/finanzas/presupuestos/${id}`)
    return response.data
  },

  async sincronizar(params) {
    const response = await api.post('/finanzas/presupuestos/sincronizar', params || {})
    return response.data
  },
}
