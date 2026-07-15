import { useState, useEffect } from 'react'
import { Card, Spinner, CardTitle } from '../components/ui'
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
    return <Spinner fullPage />
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">Análisis detallado de tus finanzas</p>
        </div>
      </div>

      {comparacionAnual.length > 0 && (
        <div className="stat-grid sm:grid-cols-2 xl:grid-cols-2">
          {comparacionAnual.map((item, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-muted">{item.name}</p>
                  <p className={`text-3xl font-bold ${
                    item.name === 'Ingresos' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${item.value.toFixed(2)}
                  </p>
                  <p className="text-xs text-ink-subtle mt-1">Año {new Date().getFullYear()}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-ink-subtle" />
              <CardTitle>Gastos por Categoría</CardTitle>
            </div>
          </div>
          
          {gastosPorCategoria.length > 0 ? (
            <div className="w-full overflow-x-auto min-w-0">
              <ResponsiveContainer width="100%" height={300} minWidth={280}>
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
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-ink-subtle">
              No hay datos de gastos
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-ink-subtle" />
              <CardTitle>Top Categorías</CardTitle>
            </div>
          </div>
          
          {gastosPorCategoria.length > 0 ? (
            <div className="w-full overflow-x-auto min-w-0">
              <ResponsiveContainer width="100%" height={300} minWidth={280}>
              <BarChart data={gastosPorCategoria.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-ink-subtle">
              No hay datos disponibles
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-ink-subtle" />
            <CardTitle>Evolución Mensual</CardTitle>
          </div>
        </div>
        
        {evolucionMensual.length > 0 ? (
          <div className="w-full overflow-x-auto min-w-0">
            <ResponsiveContainer width="100%" height={350} minWidth={320}>
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
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center text-ink-subtle">
            No hay datos para mostrar la evolución mensual
          </div>
        )}
      </Card>

      {gastosPorCategoria.length > 0 && (
        <Card>
          <CardTitle className="mb-4">Resumen por Categoría</CardTitle>
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th className="text-right">Total Gastado</th>
                  <th className="text-right">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {gastosPorCategoria.map((item, index) => {
                  const total = gastosPorCategoria.reduce((sum, cat) => sum + cat.value, 0)
                  const porcentaje = ((item.value / total) * 100).toFixed(1)
                  
                  return (
                    <tr key={index}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-right tabular-nums">
                        ${item.value.toFixed(2)}
                      </td>
                      <td className="text-right text-ink-muted tabular-nums">
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
