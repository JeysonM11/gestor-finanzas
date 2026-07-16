import api from './api'

export const asesorService = {
  async generar({ estrategia, presupuestoExtra } = {}) {
    const body = {}
    if (estrategia) body.estrategia = estrategia
    if (presupuestoExtra !== undefined && presupuestoExtra !== null && presupuestoExtra !== '') {
      body.presupuestoExtra = Number(presupuestoExtra)
    }
    const response = await api.post('/finanzas/asesor/generar', body)
    return response.data
  },

  async getUltimo() {
    const response = await api.get('/finanzas/asesor/ultimo')
    return response.data
  },

  async getPlanes() {
    const response = await api.get('/finanzas/asesor/planes')
    return response.data
  },

  async getPlan(id) {
    const response = await api.get(`/finanzas/asesor/planes/${id}`)
    return response.data
  },
}
