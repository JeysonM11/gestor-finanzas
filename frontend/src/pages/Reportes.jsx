import { useState } from 'react'
import Card from '../components/common/Card'
import { BarChart3, Download } from 'lucide-react'

const Reportes = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-2">Análisis detallado de tus finanzas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Gastos por Categoría</h2>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Gráfico de gastos por categoría
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Evolución Mensual</h2>
            <Download className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Gráfico de evolución mensual
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Anual</h2>
        <div className="h-96 flex items-center justify-center text-gray-400">
          Tabla de resumen anual
        </div>
      </Card>
    </div>
  )
}

export default Reportes
