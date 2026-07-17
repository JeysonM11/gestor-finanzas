import { useState, useEffect } from 'react'
import { Card, Button, Spinner, EmptyState } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalInversion from '../components/inversiones/ModalInversion'
import { inversionService } from '../services/inversion.service'
import { useCurrency } from '../hooks/useCurrency'
import { Plus, TrendingUp, TrendingDown, Edit, Trash2, DollarSign, Percent } from 'lucide-react'
import { formatDate } from '../utils/date'

const Inversiones = () => {
  const { formatMoney, formatSigned } = useCurrency()
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
    return <Spinner fullPage />
  }

  const totales = calcularTotales()

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Inversiones</h1>
          <p className="page-subtitle">Gestiona y monitorea tu portafolio de inversiones</p>
        </div>
        <Button onClick={() => setModalAbierto(true)} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4" />
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
        <div className="stat-grid">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-muted">Total Invertido</p>
                <p className="text-2xl font-bold text-ink">
                  {formatMoney(totales.totalInvertido)}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-blue-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-muted">Valor Actual</p>
                <p className="text-2xl font-bold text-ink">
                  {formatMoney(totales.totalActual)}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary-600" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-muted">Ganancia/Pérdida</p>
                <p className={`text-2xl font-bold ${totales.gananciaTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatSigned(totales.gananciaTotal)}
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
                <p className="text-sm text-ink-muted">Rendimiento</p>
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
        <div className="card-grid">
          {inversiones.map((inversion) => {
            const { ganancia, porcentaje, inicial, actual } = calcularRendimiento(inversion)
            const esPositivo = ganancia >= 0

            return (
              <Card key={inversion.id} hover>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-ink">{inversion.nombre}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTipoBadge(inversion.tipo)}`}>
                          {inversion.tipo.replace('_', ' ')}
                        </span>
                      </div>
                      {inversion.broker && (
                        <p className="text-sm text-ink-muted">{inversion.broker}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-line">
                    <div>
                      <p className="text-xs text-ink-subtle mb-1">Invertido</p>
                      <p className="text-lg font-bold text-ink">
                        {formatMoney(inicial)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-subtle mb-1">Valor Actual</p>
                      <p className="text-lg font-bold text-ink">
                        {formatMoney(actual)}
                      </p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${esPositivo ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-ink-muted mb-1">Ganancia/Pérdida</p>
                        <p className={`text-xl font-bold ${esPositivo ? 'text-green-600' : 'text-red-600'}`}>
                          {formatSigned(ganancia)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-ink-muted mb-1">Rendimiento</p>
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
                    <div className="text-sm text-ink-muted space-y-1">
                      <p>Unidades: <span className="font-medium">{inversion.cantidadUnidades ?? inversion.cantidad}</span></p>
                    </div>
                  )}

                  {Array.isArray(inversion.historial) && inversion.historial.length > 0 && (
                    <div className="pt-2 border-t border-line">
                      <p className="text-xs font-semibold text-ink-muted mb-2">Historial de valor</p>
                      <ul className="space-y-1 max-h-28 overflow-y-auto text-sm text-ink-muted">
                        {[...inversion.historial]
                          .slice()
                          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                          .slice(0, 5)
                          .map((punto) => (
                            <li key={punto.id || `${punto.fecha}-${punto.valor}`} className="flex justify-between gap-2">
                              <span>{formatDate(punto.fecha)}</span>
                              <span className="font-medium text-ink">
                                {formatMoney(Number(punto.valor) || 0)}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-line">
                    <span className="text-xs text-ink-subtle">
                      Comprado: {formatDate(inversion.fechaCompra)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEditar(inversion)}
                        aria-label="Editar inversión"
                      >
                        <Edit className="h-4 w-4 text-primary-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEliminar(inversion)}
                        aria-label="Eliminar inversión"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
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
            icon={<TrendingUp className="h-16 w-16" />}
            title="No hay inversiones"
            description="Comienza a construir tu portafolio de inversiones"
            action={
              <Button onClick={() => setModalAbierto(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Nueva Inversión
              </Button>
            }
          />
        </Card>
      )}
    </div>
  )
}

export default Inversiones
