import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, CardHeader, CardTitle, CardDescription, Input, LoadingButton, Skeleton } from '../../ui'
import PlanAsesorView from './PlanAsesorView'
import { asesorService } from '../../../services/asesor.service'
import { useToast } from '../../../context/ToastContext'
import { Bot, History } from 'lucide-react'

/**
 * Panel del Asesor IA embebido en la página de Deudas.
 * Muestra el último plan y permite generar uno nuevo.
 * Durante la regeneración se mantiene visible el plan anterior.
 */
const AsesorPanel = ({ hayDeudas = true, onPlanGenerado }) => {
  const toast = useToast()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')
  const [estrategia, setEstrategia] = useState('AVALANCHE')
  const [presupuestoExtra, setPresupuestoExtra] = useState('')

  useEffect(() => {
    let cancelled = false
    asesorService
      .getUltimo()
      .then((data) => {
        if (cancelled) return
        setPlan(data.plan)
        if (data.plan?.estrategia) setEstrategia(data.plan.estrategia)
      })
      .catch(() => {
        // Sin plan previo o error de red: el panel sigue permitiendo generar.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleGenerar = async () => {
    setGenerando(true)
    setError('')
    try {
      const data = await asesorService.generar({ estrategia, presupuestoExtra })
      setPlan(data.plan)
      toast.success(
        data.plan.generadoPorIA
          ? 'Plan generado con IA'
          : 'Plan generado (IA no disponible; diagnóstico basado en reglas)'
      )
      onPlanGenerado?.(data.plan)
    } catch (err) {
      setError(
        err.response?.data?.message || 'No se pudo generar el plan. Intenta de nuevo.'
      )
    } finally {
      setGenerando(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shrink-0">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>Asesor de deudas</CardTitle>
            <CardDescription>
              Diagnóstico, plan de pagos y tips para salir de deudas
            </CardDescription>
          </div>
        </div>
        <Link
          to="/asesor"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <History className="h-4 w-4" aria-hidden="true" />
          Historial
        </Link>
      </CardHeader>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">
                Estrategia
              </label>
              <select
                value={estrategia}
                onChange={(e) => setEstrategia(e.target.value)}
                className="w-full input-field"
                disabled={generando}
              >
                <option value="AVALANCHE">Avalancha (menos interés)</option>
                <option value="SNOWBALL">Bola de nieve (victorias rápidas)</option>
              </select>
            </div>
            <Input
              label="Extra mensual (opcional)"
              type="number"
              min="0"
              step="0.01"
              placeholder="Estimado automáticamente"
              value={presupuestoExtra}
              onChange={(e) => setPresupuestoExtra(e.target.value)}
              disabled={generando}
            />
            <LoadingButton
              loading={generando}
              onClick={handleGenerar}
              disabled={!hayDeudas}
            >
              {plan ? 'Regenerar plan' : 'Generar mi plan'}
            </LoadingButton>
          </div>

          {!hayDeudas && (
            <Alert variant="info">
              Registra al menos una deuda para generar un plan personalizado.
            </Alert>
          )}

          {error && (
            <Alert variant="error">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span>{error}</span>
                <Button size="sm" variant="outline" onClick={handleGenerar}>
                  Reintentar
                </Button>
              </div>
            </Alert>
          )}

          {plan && (
            <div className={generando ? 'opacity-60 pointer-events-none' : ''}>
              <PlanAsesorView plan={plan} compact />
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default AsesorPanel
