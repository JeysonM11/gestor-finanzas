import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { transaccionService } from '../../services/transaccion.service'
import { cuentaService } from '../../services/cuenta.service'
import { useCurrency } from '../../hooks/useCurrency'
import { todayDateInput } from '../../utils/date'

const ModalPago = ({ isOpen, onClose, onSuccess, deuda }) => {
  const { formatMoney } = useCurrency()
  const [formData, setFormData] = useState({
    monto: '',
    fecha: todayDateInput(),
    cuentaOrigenId: '',
  })
  const [cuentas, setCuentas] = useState([])
  const [loadingCuentas, setLoadingCuentas] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const cargarCuentas = async () => {
      try {
        setLoadingCuentas(true)
        const data = await cuentaService.getAll()
        setCuentas(data.cuentas || data || [])
      } catch (err) {
        console.error('Error al cargar cuentas:', err)
        setCuentas([])
      } finally {
        setLoadingCuentas(false)
      }
    }

    cargarCuentas()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        monto: '',
        fecha: todayDateInput(),
        cuentaOrigenId: '',
      })
      setError('')
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await transaccionService.create({
        tipo: 'PAGO_DEUDA',
        monto: parseFloat(formData.monto),
        fecha: formData.fecha,
        deudaId: deuda.id,
        cuentaOrigenId: Number(formData.cuentaOrigenId),
      })

      setFormData({
        monto: '',
        fecha: todayDateInput(),
        cuentaOrigenId: '',
      })

      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error al registrar pago:', err)
      setError(err.response?.data?.message || 'Error al registrar el pago')
    } finally {
      setLoading(false)
    }
  }

  if (!deuda) return null

  const montoTotal = deuda.montoTotal ?? deuda.montoInicial ?? 0
  const montoPagado = deuda.montoPagado ?? Math.max(0, (deuda.montoConInteres ?? montoTotal) - (deuda.montoActual ?? 0))
  const montoRestante = deuda.montoActual ?? ((deuda.montoConInteres ?? montoTotal) - montoPagado)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">{deuda.nombre}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Monto total:</p>
              <p className="font-bold text-blue-900">{formatMoney(montoTotal)}</p>
            </div>
            <div>
              <p className="text-blue-700">Pagado:</p>
              <p className="font-bold text-blue-900">{formatMoney(montoPagado)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-blue-700">Restante:</p>
              <p className="font-bold text-blue-900">{formatMoney(montoRestante)}</p>
            </div>
          </div>
        </div>

        <Input
          label="Monto del Pago *"
          type="number"
          name="monto"
          value={formData.monto}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          max={montoRestante}
          required
        />

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">
            Cuenta *
          </label>
          <select
            name="cuentaOrigenId"
            value={formData.cuentaOrigenId}
            onChange={handleChange}
            className="w-full input-field"
            required
            disabled={loadingCuentas}
          >
            <option value="">
              {loadingCuentas ? 'Cargando cuentas...' : 'Seleccionar cuenta'}
            </option>
            {cuentas.map((cuenta) => (
              <option key={cuenta.id} value={cuenta.id}>
                {cuenta.nombre} ({formatMoney(cuenta.saldoActual ?? 0)})
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Fecha del Pago *"
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar Pago'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalPago
