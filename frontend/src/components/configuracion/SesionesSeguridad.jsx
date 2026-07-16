import { useState, useEffect } from 'react'
import { Card, Button, Spinner, EmptyState, Badge } from '../ui'
import ConfirmDialog from '../common/ConfirmDialog'
import { authService } from '../../services/auth.service'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { Monitor, LogOut, Shield } from 'lucide-react'
import { formatDate } from '../../utils/date'

/**
 * Gestión de sesiones activas (Sprint D — Configuración → Seguridad).
 */
const SesionesSeguridad = () => {
  const toast = useToast()
  const { logout } = useAuth()
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [cerrando, setCerrando] = useState(false)
  const [confirmOtras, setConfirmOtras] = useState(false)
  const [sesionACerrar, setSesionACerrar] = useState(null)

  const cargar = async () => {
    try {
      setLoading(true)
      const data = await authService.getSessions()
      setSesiones(data.sesiones || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar sesiones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const cerrarSesion = async (sesion) => {
    try {
      setCerrando(true)
      const data = await authService.deleteSession(sesion.id)
      if (data.sesionActual) {
        await authService.logout()
        logout()
        return
      }
      toast.success('Sesión cerrada')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cerrar sesión')
    } finally {
      setCerrando(false)
      setSesionACerrar(null)
    }
  }

  const cerrarOtras = async () => {
    try {
      setCerrando(true)
      const data = await authService.deleteOtherSessions()
      toast.success(
        data.cerradas > 0
          ? `${data.cerradas} sesión(es) cerrada(s)`
          : data.message || 'No había otras sesiones activas'
      )
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cerrar sesiones')
    } finally {
      setCerrando(false)
      setConfirmOtras(false)
    }
  }

  return (
    <>
      <Card className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" />
              Sesiones activas
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              Dispositivos donde has iniciado sesión. Cierra las que no reconozcas.
            </p>
          </div>
          {sesiones.length > 1 && (
            <Button
              variant="outline"
              onClick={() => setConfirmOtras(true)}
              disabled={cerrando}
              className="w-full sm:w-auto shrink-0"
            >
              <LogOut className="h-4 w-4" />
              Cerrar otras sesiones
            </Button>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : sesiones.length === 0 ? (
          <EmptyState
            icon={<Monitor className="h-12 w-12" />}
            title="Sin sesiones activas"
            description="Inicia sesión de nuevo para registrar este dispositivo."
          />
        ) : (
          <ul className="divide-y divide-line">
            {sesiones.map((s) => (
              <li
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Monitor className="h-4 w-4 text-ink-subtle shrink-0" />
                    <p className="font-medium text-ink">{s.dispositivo || 'Dispositivo'}</p>
                    {s.actual && <Badge variant="green">Esta sesión</Badge>}
                  </div>
                  <p className="text-sm text-ink-muted mt-1">
                    {s.ip ? `IP: ${s.ip} · ` : ''}
                    Inicio: {formatDate(s.createdAt)}
                    {s.fechaExpiracion && ` · Expira: ${formatDate(s.fechaExpiracion)}`}
                  </p>
                </div>
                {!s.actual && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cerrando}
                    onClick={() => setSesionACerrar(s)}
                    className="w-full sm:w-auto shrink-0"
                  >
                    Cerrar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        isOpen={!!sesionACerrar}
        onClose={() => setSesionACerrar(null)}
        onConfirm={() => cerrarSesion(sesionACerrar)}
        title="¿Cerrar esta sesión?"
        message={`Se cerrará la sesión en ${sesionACerrar?.dispositivo || 'ese dispositivo'}.`}
        confirmText="Cerrar sesión"
        type="warning"
      />

      <ConfirmDialog
        isOpen={confirmOtras}
        onClose={() => setConfirmOtras(false)}
        onConfirm={cerrarOtras}
        title="¿Cerrar otras sesiones?"
        message="Se mantendrá activa solo la sesión actual. El resto deberá iniciar sesión de nuevo."
        confirmText="Cerrar otras"
        type="warning"
      />
    </>
  )
}

export default SesionesSeguridad
