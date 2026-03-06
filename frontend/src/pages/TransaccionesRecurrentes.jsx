import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalTransaccionRecurrente from '../components/recurrentes/ModalTransaccionRecurrente'
import { transaccionRecurrenteService } from '../services/transaccion-recurrente.service'
import { Plus, Play, Edit, Trash2, Calendar, ToggleLeft, ToggleRight, Clock } from 'lucide-react'
import dayjs from 'dayjs'

const TransaccionesRecurrentes = () => {
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
      console.error('Error al cargar transacciones recurrentes:', error)
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
      cargarTransacciones()
    } catch (error) {
      console.error('Error al eliminar transacción recurrente:', error)
    }
  }

  const handleEjecutar = async () => {
    setEjecutando(true)
    try {
      await transaccionRecurrenteService.ejecutar()
      cargarTransacciones()
    } catch (error) {
      console.error('Error al ejecutar transacciones:', error)
    } finally {
      setEjecutando(false)
    }
  }

  const handleToggleActivo = async (id, activa) => {
    try {
      await transaccionRecurrenteService.toggleActivo(id, !activa)
      cargarTransacciones()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">Transacciones Recurrentes</h1>
          <p className="text-gray-600">Automatiza tus pagos e ingresos periódicos</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleEjecutar}
            variant="secondary"
            disabled={ejecutando}
          >
            <Play className="h-5 w-5 mr-2" />
            {ejecutando ? 'Ejecutando...' : 'Ejecutar Pendientes'}
          </Button>
          <Button onClick={() => setModalAbierto(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Nueva Recurrente
          </Button>
        </div>
      </div>

      {/* Modal */}
      <ModalTransaccionRecurrente 
        isOpen={modalAbierto}
        onClose={handleCloseModal}
        onSuccess={handleTransaccionGuardada}
        transaccion={transaccionSeleccionada}
      />

      {/* Dialog de confirmación */}
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

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Recurrentes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total || 0}</p>
              </div>
              <Calendar className="h-10 w-10 text-primary-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activas</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.activas || 0}</p>
              </div>
              <ToggleRight className="h-10 w-10 text-green-600" />
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactivas</p>
                <p className="text-2xl font-bold text-gray-400">{estadisticas.inactivas || 0}</p>
              </div>
              <ToggleLeft className="h-10 w-10 text-gray-400" />
            </div>
          </Card>
        </div>
      )}

      {/* Lista de transacciones recurrentes */}
      {transacciones.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {transacciones.map((transaccion) => (
            <Card key={transaccion.id} className={`${!transaccion.activa ? 'opacity-60' : ''}`}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">{transaccion.nombre}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getFrecuenciaBadge(transaccion.frecuencia)}`}>
                        {transaccion.frecuencia}
                      </span>
                    </div>
                    {transaccion.descripcion && (
                      <p className="text-sm text-gray-500">{transaccion.descripcion}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleActivo(transaccion.id, transaccion.activa)}
                    className="ml-2"
                    title={transaccion.activa ? 'Desactivar' : 'Activar'}
                  >
                    {transaccion.activa ? (
                      <ToggleRight className="h-6 w-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Monto</p>
                    <p className={`text-xl font-bold ${transaccion.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaccion.tipo === 'INGRESO' ? '+' : '-'}${transaccion.monto.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Categoría</p>
                    <p className="text-sm font-medium text-gray-900">{transaccion.categoria || 'Sin categoría'}</p>
                  </div>
                </div>

                {/* Próxima ejecución */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    Próxima ejecución: {' '}
                    <span className="font-medium text-gray-900">
                      {transaccion.proximaEjecucion 
                        ? dayjs(transaccion.proximaEjecucion).format('DD/MM/YYYY')
                        : 'No programada'}
                    </span>
                  </span>
                </div>

                {/* Historial reciente */}
                {transaccion.transacciones && transaccion.transacciones.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Últimas ejecuciones:</p>
                    <div className="space-y-1">
                      {transaccion.transacciones.slice(0, 3).map((t, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          {dayjs(t.fecha).format('DD/MM/YYYY')} - ${t.monto.toFixed(2)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEditar(transaccion)}
                    className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEliminar(transaccion)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay transacciones recurrentes</h3>
            <p className="text-gray-500 mb-6">Crea tu primera transacción recurrente para automatizar pagos</p>
            <Button onClick={() => setModalAbierto(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Nueva Recurrente
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default TransaccionesRecurrentes
