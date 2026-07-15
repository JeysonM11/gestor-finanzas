import { useState, useEffect } from 'react'
import { Card, Button, Spinner, EmptyState, Badge } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalMeta from '../components/metas/ModalMeta'
import { metaService } from '../services/meta.service'
import { useToast } from '../context/ToastContext'
import { useCurrency } from '../hooks/useCurrency'
import { Plus, Target, Edit, Trash2, DollarSign } from 'lucide-react'
import dayjs from 'dayjs'

const Metas = () => {
  const toast = useToast()
  const { formatMoney } = useCurrency()
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
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Metas de ahorro</h1>
          <p className="page-subtitle">Define objetivos y registra aportes</p>
        </div>
        <Button
          onClick={() => {
            setMetaSeleccionada(null)
            setModalAbierto(true)
          }}
          className="w-full sm:w-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
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
        <div className="stat-grid">
          <Card>
            <p className="text-sm text-ink-muted">Activas</p>
            <p className="text-2xl font-bold text-ink">{resumen.activas}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-muted">Completadas</p>
            <p className="text-2xl font-bold text-green-600">{resumen.completadas}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-muted">Ahorrado / Objetivo</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatMoney(resumen.montoActualTotal || 0)} /{' '}
              {formatMoney(resumen.montoObjetivoTotal || 0)}
            </p>
          </Card>
        </div>
      )}

      {metas.length > 0 ? (
        <div className="card-grid">
          {metas.map((meta) => (
            <Card key={meta.id} hover className={meta.completada ? 'opacity-75' : ''}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Target className="h-5 w-5 text-primary-600 shrink-0" />
                      <h3 className="font-bold text-lg text-ink">{meta.titulo}</h3>
                      <Badge variant="gray">{meta.tipo}</Badge>
                      {meta.completada && (
                        <Badge variant="green">Completada</Badge>
                      )}
                    </div>
                    {meta.descripcion && (
                      <p className="text-sm text-ink-muted">{meta.descripcion}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setMetaSeleccionada(meta)
                        setModalAbierto(true)
                      }}
                      aria-label="Editar meta"
                    >
                      <Edit className="h-4 w-4 text-primary-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setMetaAEliminar(meta)
                        setConfirmOpen(true)
                      }}
                      aria-label="Eliminar meta"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-muted">
                      {formatMoney(meta.montoActual)} / {formatMoney(meta.montoObjetivo)}
                    </span>
                    <span className="font-medium">{Number(meta.progreso).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        meta.completada ? 'bg-green-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${Math.min(100, meta.progreso || 0)}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-ink-subtle">
                  Límite: {dayjs(meta.fechaLimite).format('DD/MM/YYYY')} · Prioridad:{' '}
                  {meta.prioridad}
                </p>

                {!meta.completada && (
                  <div className="pt-2 border-t border-line">
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
