import { useState, useEffect } from 'react'
import { CreditCard, Plus, Edit, Trash2, DollarSign, Calendar, TrendingDown, AlertTriangle } from 'lucide-react'
import { Button, Spinner, Card, EmptyState, Badge } from '../components/ui'
import ModalDeuda from '../components/deudas/ModalDeuda'
import ModalPago from '../components/deudas/ModalPago'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { deudaService } from '../services/deuda.service'
import { useToast } from '../context/ToastContext'
import { useCurrency } from '../hooks/useCurrency'

const Deudas = () => {
  const toast = useToast()
  const { formatMoney } = useCurrency()
  const [deudas, setDeudas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalDeudaOpen, setModalDeudaOpen] = useState(false)
  const [modalPagoOpen, setModalPagoOpen] = useState(false)
  const [selectedDeuda, setSelectedDeuda] = useState(null)
  const [deudaToDelete, setDeudaToDelete] = useState(null)

  useEffect(() => {
    fetchDeudas()
  }, [])

  const fetchDeudas = async () => {
    try {
      setLoading(true)
      const response = await deudaService.getAll()
      setDeudas(response.deudas || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar deudas')
    } finally {
      setLoading(false)
    }
  }

  const handleEditDeuda = (deuda) => {
    setSelectedDeuda(deuda)
    setModalDeudaOpen(true)
  }

  const handleDeleteDeuda = async () => {
    if (!deudaToDelete) return

    try {
      await deudaService.delete(deudaToDelete.id)
      setDeudaToDelete(null)
      toast.success('Deuda eliminada')
      fetchDeudas()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar la deuda')
    }
  }

  const handleRegistrarPago = (deuda) => {
    setSelectedDeuda(deuda)
    setModalPagoOpen(true)
  }

  const closeModalDeuda = () => {
    setModalDeudaOpen(false)
    setSelectedDeuda(null)
  }

  const closeModalPago = () => {
    setModalPagoOpen(false)
    setSelectedDeuda(null)
  }

  const getTipoBadge = (tipo) => {
    const badges = {
      PRESTAMO: { label: 'Préstamo', color: 'bg-blue-100 text-blue-800' },
      PRESTAMO_PERSONAL: { label: 'Préstamo', color: 'bg-blue-100 text-blue-800' },
      HIPOTECA: { label: 'Hipoteca', color: 'bg-purple-100 text-purple-800' },
      TARJETA_CREDITO: { label: 'Tarjeta', color: 'bg-pink-100 text-pink-800' },
      PRESTAMO_ESTUDIANTIL: { label: 'Estudiantil', color: 'bg-indigo-100 text-indigo-800' },
      PRESTAMO_AUTO: { label: 'Auto', color: 'bg-cyan-100 text-cyan-800' },
      LINEA_CREDITO: { label: 'Línea de crédito', color: 'bg-amber-100 text-amber-800' },
      OTROS: { label: 'Otros', color: 'bg-gray-100 text-gray-800' },
      OTRO: { label: 'Otros', color: 'bg-gray-100 text-gray-800' },
    }
    return badges[tipo] || badges.OTRO
  }

  const calcularProgreso = (deuda) => {
    const total = deuda.montoConInteres ?? deuda.montoTotal ?? deuda.montoInicial ?? 0
    const pagado = deuda.montoPagado ?? 0
    if (!total) return 0
    return Math.min((pagado / total) * 100, 100)
  }

  const calcularRestante = (deuda) => {
    if (deuda.montoActual != null) return deuda.montoActual
    const total = deuda.montoConInteres ?? deuda.montoTotal ?? deuda.montoInicial ?? 0
    const pagado = deuda.montoPagado ?? 0
    return total - pagado
  }

  const formatearPlazo = (meses) => {
    if (!meses || meses <= 0) return null
    return meses === 1 ? '1 mes' : `${meses} meses`
  }

  const calcularTotales = () => {
    const lista = Array.isArray(deudas) ? deudas : []
    const total = lista.reduce(
      (acc, deuda) => acc + (deuda.montoConInteres ?? deuda.montoTotal ?? deuda.montoInicial ?? 0),
      0
    )
    const pagado = lista.reduce((acc, deuda) => acc + (deuda.montoPagado ?? 0), 0)
    const restante = lista.reduce(
      (acc, deuda) => acc + (deuda.montoActual ?? calcularRestante(deuda)),
      0
    )
    const progresoTotal = total > 0 ? (pagado / total) * 100 : 0
    
    return { total, pagado, restante, progresoTotal }
  }

  const totales = calcularTotales()

  if (loading) {
    return <Spinner fullPage />
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Gestión de Deudas</h1>
          <p className="page-subtitle">Administra tus préstamos y obligaciones</p>
        </div>
        <Button onClick={() => setModalDeudaOpen(true)} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4" />
          Nueva Deuda
        </Button>
      </div>

      {/* Resumen Total */}
      <div className="stat-grid">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted mb-1">Total Adeudado</p>
              <p className="text-2xl font-bold text-ink">{formatMoney(totales.total)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted mb-1">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">{formatMoney(totales.pagado)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted mb-1">Total Restante</p>
              <p className="text-2xl font-bold text-orange-600">{formatMoney(totales.restante)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted mb-1">Progreso Total</p>
              <p className="text-2xl font-bold text-primary-600">{totales.progresoTotal.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Deudas */}
      {deudas.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CreditCard className="h-16 w-16" />}
            title="No hay deudas registradas"
            description="Comienza agregando tus préstamos y obligaciones"
            action={
              <Button onClick={() => setModalDeudaOpen(true)}>
                <Plus className="h-4 w-4" />
                Agregar Primera Deuda
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="card-grid">
          {(Array.isArray(deudas) ? deudas : []).map((deuda) => {
            const progreso = calcularProgreso(deuda)
            const restante = calcularRestante(deuda)
            const tipoBadge = getTipoBadge(deuda.tipo)
            const estaVencida = deuda.fechaVencimiento && new Date(deuda.fechaVencimiento) < new Date()
            const montoTotal = deuda.montoTotal ?? deuda.montoInicial ?? 0
            const montoPagado = deuda.montoPagado ?? 0
            const plazoLabel = formatearPlazo(deuda.plazoMeses)
            
            return (
              <Card key={deuda.id} hover>
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-ink mb-2">{deuda.nombre}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${tipoBadge.color}`}>
                        {tipoBadge.label}
                      </span>
                      {plazoLabel && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                          {plazoLabel}
                        </span>
                      )}
                      {estaVencida && (
                        <Badge variant="vencido">Vencida</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEditDeuda(deuda)}
                      aria-label="Editar deuda"
                    >
                      <Edit className="h-4 w-4 text-primary-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeudaToDelete(deuda)}
                      aria-label="Eliminar deuda"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {deuda.acreedor && (
                    <div className="flex items-center text-sm text-ink-muted">
                      <span className="font-medium mr-2">Acreedor:</span>
                      <span>{deuda.acreedor}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-ink-muted">Monto Total</p>
                      <p className="font-semibold text-ink">{formatMoney(montoTotal)}</p>
                    </div>
                    <div>
                      <p className="text-ink-muted">Pagado</p>
                      <p className="font-semibold text-green-600">{formatMoney(montoPagado)}</p>
                    </div>
                    <div>
                      <p className="text-ink-muted">Restante</p>
                      <p className="font-semibold text-orange-600">{formatMoney(restante)}</p>
                    </div>
                    {deuda.tasaInteres > 0 && (
                      <div>
                        <p className="text-ink-muted">Tasa</p>
                        <p className="font-semibold text-ink">
                          {deuda.tasaInteres}%{' '}
                          <span className="text-ink-muted font-normal">
                            {deuda.tipoTasa === 'ANUAL' ? 'anual' : 'mensual'}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {deuda.fechaVencimiento && (
                    <div className="flex items-center text-sm text-ink-muted">
                      <Calendar className="w-4 h-4 mr-2 shrink-0" />
                      <span>Vence: {new Date(deuda.fechaVencimiento).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-ink-muted">Progreso</span>
                    <span className="font-semibold text-primary-600">{progreso.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-surface-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progreso === 100 ? 'bg-green-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                </div>

                {restante > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => handleRegistrarPago(deuda)}
                    className="w-full"
                  >
                    <DollarSign className="w-4 h-4" />
                    Registrar Pago
                  </Button>
                )}

                {progreso === 100 && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-center text-sm font-medium">
                    ✓ Deuda Saldada Completamente
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Modales */}
      <ModalDeuda
        isOpen={modalDeudaOpen}
        onClose={closeModalDeuda}
        onSuccess={fetchDeudas}
        deuda={selectedDeuda}
      />

      <ModalPago
        isOpen={modalPagoOpen}
        onClose={closeModalPago}
        onSuccess={fetchDeudas}
        deuda={selectedDeuda}
      />

      <ConfirmDialog
        isOpen={!!deudaToDelete}
        onClose={() => setDeudaToDelete(null)}
        onConfirm={handleDeleteDeuda}
        title="Eliminar Deuda"
        message={`¿Estás seguro de que deseas eliminar "${deudaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />
    </div>
  )
}

export default Deudas
