import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, CardTitle, CardDescription, EmptyState, Spinner } from '../components/ui'
import PlanAsesorView from '../components/deudas/advisor/PlanAsesorView'
import { asesorService } from '../services/asesor.service'
import { useToast } from '../context/ToastContext'
import { Bot, ChevronRight } from 'lucide-react'
import { formatDate } from '../utils/date'
import { cn } from '../utils/cn'

const Asesor = () => {
  const toast = useToast()
  const [planes, setPlanes] = useState([])
  const [planActivo, setPlanActivo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cargar = async () => {
    try {
      setLoading(true)
      const data = await asesorService.getPlanes()
      setPlanes(data.planes || [])
      if (data.planes?.length > 0) {
        await seleccionar(data.planes[0].id)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar el historial del asesor')
    } finally {
      setLoading(false)
    }
  }

  const seleccionar = async (id) => {
    try {
      setLoadingDetalle(true)
      const data = await asesorService.getPlan(id)
      setPlanActivo(data.plan)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar el plan')
    } finally {
      setLoadingDetalle(false)
    }
  }

  if (loading) {
    return <Spinner fullPage />
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
            Asesor de deudas
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Historial de diagnósticos y planes de pago generados
          </p>
        </div>
        <Link to="/deudas">
          <Button>Generar nuevo plan</Button>
        </Link>
      </div>

      {planes.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bot className="h-16 w-16" />}
            title="Aún no has generado ningún plan"
            description="Ve a Deudas y usa el Asesor para obtener tu primer diagnóstico y plan de pagos."
            action={
              <Link to="/deudas">
                <Button>Ir a Deudas</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card padding={false} className="lg:col-span-1 overflow-hidden self-start">
            <div className="px-4 py-3 border-b border-line">
              <CardTitle>Historial</CardTitle>
              <CardDescription>{planes.length} plan(es)</CardDescription>
            </div>
            <ul className="divide-y divide-line max-h-[32rem] overflow-y-auto">
              {planes.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => seleccionar(p.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-surface-muted',
                      planActivo?.id === p.id && 'bg-primary-50/60 dark:bg-primary-950/30'
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink truncate">
                        {p.resumen}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-ink-subtle">
                        {formatDate(p.createdAt)}
                        {!p.generadoPorIA && <Badge variant="gray">sin IA</Badge>}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="lg:col-span-2">
            {loadingDetalle ? (
              <div className="flex items-center justify-center py-16">
                <Spinner />
              </div>
            ) : planActivo ? (
              <PlanAsesorView plan={planActivo} />
            ) : (
              <p className="text-sm text-ink-muted py-8 text-center">
                Selecciona un plan del historial para ver el detalle.
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

export default Asesor
