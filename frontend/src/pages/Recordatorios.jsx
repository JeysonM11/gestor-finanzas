import { useState, useEffect } from 'react'
import { Card, Button, Spinner, EmptyState, Badge } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalRecordatorio from '../components/recordatorios/ModalRecordatorio'
import { recordatorioService } from '../services/recordatorio.service'
import { useToast } from '../context/ToastContext'
import { Plus, BellRing, Edit, Trash2, Check, RotateCcw, Play } from 'lucide-react'
import { formatDate } from '../utils/date'

const Recordatorios = () => {
  const toast = useToast()
  const [recordatorios, setRecordatorios] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ejecutando, setEjecutando] = useState(false)
  const [soloPendientes, setSoloPendientes] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionado, setSeleccionado] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [aEliminar, setAEliminar] = useState(null)

  useEffect(() => {
    cargar()
  }, [soloPendientes])

  const cargar = async () => {
    try {
      setLoading(true)
      const params = soloPendientes ? { soloPendientes: true } : undefined
      const data = await recordatorioService.getAll(params)
      setRecordatorios(data.recordatorios || [])
      setResumen(data.resumen)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar recordatorios')
    } finally {
      setLoading(false)
    }
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    try {
      await recordatorioService.delete(aEliminar.id)
      toast.success('Recordatorio desactivado')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al desactivar')
    }
  }

  const handleCompletar = async (id) => {
    try {
      await recordatorioService.completar(id)
      toast.success('Recordatorio completado')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al completar')
    }
  }

  const handleReactivar = async (id) => {
    try {
      await recordatorioService.reactivar(id)
      toast.success('Recordatorio reactivado')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al reactivar')
    }
  }

  const handleEjecutar = async () => {
    try {
      setEjecutando(true)
      const data = await recordatorioService.ejecutar()
      const r = data.resumen || data
      const notificados = r.notificados ?? 0
      const errores = r.errores ?? 0
      if (errores > 0) {
        toast.warning(`Procesados: ${notificados} notificados, ${errores} errores`)
      } else {
        toast.success(`Procesados: ${notificados} notificados, ${errores} errores`)
      }
      await cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar vencidos')
    } finally {
      setEjecutando(false)
    }
  }

  if (loading && recordatorios.length === 0) {
    return <Spinner fullPage />
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Recordatorios</h1>
          <p className="page-subtitle">Avisos in-app para pagos, metas y más</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
          <Button
            variant="secondary"
            onClick={handleEjecutar}
            disabled={ejecutando}
            className="w-full sm:w-auto"
            title="Procesar vencidos"
          >
            <Play className="h-4 w-4" />
            {ejecutando ? 'Procesando...' : 'Ejecutar ahora'}
          </Button>
          <Button
            onClick={() => {
              setSeleccionado(null)
              setModalAbierto(true)
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </Button>
        </div>
      </div>

      <ModalRecordatorio
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false)
          setSeleccionado(null)
        }}
        onSuccess={cargar}
        recordatorio={seleccionado}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setAEliminar(null)
        }}
        onConfirm={confirmarEliminar}
        title="¿Desactivar recordatorio?"
        message="Dejará de aparecer en la lista. Puedes crear uno nuevo si lo necesitas."
        confirmText="Desactivar"
        type="warning"
      />

      {resumen && (
        <div className="stat-grid">
          <Card>
            <p className="text-sm text-ink-muted">Total</p>
            <p className="text-2xl font-bold text-ink">{resumen.total}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-muted">Pendientes</p>
            <p className="text-2xl font-bold text-amber-600">{resumen.pendientes}</p>
          </Card>
          <Card>
            <p className="text-sm text-ink-muted">Completados</p>
            <p className="text-2xl font-bold text-green-600">{resumen.completados}</p>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-ink-muted cursor-pointer">
          <input
            type="checkbox"
            checked={soloPendientes}
            onChange={(e) => setSoloPendientes(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-line rounded"
          />
          Solo pendientes
        </label>
      </div>

      {recordatorios.length > 0 ? (
        <div className="card-grid">
          {recordatorios.map((r) => (
            <Card key={r.id} hover className={r.completado ? 'opacity-75' : ''}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <BellRing className="h-5 w-5 text-primary-600 shrink-0" />
                      <h3 className="font-bold text-lg text-ink truncate">{r.titulo}</h3>
                      <Badge variant="gray">{r.tipo}</Badge>
                      {r.completado ? (
                        <Badge variant="green">Completado</Badge>
                      ) : (
                        <Badge variant="pendiente">Pendiente</Badge>
                      )}
                    </div>
                    {r.descripcion && (
                      <p className="text-sm text-ink-muted">{r.descripcion}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setSeleccionado(r)
                        setModalAbierto(true)
                      }}
                      aria-label="Editar"
                    >
                      <Edit className="h-4 w-4 text-primary-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setAEliminar(r)
                        setConfirmOpen(true)
                      }}
                      aria-label="Desactivar"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-ink-subtle">
                  Fecha: {formatDate(r.fechaRecordatorio)}
                  {r.repetir && r.frecuencia ? ` · Repite: ${r.frecuencia}` : ''}
                </p>

                <div className="pt-2 border-t border-line flex flex-col sm:flex-row gap-2">
                  {!r.completado ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleCompletar(r.id)}
                      className="w-full sm:w-auto"
                    >
                      <Check className="h-4 w-4" />
                      Completar
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => handleReactivar(r.id)}
                      className="w-full sm:w-auto"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reactivar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<BellRing className="h-16 w-16" />}
            title="Sin recordatorios"
            description="Crea uno para recibir una notificación in-app al vencer"
            action={
              <Button onClick={() => setModalAbierto(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Nuevo recordatorio
              </Button>
            }
          />
        </Card>
      )}
    </div>
  )
}

export default Recordatorios
