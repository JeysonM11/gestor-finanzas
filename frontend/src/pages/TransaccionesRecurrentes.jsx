import { useState, useEffect } from 'react'
import { Card, Button, Spinner, EmptyState } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalTransaccionRecurrente from '../components/recurrentes/ModalTransaccionRecurrente'
import { transaccionRecurrenteService } from '../services/transaccion-recurrente.service'
import { useToast } from '../context/ToastContext'
import { useCurrency } from '../hooks/useCurrency'
import { Plus, Play, Edit, Trash2, Calendar, ToggleLeft, ToggleRight, Clock } from 'lucide-react'
import dayjs from 'dayjs'

const TransaccionesRecurrentes = () => {
  const toast = useToast()
  const { formatMoney } = useCurrency()
  const [transacciones, setTransacciones] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [transaccionAEliminar, setTransaccionAEliminar] = useState(null)
  const [ejecutando, setEjecutando] = useState(false)

  useEffect(() => {
    cargarTransacciones()
  }, [])

  const cargarTransacciones = async () => {
    try {
      const data = await transaccionRecurrenteService.getAll()
      setTransacciones(data.transaccionesRecurrentes || data)
      setEstadisticas(data.estadisticas)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar recurrentes')
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = (transaccion) => {
    setTransaccionSeleccionada(transaccion)
    setModalAbierto(true)
  }

  const handleEliminar = (transaccion) => {
    setTransaccionAEliminar(transaccion)
    setConfirmDialogOpen(true)
  }

  const confirmarEliminar = async () => {
    if (!transaccionAEliminar) return

    try {
      await transaccionRecurrenteService.delete(transaccionAEliminar.id)
      toast.success('Recurrente eliminada')
      cargarTransacciones()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar')
    }
  }

  const handleEjecutar = async () => {
    setEjecutando(true)
    try {
      const data = await transaccionRecurrenteService.ejecutar()
      toast.success(data.message || 'Pendientes ejecutadas')
      cargarTransacciones()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al ejecutar pendientes')
    } finally {
      setEjecutando(false)
    }
  }

  const handleToggleActivo = async (id, activa) => {
    try {
      await transaccionRecurrenteService.toggleActivo(id, !activa)
      cargarTransacciones()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado')
    }
  }

  const handleCloseModal = () => {
    setModalAbierto(false)
    setTransaccionSeleccionada(null)
  }

  const handleTransaccionGuardada = () => {
    cargarTransacciones()
  }

  const getFrecuenciaBadge = (frecuencia) => {
    const colores = {
      'DIARIA': 'bg-purple-100 text-purple-800',
      'SEMANAL': 'bg-blue-100 text-blue-800',
      'QUINCENAL': 'bg-cyan-100 text-cyan-800',
      'MENSUAL': 'bg-green-100 text-green-800',
      'ANUAL': 'bg-orange-100 text-orange-800'
    }
    return colores[frecuencia] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <Spinner fullPage />
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Transacciones Recurrentes</h1>
          <p className="page-subtitle">Automatiza tus pagos e ingresos periódicos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={handleEjecutar}
            variant="secondary"
            disabled={ejecutando}
            className="w-full sm:w-auto shrink-0"
          >
            <Play className="h-4 w-4" />
            {ejecutando ? 'Ejecutando...' : 'Forzar ahora'}
          </Button>
          <Button onClick={() => setModalAbierto(true)} className="w-full sm:w-auto shrink-0">
            <Plus className="h-4 w-4" />
            Nueva Recurrente
          </Button>
        </div>
      </div>

      <ModalTransaccionRecurrente
        isOpen={modalAbierto}
        onClose={handleCloseModal}
        onSuccess={handleTransaccionGuardada}
        transaccion={transaccionSeleccionada}
      />

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmarEliminar}
        title="¿Eliminar transacción recurrente?"
        message="Esta acción no se puede deshacer. La transacción recurrente será eliminada permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {estadisticas && (
        <div className="stat-grid sm:grid-cols-3 xl:grid-cols-3">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-muted">Total Recurrentes</p>
                <p className="text-2xl font-bold text-ink">{estadisticas.total || 0}</p>
              </div>
              <Calendar className="h-10 w-10 text-primary-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-muted">Activas</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.activas || 0}</p>
              </div>
              <ToggleRight className="h-10 w-10 text-green-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-muted">Inactivas</p>
                <p className="text-2xl font-bold text-ink-subtle">{estadisticas.inactivas || 0}</p>
              </div>
              <ToggleLeft className="h-10 w-10 text-ink-subtle" />
            </div>
          </Card>
        </div>
      )}

      {transacciones.length > 0 ? (
        <div className="card-grid">
          {transacciones.map((transaccion) => (
            <Card key={transaccion.id} hover className={!transaccion.activa ? 'opacity-60' : ''}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-ink">{transaccion.nombre}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getFrecuenciaBadge(transaccion.frecuencia)}`}>
                        {transaccion.frecuencia}
                      </span>
                    </div>
                    {transaccion.descripcion && (
                      <p className="text-sm text-ink-muted">{transaccion.descripcion}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleToggleActivo(transaccion.id, transaccion.activa)}
                    aria-label={transaccion.activa ? 'Desactivar' : 'Activar'}
                    className="shrink-0"
                  >
                    {transaccion.activa ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-ink-subtle" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-line">
                  <div>
                    <p className="text-xs text-ink-subtle mb-1">Monto</p>
                    <p className={`text-xl font-bold ${transaccion.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaccion.tipo === 'INGRESO' ? '+' : '-'}
                      {formatMoney(transaccion.monto)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-subtle mb-1">Categoría</p>
                    <p className="text-sm font-medium text-ink">{transaccion.categoria || 'Sin categoría'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-ink-subtle shrink-0" />
                  <span className="text-ink-muted">
                    Próxima ejecución:{' '}
                    <span className="font-medium text-ink">
                      {transaccion.proximaEjecucion
                        ? dayjs(transaccion.proximaEjecucion).format('DD/MM/YYYY')
                        : 'No programada'}
                    </span>
                  </span>
                </div>

                {transaccion.transacciones && transaccion.transacciones.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-ink-subtle mb-2">Últimas ejecuciones:</p>
                    <div className="space-y-1">
                      {transaccion.transacciones.slice(0, 3).map((t, idx) => (
                        <div key={idx} className="text-xs text-ink-muted flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                          {dayjs(t.fecha).format('DD/MM/YYYY')} - {formatMoney(t.monto)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 pt-3 border-t border-line">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEditar(transaccion)}
                    aria-label="Editar recurrente"
                  >
                    <Edit className="h-4 w-4 text-primary-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEliminar(transaccion)}
                    aria-label="Eliminar recurrente"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Calendar className="h-16 w-16" />}
            title="No hay transacciones recurrentes"
            description="Crea tu primera transacción recurrente para automatizar pagos"
            action={
              <Button onClick={() => setModalAbierto(true)}>
                <Plus className="h-4 w-4" />
                Nueva Recurrente
              </Button>
            }
          />
        </Card>
      )}
    </div>
  )
}

export default TransaccionesRecurrentes
