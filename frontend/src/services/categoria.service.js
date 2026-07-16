import api from './api'

export const categoriaService = {
  async getAll(params) {
    const response = await api.get('/categorias', { params })
    return response.data
  },

  async getPersonalizadas() {
    const response = await api.get('/categorias', {
      params: { soloPersonalizadas: true },
    })
    return response.data
  },

  async getEstadisticas(params) {
    const response = await api.get('/categorias/estadisticas', { params })
    return response.data
  },

  async create(data) {
    const response = await api.post('/categorias', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/categorias/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/categorias/${id}`)
    return response.data
  },
}
