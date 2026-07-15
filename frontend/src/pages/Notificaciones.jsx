import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { notificacionService } from '../services/notificacion.service'
import { useToast } from '../context/ToastContext'
import { Bell, Check, CheckCheck, Trash2, AlertCircle, Info, CheckCircle } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

const Notificaciones = () => {
  const toast = useToast()
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('todas') // 'todas', 'noLeidas', 'leidas'

  useEffect(() => {
    cargarNotificaciones()
  }, [])

  const cargarNotificaciones = async () => {
    try {
      const data = await notificacionService.getAll()
      setNotificaciones(data.notificaciones || data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarLeida = async (id) => {
    try {
      await notificacionService.marcarLeida(id)
      cargarNotificaciones()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al marcar como leída')
    }
  }

  const handleMarcarTodasLeidas = async () => {
    try {
      await notificacionService.marcarTodasLeidas()
      cargarNotificaciones()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al marcar todas')
    }
  }

  const handleEliminar = async (id) => {
    try {
      await notificacionService.delete(id)
      cargarNotificaciones()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar notificación')
    }
  }

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'LOGRO':
      case 'EXITO':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'ALERTA':
      case 'ADVERTENCIA':
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'RECORDATORIO':
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getTipoBgColor = (tipo) => {
    switch(tipo) {
      case 'LOGRO':
      case 'EXITO':
        return 'bg-green-50 border-green-200'
      case 'ALERTA':
      case 'ADVERTENCIA':
      case 'ERROR':
        return 'bg-yellow-50 border-yellow-200'
      case 'RECORDATORIO':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtro === 'noLeidas') return !n.leida
    if (filtro === 'leidas') return n.leida
    return true
  })

  const noLeidas = notificaciones.filter(n => !n.leida).length

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
          <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600">
            {noLeidas > 0 ? `Tienes ${noLeidas} notificación${noLeidas > 1 ? 'es' : ''} sin leer` : 'No tienes notificaciones pendientes'}
          </p>
        </div>
        {noLeidas > 0 && (
          <Button onClick={handleMarcarTodasLeidas} variant="secondary">
            <CheckCheck className="h-5 w-5 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtro === 'todas' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({notificaciones.length})
          </button>
          <button
            onClick={() => setFiltro('noLeidas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtro === 'noLeidas' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            No leídas ({noLeidas})
          </button>
          <button
            onClick={() => setFiltro('leidas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtro === 'leidas' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Leídas ({notificaciones.length - noLeidas})
          </button>
        </div>
      </Card>

      {/* Lista de notificaciones */}
      {notificacionesFiltradas.length > 0 ? (
        <div className="space-y-3">
          {notificacionesFiltradas.map((notif) => (
            <Card
              key={notif.id}
              className={`${getTipoBgColor(notif.tipo)} border ${!notif.leida ? 'border-l-4' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getTipoIcon(notif.tipo)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{notif.titulo}</h3>
                    {!notif.leida && (
                      <span className="inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notif.mensaje}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {dayjs(notif.fechaEnvio || notif.createdAt).fromNow()}
                    </span>
                    <div className="flex items-center gap-2">
                      {!notif.leida && (
                        <button
                          onClick={() => handleMarcarLeida(notif.id)}
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <Check className="h-4 w-4" />
                          Marcar como leída
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminar(notif.id)}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filtro === 'todas' 
                ? 'No hay notificaciones'
                : filtro === 'noLeidas'
                ? 'No hay notificaciones sin leer'
                : 'No hay notificaciones leídas'}
            </h3>
            <p className="text-gray-500">
              Las nuevas notificaciones aparecerán aquí
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Notificaciones
