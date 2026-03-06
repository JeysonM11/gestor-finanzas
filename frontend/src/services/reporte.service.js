import api from './api'

export const reporteService = {
  async getResumenMensual(params) {
    const response = await api.get('/reportes/resumen-mensual', { params })
    return response.data
  },

  async getGastosPorCategoria(params) {
    const response = await api.get('/reportes/gastos-por-categoria', { params })
    return response.data
  },

  async getEvolucion(params) {
    const response = await api.get('/reportes/evolucion', { params })
    return response.data
  },

  async exportar(tipo, params) {
    const response = await api.get(`/reportes/exportar/${tipo}`, { 
      params,
      responseType: 'blob'
    })
    return response.data
  }
}
