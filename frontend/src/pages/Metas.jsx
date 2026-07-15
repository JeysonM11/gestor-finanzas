import { useState, useEffect } from 'react'
import { Card, Button, Spinner, EmptyState } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalMeta from '../components/metas/ModalMeta'
import { metaService } from '../services/meta.service'
import { useToast } from '../context/ToastContext'
import { Plus, Target, Edit, Trash2, DollarSign } from 'lucide-react'
import dayjs from 'dayjs'

const Metas = () => {
  const toast = useToast()
  const [metas, setMetas] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [metaSeleccionada, setMetaSeleccionada] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [metaAEliminar, setMetaAEliminar] = useState(null)
  const [aporteId, setAporteId] = useState(null)
  const [montoAporte, setMontoAporte] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      setLoading(true)
      const data = await metaService.getAll()
      setMetas(data.metas || [])
      setResumen(data.resumen)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar metas')
    } finally {
      setLoading(false)
    }
  }

  const confirmarEliminar = async () => {
    if (!metaAEliminar) return
    try {
      await metaService.delete(metaAEliminar.id)
      toast.success('Meta eliminada')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar')
    }
  }

  const handleAportar = async (id) => {
    const monto = parseFloat(montoAporte)
    if (!monto || monto <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }
    try {
      await metaService.aportar(id, monto)
      toast.success('Aporte registrado')
      setAporteId(null)
      setMontoAporte('')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al aportar')
    }
  }

  if (loading) {
    return <Spinner fullPage />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas de ahorro</h1>
          <p className="text-gray-600">Define objetivos y registra aportes</p>
        </div>
        <Button
          onClick={() => {
            setMetaSeleccionada(null)
            setModalAbierto(true)
          }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Meta
        </Button>
      </div>

      <ModalMeta
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false)
          setMetaSeleccionada(null)
        }}
        onSuccess={cargar}
        meta={metaSeleccionada}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmarEliminar}
        title="¿Eliminar meta?"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        type="danger"
      />

      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Activas</p>
            <p className="text-2xl font-bold text-gray-900">{resumen.activas}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Completadas</p>
            <p className="text-2xl font-bold text-green-600">{resumen.completadas}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Ahorrado / Objetivo</p>
            <p className="text-2xl font-bold text-primary-600">
              ${Number(resumen.montoActualTotal || 0).toFixed(0)} / $
              {Number(resumen.montoObjetivoTotal || 0).toFixed(0)}
            </p>
          </Card>
        </div>
      )}

      {metas.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metas.map((meta) => (
            <Card key={meta.id} className={meta.completada ? 'opacity-75' : ''}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-5 w-5 text-primary-600" />
                      <h3 className="font-bold text-lg text-gray-900">{meta.titulo}</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                        {meta.tipo}
                      </span>
                      {meta.completada && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                          Completada
                        </span>
                      )}
                    </div>
                    {meta.descripcion && (
                      <p className="text-sm text-gray-500">{meta.descripcion}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setMetaSeleccionada(meta)
                        setModalAbierto(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setMetaAEliminar(meta)
                        setConfirmOpen(true)
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      ${Number(meta.montoActual).toFixed(2)} / $
                      {Number(meta.montoObjetivo).toFixed(2)}
                    </span>
                    <span className="font-medium">{Number(meta.progreso).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        meta.completada ? 'bg-green-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${Math.min(100, meta.progreso || 0)}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Límite: {dayjs(meta.fechaLimite).format('DD/MM/YYYY')} · Prioridad:{' '}
                  {meta.prioridad}
                </p>

                {!meta.completada && (
                  <div className="pt-2 border-t border-gray-100">
                    {aporteId === meta.id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={montoAporte}
                          onChange={(e) => setMontoAporte(e.target.value)}
                          placeholder="Monto"
                          className="input-field flex-1"
                        />
                        <Button onClick={() => handleAportar(meta.id)}>Guardar</Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setAporteId(null)
                            setMontoAporte('')
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => setAporteId(meta.id)}
                        className="w-full"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Registrar aporte
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<Target className="h-16 w-16" />}
            title="Sin metas aún"
            description="Crea tu primera meta de ahorro"
            action={
              <Button onClick={() => setModalAbierto(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Nueva Meta
              </Button>
            }
          />
        </Card>
      )}
    </div>
  )
}

export default Metas
