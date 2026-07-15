import { useState, useEffect } from 'react'
import { Card, Spinner } from '../components/ui'
import { transaccionService } from '../services/transaccion.service'
import { useAuth } from '../context/AuthContext'
import { TrendingUp, TrendingDown, Wallet, Calendar, Shield } from 'lucide-react'
import dayjs from 'dayjs'

const Dashboard = () => {
  const { isAdmin } = useAuth()
  const [resumen, setResumen] = useState(null)
  const [transacciones, setTransacciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [resumenData, transaccionesData] = await Promise.all([
        transaccionService.getResumen(),
        transaccionService.getAll({ limit: 5 })
      ])
      setResumen(resumenData)
      setTransacciones(transaccionesData.transacciones || transaccionesData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Spinner fullPage />
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {isAdmin && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <Shield className="h-4 w-4" />
              Administrador
            </span>
          )}
        </div>
        <p className="text-gray-500 mt-2">Resumen de tus finanzas</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-600">
                ${resumen?.totalIngresos?.toFixed(2) || '0.00'}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Gastos</p>
              <p className="text-2xl font-bold text-red-600">
                ${resumen?.totalGastos?.toFixed(2) || '0.00'}
              </p>
            </div>
            <TrendingDown className="h-12 w-12 text-red-600" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className={`text-2xl font-bold ${
                (resumen?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${resumen?.balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <Wallet className="h-12 w-12 text-primary-600" />
          </div>
        </Card>
      </div>

      {/* Transacciones recientes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Transacciones Recientes</h2>
          <Calendar className="h-5 w-5 text-gray-500" />
        </div>
        
        <div className="space-y-3">
          {transacciones.length > 0 ? (
            transacciones.map((transaccion) => (
              <div 
                key={transaccion.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{transaccion.descripcion}</p>
                  <p className="text-sm text-gray-500">
                    {dayjs(transaccion.fecha).format('DD/MM/YYYY')} • {transaccion.categoria || 'Sin categoría'}
                  </p>
                </div>
                <p className={`text-lg font-bold ${
                  transaccion.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaccion.tipo === 'INGRESO' ? '+' : '-'}${transaccion.monto.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No hay transacciones recientes</p>
          )}
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
