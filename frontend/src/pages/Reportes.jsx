import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import { reporteService } from '../services/reporte.service'
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts'
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Calendar } from 'lucide-react'

const Reportes = () => {
  const [gastosPorCategoria, setGastosPorCategoria] = useState([])
  const [evolucionMensual, setEvolucionMensual] = useState([])
  const [comparacionAnual, setComparacionAnual] = useState([])
  const [loading, setLoading] = useState(true)

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [gastos, evolucion, comparacion] = await Promise.all([
        reporteService.getGastosPorCategoria(),
        reporteService.getEvolucionMensual(6),
        reporteService.getComparacionAnual()
      ])
      
      setGastosPorCategoria(gastos)
      setEvolucionMensual(evolucion)
      setComparacionAnual(comparacion)
    } catch (error) {
      console.error('Error al cargar reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-2">Análisis detallado de tus finanzas</p>
        </div>
      </div>

      {/* Comparación Anual - Tarjetas */}
      {comparacionAnual.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparacionAnual.map((item, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.name}</p>
                  <p className={`text-3xl font-bold ${
                    item.name === 'Ingresos' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${item.value.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Año {new Date().getFullYear()}</p>
                </div>
                <div className={`p-4 rounded-full ${
                  item.name === 'Ingresos' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {item.name === 'Ingresos' ? (
                    <TrendingUp className={`h-8 w-8 ${
                      item.name === 'Ingresos' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  ) : (
                    <BarChart3 className="h-8 w-8 text-red-600" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Gastos por Categoría */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-bold text-gray-900">Gastos por Categoría</h2>
            </div>
          </div>
          
          {gastosPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gastosPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {gastosPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No hay datos de gastos
            </div>
          )}
        </Card>

        {/* Top Categorías - Barras */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-bold text-gray-900">Top Categorías</h2>
            </div>
          </div>
          
          {gastosPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gastosPorCategoria.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No hay datos disponibles
            </div>
          )}
        </Card>
      </div>

      {/* Evolución Mensual */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-bold text-gray-900">Evolución Mensual</h2>
          </div>
        </div>
        
        {evolucionMensual.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={evolucionMensual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ingresos" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Ingresos"
              />
              <Line 
                type="monotone" 
                dataKey="gastos" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Gastos"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-400">
            No hay datos para mostrar la evolución mensual
          </div>
        )}
      </Card>

      {/* Tabla de resumen */}
      {gastosPorCategoria.length > 0 && (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen por Categoría</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Gastado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentaje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gastosPorCategoria.map((item, index) => {
                  const total = gastosPorCategoria.reduce((sum, cat) => sum + cat.value, 0)
                  const porcentaje = ((item.value / total) * 100).toFixed(1)
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        ${item.value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {porcentaje}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Reportes
