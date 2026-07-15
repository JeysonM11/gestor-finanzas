import { useState, useEffect } from 'react'
import { Card, Button, Spinner, EmptyState } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalCuenta from '../components/cuentas/ModalCuenta'
import { cuentaService } from '../services/cuenta.service'
import { Plus, Wallet, CreditCard, Edit, Trash2, TrendingUp } from 'lucide-react'

const Cuentas = () => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cuentas Bancarias</h1>
          <p className="text-gray-600">Gestiona tus cuentas y saldos</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}>
          <Plus className="h-5 w-5 mr-2" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(totalesPorMoneda).map(([moneda, total]) => (
            <Card key={moneda}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total en {moneda}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {moneda} {total.toFixed(2)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cuentas.map((cuenta) => (
            <Card key={cuenta.id} className="relative overflow-hidden">
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
                      <h3 className="font-bold text-lg text-gray-900">{cuenta.nombre}</h3>
                      <p className="text-sm text-gray-500">{cuenta.banco || 'Sin banco'}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Saldo Actual</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {cuenta.moneda} {(cuenta.saldoActual ?? 0).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{cuenta.tipo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditar(cuenta)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar saldo"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEliminar(cuenta)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar cuenta"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
