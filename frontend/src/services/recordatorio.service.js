import api from './api'

export const recordatorioService = {
  async getAll(params) {
    const response = await api.get('/sistema/recordatorios', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/sistema/recordatorios/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/sistema/recordatorios', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/sistema/recordatorios/${id}`, data)
    return response.data
  },

  async completar(id) {
    const response = await api.put(`/sistema/recordatorios/${id}/completar`)
    return response.data
  },

  async reactivar(id) {
    const response = await api.put(`/sistema/recordatorios/${id}/reactivar`)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/sistema/recordatorios/${id}`)
    return response.data
  },

  async ejecutar() {
    const response = await api.post('/sistema/recordatorios/ejecutar')
    return response.data
  },
}
