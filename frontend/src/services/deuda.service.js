import api from './api'

export const deudaService = {
  async getAll() {
    const response = await api.get('/finanzas/deudas')
    return response.data
  },

  async getById(id) {
    const response = await api.get(`/finanzas/deudas/${id}`)
    return response.data
  },

  async create(data) {
    const response = await api.post('/finanzas/deudas', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/finanzas/deudas/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/finanzas/deudas/${id}`)
    return response.data
  },

  async registrarPago(deudaId, monto, fecha, cuentaOrigenId) {
    const response = await api.post(`/finanzas/deudas/${deudaId}/pagos`, {
      monto,
      fecha,
      ...(cuentaOrigenId != null ? { cuentaOrigenId } : {}),
    })
    return response.data
  },

  async getPagos(deudaId) {
    const response = await api.get(`/finanzas/deudas/${deudaId}/pagos`)
    return response.data
  }
}
