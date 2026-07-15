import { useState, useEffect } from 'react'
import { Card, Button, Spinner, EmptyState } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalPresupuesto from '../components/presupuestos/ModalPresupuesto'
import { presupuestoService } from '../services/presupuesto.service'
import { useToast } from '../context/ToastContext'
import { Plus, PieChart, Edit, Trash2, RefreshCw } from 'lucide-react'

const ahora = new Date()

const Presupuestos = () => {
  const toast = useToast()
  const [presupuestos, setPresupuestos] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mes, setMes] = useState(ahora.getMonth() + 1)
  const [anio, setAnio] = useState(ahora.getFullYear())
  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionado, setSeleccionado] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [aEliminar, setAEliminar] = useState(null)

  useEffect(() => {
    cargar()
  }, [mes, anio])

  const cargar = async () => {
    try {
      setLoading(true)
      const data = await presupuestoService.getAll({ mes, anio })
      setPresupuestos(data.presupuestos || [])
      setResumen(data.resumen)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar presupuestos')
    } finally {
      setLoading(false)
    }
  }

  const handleSincronizar = async () => {
    try {
      await presupuestoService.sincronizar({ mes, anio })
      toast.success('Presupuestos sincronizados con gastos')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al sincronizar')
    }
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    try {
      await presupuestoService.delete(aEliminar.id)
      toast.success('Presupuesto eliminado')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-600">Límites mensuales por categoría</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="input-field w-auto"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString('es', { month: 'long' })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="input-field w-24"
          />
          <Button variant="secondary" onClick={handleSincronizar}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar
          </Button>
          <Button
            onClick={() => {
              setSeleccionado(null)
              setModalAbierto(true)
            }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      <ModalPresupuesto
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false)
          setSeleccionado(null)
        }}
        onSuccess={cargar}
        presupuesto={seleccionado}
        mes={mes}
        anio={anio}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmarEliminar}
        title="¿Eliminar presupuesto?"
        message="Se eliminará el límite de esta categoría para el mes."
        confirmText="Eliminar"
        type="danger"
      />

      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Límite total</p>
            <p className="text-2xl font-bold">${Number(resumen.totalLimite || 0).toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Gastado</p>
            <p className="text-2xl font-bold text-orange-600">
              ${Number(resumen.totalGastado || 0).toFixed(2)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Excedidos</p>
            <p className="text-2xl font-bold text-red-600">{resumen.excedidos || 0}</p>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : presupuestos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {presupuestos.map((p) => (
            <Card key={p.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{p.categoria}</h3>
                    <p className="text-sm text-gray-500">
                      {p.mes}/{p.anio || p.año}
                      {p.excedido && (
                        <span className="ml-2 text-red-600 font-medium">Excedido</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSeleccionado(p)
                        setModalAbierto(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setAEliminar(p)
                        setConfirmOpen(true)
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span>
                    ${Number(p.gastado).toFixed(2)} / ${Number(p.limite).toFixed(2)}
                  </span>
                  <span
                    className={
                      p.excedido ? 'text-red-600 font-medium' : 'text-gray-700 font-medium'
                    }
                  >
                    {Number(p.porcentajeUsado || 0).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      p.excedido
                        ? 'bg-red-500'
                        : p.porcentajeUsado >= (p.alertaEn || 80)
                          ? 'bg-yellow-500'
                          : 'bg-primary-600'
                    }`}
                    style={{ width: `${Math.min(100, p.porcentajeUsado || 0)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Restante: ${Number(p.restante || 0).toFixed(2)}
                  {p.alertaEn != null && ` · Alerta al ${p.alertaEn}%`}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<PieChart className="h-16 w-16" />}
            title="Sin presupuestos"
            description={`Define un límite por categoría para ${mes}/${anio}`}
            action={
              <Button onClick={() => setModalAbierto(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Nuevo presupuesto
              </Button>
            }
          />
        </Card>
      )}
    </div>
  )
}

export default Presupuestos
