import { useState, useEffect } from 'react'
import { Trophy, Star, Target, TrendingUp, Award, Zap, Lock, CheckCircle } from 'lucide-react'
import { logroService } from '../services/logro.service'

const Gamificacion = () => {
  const [resumen, setResumen] = useState(null)
  const [logros, setLogros] = useState([])
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resumenData, logrosData, historialData] = await Promise.all([
        logroService.getResumen(),
        logroService.getAll(),
        logroService.getHistorialPuntos()
      ])

      setResumen(resumenData)
      setLogros(logrosData.logros || [])
      setHistorial(historialData.historial || [])
    } catch (error) {
      console.error('Error al cargar datos de gamificación:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLogroIcon = (tipo) => {
    const icons = {
      HABITO: Target,
      AHORRO: TrendingUp,
      INVERSION: Star,
      DEUDA: CheckCircle,
      PRESUPUESTO: Zap,
      META: Award,
      GAMIFICACION: Award
    }
    return icons[tipo] || Award
  }

  const getLogroColor = (tipo) => {
    const colors = {
      HABITO: 'bg-blue-100 text-blue-600',
      AHORRO: 'bg-green-100 text-green-600',
      INVERSION: 'bg-yellow-100 text-yellow-600',
      DEUDA: 'bg-purple-100 text-purple-600',
      PRESUPUESTO: 'bg-orange-100 text-orange-600',
      META: 'bg-indigo-100 text-indigo-600',
      GAMIFICACION: 'bg-gray-100 text-gray-600'
    }
    return colors[tipo] || colors.GAMIFICACION
  }

  const getNivelInfo = (nivel) => {
    const niveles = {
      1: { nombre: 'Principiante', color: 'text-gray-600', bg: 'bg-gray-100' },
      2: { nombre: 'Aprendiz', color: 'text-blue-600', bg: 'bg-blue-100' },
      3: { nombre: 'Entusiasta', color: 'text-green-600', bg: 'bg-green-100' },
      4: { nombre: 'Experto', color: 'text-purple-600', bg: 'bg-purple-100' },
      5: { nombre: 'Maestro', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    }
    return niveles[nivel] || niveles[1]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const nivelInfo = getNivelInfo(resumen?.nivel || 1)
  const progresoNivel = resumen?.progresoNivel || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gamificación</h1>
        <p className="text-gray-600 mt-1">Alcanza logros y mejora tus hábitos financieros</p>
      </div>

      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Nivel {resumen?.nivel || 1}</h2>
            <p className="text-primary-100 text-lg">{nivelInfo.nombre}</p>
          </div>
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary-100">Progreso al siguiente nivel</span>
            <span className="font-semibold">{progresoNivel}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progresoNivel}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-primary-100 text-sm">Puntos Totales</p>
              <p className="text-2xl font-bold">{resumen?.totalPuntos || 0}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Logros Desbloqueados</p>
              <p className="text-2xl font-bold">
                {logros.filter((l) => l.desbloqueado).length} / {logros.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-primary-600" />
          Logros
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {logros.map((logro) => {
            const Icon = getLogroIcon(logro.tipo)
            const colorClasses = getLogroColor(logro.tipo)
            const isDesbloqueado = logro.desbloqueado

            return (
              <div
                key={logro.id}
                className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
                  isDesbloqueado
                    ? 'border-primary-200 hover:shadow-lg'
                    : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                    {isDesbloqueado ? (
                      <Icon className="w-7 h-7" />
                    ) : (
                      <Lock className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold mb-1 ${isDesbloqueado ? 'text-gray-900' : 'text-gray-500'}`}>
                      {logro.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{logro.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className={`flex items-center gap-1 text-sm font-medium ${isDesbloqueado ? 'text-primary-600' : 'text-gray-400'}`}>
                        <Star className="w-4 h-4" />
                        {logro.puntos} pts
                      </span>
                      {isDesbloqueado && logro.fechaDesbloqueo && (
                        <span className="text-xs text-gray-500">
                          {new Date(logro.fechaDesbloqueo).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {logros.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay logros disponibles</h3>
            <p className="text-gray-600">Los logros se desbloquearán automáticamente según tus acciones</p>
          </div>
        )}
      </div>

      {historial.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary-600" />
            Historial de Puntos
          </h2>

          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historial.slice(0, 10).map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(item.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.descripcion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`font-semibold ${item.puntos > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.puntos > 0 ? '+' : ''}{item.puntos}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gamificacion
