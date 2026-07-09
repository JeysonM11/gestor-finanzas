import api from './api'

export const reporteService = {
  async getAgregados(params = {}) {
    const response = await api.get('/reportes/agregados', { params })
    return response.data
  },

  async getGastosPorCategoria(params = {}) {
    try {
      const data = await this.getAgregados(params)
      return data.gastosPorCategoria || []
    } catch (error) {
      console.error('Error al obtener gastos por categoría:', error)
      return []
    }
  },

  async getEvolucionMensual(meses = 6) {
    try {
      const data = await this.getAgregados({ meses })
      return data.evolucionMensual || []
    } catch (error) {
      console.error('Error al obtener evolución mensual:', error)
      return []
    }
  },

  async getComparacionAnual() {
    try {
      const data = await this.getAgregados()
      return data.comparacionAnual || []
    } catch (error) {
      console.error('Error al obtener comparación anual:', error)
      return []
    }
  },

  async getTopCategorias(limit = 5) {
    try {
      const gastos = await this.getGastosPorCategoria()
      return gastos.slice(0, limit)
    } catch (error) {
      console.error('Error al obtener top categorías:', error)
      return []
    }
  },

  async exportarCSV(params = {}) {
    const response = await api.get('/reportes/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}
