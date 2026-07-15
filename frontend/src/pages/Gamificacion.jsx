import { useState, useEffect } from 'react'
import { Trophy, Star, Target, TrendingUp, Award, Zap, Lock, CheckCircle } from 'lucide-react'
import { Card, Spinner, EmptyState, CardTitle } from '../components/ui'
import { logroService } from '../services/logro.service'
import { useToast } from '../context/ToastContext'

const Gamificacion = () => {
  const toast = useToast()
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
      toast.error(error.response?.data?.message || 'Error al cargar gamificación')
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
      GAMIFICACION: 'bg-slate-100 text-slate-600'
    }
    return colors[tipo] || colors.GAMIFICACION
  }

  const getNivelInfo = (nivel) => {
    const niveles = {
      1: { nombre: 'Principiante', color: 'text-ink-muted', bg: 'bg-slate-100' },
      2: { nombre: 'Aprendiz', color: 'text-blue-600', bg: 'bg-blue-100' },
      3: { nombre: 'Entusiasta', color: 'text-green-600', bg: 'bg-green-100' },
      4: { nombre: 'Experto', color: 'text-purple-600', bg: 'bg-purple-100' },
      5: { nombre: 'Maestro', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    }
    return niveles[nivel] || niveles[1]
  }

  if (loading) {
    return <Spinner fullPage />
  }

  const nivelInfo = getNivelInfo(resumen?.nivel || 1)
  const progresoNivel = resumen?.progresoNivel || 0

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Gamificación</h1>
          <p className="page-subtitle">Alcanza logros y mejora tus hábitos financieros</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-card shadow-card p-6 sm:p-8 text-white">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Nivel {resumen?.nivel || 1}</h2>
            <p className="text-primary-100 text-base sm:text-lg">{nivelInfo.nombre}</p>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary-100">Progreso al siguiente nivel</span>
            <span className="font-semibold">{progresoNivel}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
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
            <div className="text-right">
              <p className="text-primary-100 text-sm">Logros Desbloqueados</p>
              <p className="text-2xl font-bold">
                {logros.filter((l) => l.desbloqueado).length} / {logros.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <CardTitle className="mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-600" />
          Logros
        </CardTitle>

        {logros.length > 0 ? (
          <div className="card-grid">
            {logros.map((logro) => {
              const Icon = getLogroIcon(logro.tipo)
              const colorClasses = getLogroColor(logro.tipo)
              const isDesbloqueado = logro.desbloqueado

              return (
                <Card
                  key={logro.id}
                  hover={isDesbloqueado}
                  className={!isDesbloqueado ? 'opacity-60' : ''}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                      {isDesbloqueado ? (
                        <Icon className="w-7 h-7" />
                      ) : (
                        <Lock className="w-7 h-7 text-ink-subtle" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold mb-1 ${isDesbloqueado ? 'text-ink' : 'text-ink-muted'}`}>
                        {logro.nombre}
                      </h3>
                      <p className="text-sm text-ink-muted mb-3">{logro.descripcion}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`flex items-center gap-1 text-sm font-medium ${isDesbloqueado ? 'text-primary-600' : 'text-ink-subtle'}`}>
                          <Star className="w-4 h-4" />
                          {logro.puntos} pts
                        </span>
                        {isDesbloqueado && logro.fechaDesbloqueo && (
                          <span className="text-xs text-ink-subtle">
                            {new Date(logro.fechaDesbloqueo).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<Award className="w-16 h-16" />}
              title="No hay logros disponibles"
              description="Los logros se desbloquearán automáticamente según tus acciones"
            />
          </Card>
        )}
      </div>

      {historial.length > 0 && (
        <div>
          <CardTitle className="mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary-600" />
            Historial de Puntos
          </CardTitle>

          <Card padding={false}>
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th className="text-right">Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap text-ink-muted">
                        {new Date(item.fecha).toLocaleDateString()}
                      </td>
                      <td>{item.descripcion}</td>
                      <td className="whitespace-nowrap text-right">
                        <span className={`font-semibold tabular-nums ${item.puntos > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.puntos > 0 ? '+' : ''}{item.puntos}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Gamificacion
