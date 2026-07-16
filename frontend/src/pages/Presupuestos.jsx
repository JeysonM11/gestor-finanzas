import { useState, useEffect } from 'react'
import { Card, Button, Spinner, EmptyState } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalPresupuesto from '../components/presupuestos/ModalPresupuesto'
import { presupuestoService } from '../services/presupuesto.service'
import { useToast } from '../context/ToastContext'
import { useCurrency } from '../hooks/useCurrency'
import { Plus, PieChart, Edit, Trash2, RefreshCw } from 'lucide-react'

const ahora = new Date()

const Presupuestos = () => {
  const toast = useToast()
  const { formatMoney } = useCurrency()
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
      toast.success('Presupuestos sincronizados con ingresos y gastos')
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
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Presupuestos</h1>
          <p className="page-subtitle">
            Ingresos esperados, gastos planificados y saldo disponible
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="input-field w-full sm:w-auto"
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
            className="input-field w-full sm:w-24"
          />
          <Button variant="secondary" onClick={handleSincronizar} className="w-full sm:w-auto shrink-0">
            <RefreshCw className="h-4 w-4" />
            Sincronizar
          </Button>
          <Button
            onClick={() => {
              setSeleccionado(null)
              setModalAbierto(true)
            }}
            className="w-full sm:w-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
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
        <div className="stat-grid">
          <Card>
            <p className="text-sm text-ink-muted">Ingreso esperado</p>
            <p className="text-2xl font-bold text-ink">
              {formatMoney(resumen.ingresoEsperado || 0)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-muted">Ingreso recibido</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatMoney(resumen.ingresosReales || 0)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-muted">Egresos reales</p>
            <p className="text-2xl font-bold text-orange-600">
              {formatMoney(resumen.egresosReales || 0)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-muted">Saldo disponible</p>
            <p
              className={`text-2xl font-bold ${
                resumen.saldoDisponible < 0 ? 'text-red-600' : 'text-primary-600'
              }`}
            >
              {formatMoney(resumen.saldoDisponible || 0)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-muted">Límites de gasto</p>
            <p className="text-2xl font-bold text-ink">
              {formatMoney(resumen.totalLimite || 0)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-ink-muted">Excedidos</p>
            <p className="text-2xl font-bold text-red-600">{resumen.excedidos || 0}</p>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : presupuestos.length > 0 ? (
        <div className="card-grid">
          {presupuestos.map((p) => (
            <Card key={p.id} hover>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-ink">{p.categoria}</h3>
                    <p className="text-sm text-ink-muted">
                      {p.mes}/{p.anio || p.año}
                      <span className="ml-2 font-medium">
                        {p.tipo === 'INGRESO' ? 'Ingreso esperado' : 'Límite de gasto'}
                      </span>
                      {p.excedido && (
                        <span className="ml-2 text-red-600 font-medium">Excedido</span>
                      )}
                      {p.cumplido && (
                        <span className="ml-2 text-emerald-600 font-medium">Recibido</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setSeleccionado(p)
                        setModalAbierto(true)
                      }}
                      aria-label="Editar presupuesto"
                    >
                      <Edit className="h-4 w-4 text-primary-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setAEliminar(p)
                        setConfirmOpen(true)
                      }}
                      aria-label="Eliminar presupuesto"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">
                    {formatMoney(p.montoReal ?? p.gastado)} / {formatMoney(p.limite)}
                  </span>
                  <span
                    className={
                      p.excedido ? 'text-red-600 font-medium' : 'text-ink font-medium'
                    }
                  >
                    {Number(p.porcentajeUsado || 0).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      p.excedido
                        ? 'bg-red-500'
                        : p.tipo === 'INGRESO'
                          ? 'bg-emerald-500'
                        : p.porcentajeUsado >= (p.alertaEn || 80)
                          ? 'bg-yellow-500'
                          : 'bg-primary-600'
                    }`}
                    style={{ width: `${Math.min(100, p.porcentajeUsado || 0)}%` }}
                  />
                </div>
                <p className="text-xs text-ink-subtle">
                  {p.tipo === 'INGRESO' ? 'Por recibir' : 'Restante'}:{' '}
                  {formatMoney(p.restante || 0)}
                  {p.tipo === 'GASTO' &&
                    p.alertaEn != null &&
                    ` · Alerta al ${p.alertaEn}%`}
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
            description={`Registra ingresos esperados y límites de gasto para ${mes}/${anio}`}
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
