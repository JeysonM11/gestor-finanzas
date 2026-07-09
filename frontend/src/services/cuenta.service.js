import api from './api'

export const cuentaService = {
  async getAll() {
    const response = await api.get('/finanzas/cuentas')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/finanzas/cuentas/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/finanzas/cuentas', data)
    return response.data
  },

  async updateSaldo(id, nuevoSaldo, motivo) {
    const response = await api.put(`/finanzas/cuentas/${id}/saldo`, {
      nuevoSaldo,
      ...(motivo ? { motivo } : {}),
    })
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/finanzas/cuentas/${id}`)
    return response.data
  }
}
