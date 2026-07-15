import { useState, useEffect } from 'react'
import { CreditCard, Plus, Edit, Trash2, DollarSign, Calendar, TrendingDown, AlertTriangle } from 'lucide-react'
import { Button, Spinner } from '../components/ui'
import ModalDeuda from '../components/deudas/ModalDeuda'
import ModalPago from '../components/deudas/ModalPago'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { deudaService } from '../services/deuda.service'
import { useToast } from '../context/ToastContext'

const Deudas = () => {
  const toast = useToast()
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
    const total = deuda.montoTotal ?? deuda.montoInicial ?? 0
    const pagado = deuda.montoPagado ?? 0
    if (!total) return 0
    return Math.min((pagado / total) * 100, 100)
  }

  const calcularRestante = (deuda) => {
    const total = deuda.montoTotal ?? deuda.montoInicial ?? 0
    const pagado = deuda.montoPagado ?? 0
    return total - pagado
  }

  const calcularTotales = () => {
    const lista = Array.isArray(deudas) ? deudas : []
    const total = lista.reduce((acc, deuda) => acc + (deuda.montoTotal ?? deuda.montoInicial ?? 0), 0)
    const pagado = lista.reduce((acc, deuda) => acc + (deuda.montoPagado ?? 0), 0)
    const restante = total - pagado
    const progresoTotal = total > 0 ? (pagado / total) * 100 : 0
    
    return { total, pagado, restante, progresoTotal }
  }

  const totales = calcularTotales()

  if (loading) {
    return <Spinner fullPage />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Deudas</h1>
          <p className="text-gray-600 mt-1">Administra tus préstamos y obligaciones</p>
        </div>
        <Button onClick={() => setModalDeudaOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nueva Deuda
        </Button>
      </div>

      {/* Resumen Total */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Adeudado</p>
              <p className="text-2xl font-bold text-gray-900">${totales.total.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">${totales.pagado.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Restante</p>
              <p className="text-2xl font-bold text-orange-600">${totales.restante.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Progreso Total</p>
              <p className="text-2xl font-bold text-blue-600">{totales.progresoTotal.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Deudas */}
      {deudas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay deudas registradas</h3>
          <p className="text-gray-600 mb-6">Comienza agregando tus préstamos y obligaciones</p>
          <Button onClick={() => setModalDeudaOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Agregar Primera Deuda
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(Array.isArray(deudas) ? deudas : []).map((deuda) => {
            const progreso = calcularProgreso(deuda)
            const restante = calcularRestante(deuda)
            const tipoBadge = getTipoBadge(deuda.tipo)
            const estaVencida = deuda.fechaVencimiento && new Date(deuda.fechaVencimiento) < new Date()
            const montoTotal = deuda.montoTotal ?? deuda.montoInicial ?? 0
            const montoPagado = deuda.montoPagado ?? 0
            
            return (
              <div key={deuda.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{deuda.nombre}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${tipoBadge.color}`}>
                        {tipoBadge.label}
                      </span>
                      {estaVencida && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Vencida
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditDeuda(deuda)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeudaToDelete(deuda)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Información */}
                <div className="space-y-3 mb-4">
                  {deuda.acreedor && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Acreedor:</span>
                      <span>{deuda.acreedor}</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Monto Total</p>
                      <p className="font-semibold text-gray-900">${montoTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pagado</p>
                      <p className="font-semibold text-green-600">${montoPagado.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Restante</p>
                      <p className="font-semibold text-orange-600">${restante.toFixed(2)}</p>
                    </div>
                    {deuda.tasaInteres > 0 && (
                      <div>
                        <p className="text-gray-600">Tasa</p>
                        <p className="font-semibold text-gray-900">{deuda.tasaInteres}%</p>
                      </div>
                    )}
                  </div>

                  {deuda.fechaVencimiento && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Vence: {new Date(deuda.fechaVencimiento).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Barra de Progreso */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Progreso</span>
                    <span className="font-semibold text-primary-600">{progreso.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progreso === 100 ? 'bg-green-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                </div>

                {/* Botón de Pago */}
                {restante > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => handleRegistrarPago(deuda)}
                    className="w-full"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Registrar Pago
                  </Button>
                )}

                {progreso === 100 && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-center text-sm font-medium">
                    ✓ Deuda Saldada Completamente
                  </div>
                )}
              </div>
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
