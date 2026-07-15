import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalInversion from '../components/inversiones/ModalInversion'
import { inversionService } from '../services/inversion.service'
import { Plus, TrendingUp, TrendingDown, Edit, Trash2, DollarSign, Percent } from 'lucide-react'
import dayjs from 'dayjs'

const Inversiones = () => {
  const [inversiones, setInversiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [inversionSeleccionada, setInversionSeleccionada] = useState(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [inversionAEliminar, setInversionAEliminar] = useState(null)

  useEffect(() => {
    cargarInversiones()
  }, [])

  const cargarInversiones = async () => {
    try {
      const data = await inversionService.getAll()
      setInversiones(data.inversiones || data)
    } catch (error) {
      console.error('Error al cargar inversiones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = (inversion) => {
    setInversionSeleccionada(inversion)
    setModalAbierto(true)
  }

  const handleEliminar = (inversion) => {
    setInversionAEliminar(inversion)
    setConfirmDialogOpen(true)
  }

  const confirmarEliminar = async () => {
    if (!inversionAEliminar) return
    
    try {
      await inversionService.delete(inversionAEliminar.id)
      cargarInversiones()
    } catch (error) {
      console.error('Error al eliminar inversión:', error)
    }
  }

  const handleCloseModal = () => {
    setModalAbierto(false)
    setInversionSeleccionada(null)
  }

  const handleInversionGuardada = () => {
    cargarInversiones()
  }

  const calcularRendimiento = (inversion) => {
    const inicial = inversion.montoInicial ?? inversion.montoInvertido ?? 0
    const actual = inversion.montoActual ?? inversion.valorActual ?? inicial
    const ganancia = actual - inicial
    const porcentaje = inicial > 0 ? (ganancia / inicial) * 100 : 0
    return { ganancia, porcentaje, inicial, actual }
  }

  const calcularTotales = () => {
    const totalInvertido = inversiones.reduce(
      (sum, inv) => sum + (inv.montoInicial ?? inv.montoInvertido ?? 0),
      0
    )
    const totalActual = inversiones.reduce(
      (sum, inv) => sum + (inv.montoActual ?? inv.valorActual ?? inv.montoInicial ?? inv.montoInvertido ?? 0),
      0
    )
    const gananciaTotal = totalActual - totalInvertido
    const rendimientoPromedio = totalInvertido > 0 ? (gananciaTotal / totalInvertido) * 100 : 0
    
    return { totalInvertido, totalActual, gananciaTotal, rendimientoPromedio }
  }

  const getTipoBadge = (tipo) => {
    const colores = {
      'ACCIONES': 'bg-blue-100 text-blue-800',
      'BONOS': 'bg-green-100 text-green-800',
      'FONDOS': 'bg-purple-100 text-purple-800',
      'FONDOS_MUTUOS': 'bg-purple-100 text-purple-800',
      'ETF': 'bg-indigo-100 text-indigo-800',
      'CRIPTOMONEDAS': 'bg-orange-100 text-orange-800',
      'BIENES_RAICES': 'bg-teal-100 text-teal-800',
      'COMMODITIES': 'bg-yellow-100 text-yellow-800',
      'OTROS': 'bg-gray-100 text-gray-800',
      'OTRO': 'bg-gray-100 text-gray-800'
    }
    return colores[tipo] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const totales = calcularTotales()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inversiones</h1>
          <p className="text-gray-600">Gestiona y monitorea tu portafolio de inversiones</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Nueva Inversión
        </Button>
      </div>

      {/* Modal */}
      <ModalInversion 
        isOpen={modalAbierto}
        onClose={handleCloseModal}
        onSuccess={handleInversionGuardada}
        inversion={inversionSeleccionada}
      />

      {/* Dialog de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmarEliminar}
        title="¿Eliminar inversión?"
        message="Esta acción no se puede deshacer. La inversión será eliminada permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Resumen de Portafolio */}
      {inversiones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Invertido</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totales.totalInvertido.toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-blue-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valor Actual</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totales.totalActual.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ganancia/Pérdida</p>
                <p className={`text-2xl font-bold ${totales.gananciaTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totales.gananciaTotal >= 0 ? '+' : ''}${totales.gananciaTotal.toFixed(2)}
                </p>
              </div>
              {totales.gananciaTotal >= 0 ? (
                <TrendingUp className="h-10 w-10 text-green-600" />
              ) : (
                <TrendingDown className="h-10 w-10 text-red-600" />
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rendimiento</p>
                <p className={`text-2xl font-bold ${totales.rendimientoPromedio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totales.rendimientoPromedio >= 0 ? '+' : ''}{totales.rendimientoPromedio.toFixed(2)}%
                </p>
              </div>
              <Percent className="h-10 w-10 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Lista de inversiones */}
      {inversiones.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {inversiones.map((inversion) => {
            const { ganancia, porcentaje, inicial, actual } = calcularRendimiento(inversion)
            const esPositivo = ganancia >= 0

            return (
              <Card key={inversion.id}>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">{inversion.nombre}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTipoBadge(inversion.tipo)}`}>
                          {inversion.tipo.replace('_', ' ')}
                        </span>
                      </div>
                      {inversion.broker && (
                        <p className="text-sm text-gray-500">{inversion.broker}</p>
                      )}
                    </div>
                  </div>

                  {/* Valores */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Invertido</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${inicial.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valor Actual</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${actual.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Rendimiento */}
                  <div className={`p-3 rounded-lg ${esPositivo ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Ganancia/Pérdida</p>
                        <p className={`text-xl font-bold ${esPositivo ? 'text-green-600' : 'text-red-600'}`}>
                          {esPositivo ? '+' : ''}${ganancia.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">Rendimiento</p>
                        <div className="flex items-center gap-1">
                          {esPositivo ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          )}
                          <p className={`text-xl font-bold ${esPositivo ? 'text-green-600' : 'text-red-600'}`}>
                            {esPositivo ? '+' : ''}{porcentaje.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles adicionales */}
                  {(inversion.cantidadUnidades || inversion.cantidad) && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Unidades: <span className="font-medium">{inversion.cantidadUnidades ?? inversion.cantidad}</span></p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      Comprado: {dayjs(inversion.fechaCompra).format('DD/MM/YYYY')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditar(inversion)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(inversion)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay inversiones</h3>
            <p className="text-gray-500 mb-6">Comienza a construir tu portafolio de inversiones</p>
            <Button onClick={() => setModalAbierto(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Nueva Inversión
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Inversiones
