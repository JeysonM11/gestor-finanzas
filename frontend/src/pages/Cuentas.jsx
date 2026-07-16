import { useState, useEffect } from 'react'
import { Card, Button, Spinner, EmptyState } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalCuenta from '../components/cuentas/ModalCuenta'
import { cuentaService } from '../services/cuenta.service'
import { useCurrency } from '../hooks/useCurrency'
import { Plus, Wallet, CreditCard, Edit, Trash2, TrendingUp } from 'lucide-react'

const Cuentas = () => {
  const { formatMoney } = useCurrency()
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [cuentaAEliminar, setCuentaAEliminar] = useState(null)

  useEffect(() => {
    cargarCuentas()
  }, [])

  const cargarCuentas = async () => {
    try {
      const data = await cuentaService.getAll()
      setCuentas(data.cuentas || data)
    } catch (error) {
      console.error('Error al cargar cuentas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = (cuenta) => {
    setCuentaSeleccionada(cuenta)
    setModalAbierto(true)
  }

  const handleEliminar = (cuenta) => {
    setCuentaAEliminar(cuenta)
    setConfirmDialogOpen(true)
  }

  const confirmarEliminar = async () => {
    if (!cuentaAEliminar) return
    
    try {
      await cuentaService.delete(cuentaAEliminar.id)
      cargarCuentas()
    } catch (error) {
      console.error('Error al eliminar cuenta:', error)
    }
  }

  const handleCloseModal = () => {
    setModalAbierto(false)
    setCuentaSeleccionada(null)
  }

  const handleCuentaGuardada = () => {
    cargarCuentas()
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'BANCO_AHORROS':
      case 'BANCO_CORRIENTE':
      case 'AHORRO':
      case 'CORRIENTE':
        return <Wallet className="h-6 w-6" />
      case 'TARJETA_CREDITO':
      case 'TARJETA_DEBITO':
      case 'CREDITO':
        return <CreditCard className="h-6 w-6" />
      case 'INVERSION':
        return <TrendingUp className="h-6 w-6" />
      default:
        return <Wallet className="h-6 w-6" />
    }
  }

  const calcularTotalPorMoneda = () => {
    const totales = {}
    cuentas.forEach(cuenta => {
      if (!totales[cuenta.moneda]) {
        totales[cuenta.moneda] = 0
      }
      totales[cuenta.moneda] += cuenta.saldoActual
    })
    return totales
  }

  if (loading) {
    return <Spinner fullPage />
  }

  const totalesPorMoneda = calcularTotalPorMoneda()

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Cuentas Bancarias</h1>
          <p className="page-subtitle">Gestiona tus cuentas y saldos</p>
        </div>
        <Button onClick={() => setModalAbierto(true)} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4" />
          Nueva Cuenta
        </Button>
      </div>

      {/* Modal */}
      <ModalCuenta 
        isOpen={modalAbierto}
        onClose={handleCloseModal}
        onSuccess={handleCuentaGuardada}
        cuenta={cuentaSeleccionada}
      />

      {/* Dialog de confirmación */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmarEliminar}
        title="¿Eliminar cuenta?"
        message="Esta acción no se puede deshacer. La cuenta será eliminada permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Resumen de totales por moneda */}
      {Object.keys(totalesPorMoneda).length > 0 && (
        <div className="stat-grid">
          {Object.entries(totalesPorMoneda).map(([moneda, total]) => (
            <Card key={moneda}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-muted">Total en {moneda}</p>
                  <p className="text-2xl font-bold text-ink">
                    {formatMoney(total, moneda)}
                  </p>
                </div>
                <Wallet className="h-10 w-10 text-primary-600" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Grid de cuentas */}
      {cuentas.length > 0 ? (
        <div className="card-grid">
          {cuentas.map((cuenta) => (
            <Card key={cuenta.id} hover className="relative overflow-hidden">
              {/* Barra de color */}
              <div 
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: cuenta.color || '#3B82F6' }}
              />
              
              <div className="pt-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: cuenta.color + '20' || '#3B82F620' }}
                    >
                      <div style={{ color: cuenta.color || '#3B82F6' }}>
                        {getTipoIcon(cuenta.tipo)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-ink">{cuenta.nombre}</h3>
                      <p className="text-sm text-ink-muted">{cuenta.banco || 'Sin banco'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-ink-muted mb-1">Saldo Actual</p>
                  <p className="text-3xl font-bold text-ink">
                    {formatMoney(cuenta.saldoActual ?? 0, cuenta.moneda)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-line">
                  <div className="text-sm text-ink-muted">
                    <span className="font-medium">{cuenta.tipo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEditar(cuenta)}
                      aria-label="Editar saldo"
                    >
                      <Edit className="h-4 w-4 text-primary-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEliminar(cuenta)}
                      aria-label="Eliminar cuenta"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Wallet className="h-16 w-16" />}
            title="No hay cuentas"
            description="Crea tu primera cuenta para comenzar"
            action={
              <Button onClick={() => setModalAbierto(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Nueva Cuenta
              </Button>
            }
          />
        </Card>
      )}
    </div>
  )
}

export default Cuentas
