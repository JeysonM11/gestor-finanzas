import api from './api'

export const reporteService = {
  // Obtener gastos por categoría
  async getGastosPorCategoria(params = {}) {
    try {
      const response = await api.get('/transacciones', { params: { ...params, limit: 1000 } })
      const transacciones = response.data.transacciones || response.data
      
      // Agrupar gastos por categoría
      const gastosPorCategoria = {}
      transacciones
        .filter(t => t.tipo === 'GASTO')
        .forEach(t => {
          const categoria = t.categoria || 'Sin categoría'
          if (!gastosPorCategoria[categoria]) {
            gastosPorCategoria[categoria] = 0
          }
          gastosPorCategoria[categoria] += t.monto
        })
      
      return Object.entries(gastosPorCategoria)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value) // Ordenar por valor descendente
    } catch (error) {
      console.error('Error al obtener gastos por categoría:', error)
      return []
    }
  },

  // Obtener evolución mensual
  async getEvolucionMensual(meses = 6) {
    try {
      const fechaFin = new Date()
      const fechaInicio = new Date()
      fechaInicio.setMonth(fechaInicio.getMonth() - meses)
      
      const response = await api.get('/transacciones', { 
        params: { 
          fechaInicio: fechaInicio.toISOString().split('T')[0],
          fechaFin: fechaFin.toISOString().split('T')[0],
          limit: 10000
        } 
      })
      const transacciones = response.data.transacciones || response.data
      
      // Agrupar por mes
      const data = {}
      transacciones.forEach(t => {
        const fecha = new Date(t.fecha)
        const mes = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
        
        if (!data[mesKey]) {
          data[mesKey] = { mes, ingresos: 0, gastos: 0 }
        }
        
        if (t.tipo === 'INGRESO') {
          data[mesKey].ingresos += t.monto
        } else if (t.tipo === 'GASTO') {
          data[mesKey].gastos += t.monto
        }
      })
      
      return Object.values(data).sort((a, b) => {
        const [aYear, aMonth] = Object.keys(data).find(k => data[k] === a).split('-')
        const [bYear, bMonth] = Object.keys(data).find(k => data[k] === b).split('-')
        return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1)
      })
    } catch (error) {
      console.error('Error al obtener evolución mensual:', error)
      return []
    }
  },

  // Obtener comparación anual
  async getComparacionAnual() {
    try {
      const añoActual = new Date().getFullYear()
      const fechaInicio = new Date(añoActual, 0, 1)
      const fechaFin = new Date(añoActual, 11, 31)
      
      const response = await api.get('/transacciones', { 
        params: { 
          fechaInicio: fechaInicio.toISOString().split('T')[0],
          fechaFin: fechaFin.toISOString().split('T')[0],
          limit: 10000
        } 
      })
      const transacciones = response.data.transacciones || response.data
      
      const totalIngresos = transacciones
        .filter(t => t.tipo === 'INGRESO')
        .reduce((sum, t) => sum + t.monto, 0)
        
      const totalGastos = transacciones
        .filter(t => t.tipo === 'GASTO')
        .reduce((sum, t) => sum + t.monto, 0)
      
      return [
        { name: 'Ingresos', value: totalIngresos, fill: '#10B981' },
        { name: 'Gastos', value: totalGastos, fill: '#EF4444' }
      ]
    } catch (error) {
      console.error('Error al obtener comparación anual:', error)
      return []
    }
  },

  // Obtener top categorías de gastos
  async getTopCategorias(limit = 5) {
    try {
      const gastos = await this.getGastosPorCategoria()
      return gastos.slice(0, limit)
    } catch (error) {
      console.error('Error al obtener top categorías:', error)
      return []
    }
  }
}
