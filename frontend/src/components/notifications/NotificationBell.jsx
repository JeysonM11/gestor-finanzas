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
    const intervalo = setInterval(cargarNotificaciones, 60000)
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
      setNotificaciones(notifs.slice(0, 5))
      setNoLeidas(notifs.filter((n) => !n.leida).length)
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
        type="button"
        onClick={() => setMostrarDropdown(!mostrarDropdown)}
        className="relative p-2 text-ink-muted hover:text-ink hover:bg-surface-muted rounded-control transition-colors"
        aria-label={`Notificaciones${noLeidas > 0 ? `, ${noLeidas} sin leer` : ''}`}
        aria-expanded={mostrarDropdown}
      >
        <Bell className="h-5 w-5" />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {mostrarDropdown && (
        <div className="absolute right-0 mt-2 w-[min(100vw-1.5rem,22rem)] bg-surface rounded-card shadow-dropdown border border-line z-50 animate-scale-in origin-top-right">
          <div className="p-3.5 border-b border-line">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">Notificaciones</h3>
              {noLeidas > 0 && (
                <span className="text-xs text-ink-subtle">{noLeidas} sin leer</span>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length > 0 ? (
              notificaciones.map((notif) => (
                <button
                  type="button"
                  key={notif.id}
                  className={`w-full text-left p-3.5 border-b border-line last:border-0 hover:bg-surface-muted transition-colors ${
                    !notif.leida ? 'bg-primary-50/40' : ''
                  }`}
                  onClick={() => {
                    if (!notif.leida) handleMarcarLeida(notif.id)
                  }}
                >
                  <div className="flex items-start gap-3">
                    {!notif.leida && (
                      <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{notif.titulo}</p>
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{notif.mensaje}</p>
                      <p className="text-[11px] text-ink-subtle mt-1">
                        {dayjs(notif.fechaEnvio || notif.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-ink-muted">
                <Bell className="h-10 w-10 mx-auto mb-2 text-ink-subtle/60" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            )}
          </div>

          <div className="p-2.5 border-t border-line bg-surface-muted/50">
            <Link
              to="/notificaciones"
              onClick={() => setMostrarDropdown(false)}
              className="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-1.5 rounded-control hover:bg-surface"
            >
              Ver todas
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
