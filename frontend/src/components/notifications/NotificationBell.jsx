import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { notificacionService } from '../../services/notificacion.service'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)
dayjs.locale('es')

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState([])
  const [mostrarDropdown, setMostrarDropdown] = useState(false)
  const [noLeidas, setNoLeidas] = useState(0)
  const dropdownRef = useRef(null)

  useEffect(() => {
    cargarNotificaciones()
    const intervalo = setInterval(cargarNotificaciones, 60000) // Cada minuto
    
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const cargarNotificaciones = async () => {
    try {
      const data = await notificacionService.getAll()
      const notifs = data.notificaciones || data
      setNotificaciones(notifs.slice(0, 5)) // Solo las últimas 5
      setNoLeidas(notifs.filter(n => !n.leida).length)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    }
  }

  const handleMarcarLeida = async (id) => {
    try {
      await notificacionService.marcarLeida(id)
      cargarNotificaciones()
    } catch (error) {
      console.error('Error al marcar como leída:', error)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setMostrarDropdown(!mostrarDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {mostrarDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              {noLeidas > 0 && (
                <span className="text-xs text-gray-500">{noLeidas} sin leer</span>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length > 0 ? (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notif.leida ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notif.leida) handleMarcarLeida(notif.id)
                  }}
                >
                  <div className="flex items-start gap-3">
                    {!notif.leida && (
                      <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mt-2"></span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notif.titulo}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notif.mensaje}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {dayjs(notif.fechaEnvio || notif.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <Link
              to="/notificaciones"
              onClick={() => setMostrarDropdown(false)}
              className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver todas las notificaciones
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
