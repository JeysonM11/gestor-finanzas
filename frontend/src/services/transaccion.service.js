import api from './api'

export const transaccionService = {
  async getAll(params) {
    const response = await api.get('/transacciones', { params })
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/transacciones/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/transacciones', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/transacciones/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/transacciones/${id}`)
    return response.data
  },

  async getResumen(params) {
    const response = await api.get('/transacciones/resumen', { params })
    return response.data
  }
}
