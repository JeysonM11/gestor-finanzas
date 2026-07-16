import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { deudaService } from '../../services/deuda.service'
import { useCurrency } from '../../hooks/useCurrency'
import { todayDateInput, toDateInputValue } from '../../utils/date'

const ModalDeuda = ({ isOpen, onClose, onSuccess, deuda = null }) => {
  const isEditing = !!deuda
  const { formatMoney } = useCurrency()
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'PRESTAMO_PERSONAL',
    montoTotal: '',
    montoPagado: '',
    tasaInteres: '',
    tipoTasa: 'MENSUAL',
    plazoMeses: '',
    fechaInicio: todayDateInput(),
    fechaVencimiento: '',
    acreedor: '',
    notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (deuda && isOpen) {
      setFormData({
        nombre: deuda.nombre || '',
        tipo: deuda.tipo || 'PRESTAMO_PERSONAL',
        montoTotal: deuda.montoTotal ?? deuda.montoInicial ?? '',
        montoPagado: deuda.montoPagado ?? '',
        tasaInteres: deuda.tasaInteres || '',
        tipoTasa: deuda.tipoTasa || 'MENSUAL',
        plazoMeses: deuda.plazoMeses || '',
        fechaInicio: deuda.fechaInicio ? toDateInputValue(deuda.fechaInicio) : todayDateInput(),
        fechaVencimiento: deuda.fechaVencimiento ? toDateInputValue(deuda.fechaVencimiento) : '',
        acreedor: deuda.acreedor || '',
        notas: deuda.notas || ''
      })
    } else if (!isOpen) {
      setFormData({
        nombre: '',
        tipo: 'PRESTAMO_PERSONAL',
        montoTotal: '',
        montoPagado: '',
        tasaInteres: '',
        tipoTasa: 'MENSUAL',
        plazoMeses: '',
        fechaInicio: todayDateInput(),
        fechaVencimiento: '',
        acreedor: '',
        notas: ''
      })
      setError('')
    }
  }, [deuda, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const dataToSend = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        montoTotal: parseFloat(formData.montoTotal),
        montoPagado: parseFloat(formData.montoPagado) || 0,
        tasaInteres: parseFloat(formData.tasaInteres) || 0,
        tipoTasa: formData.tipoTasa || 'MENSUAL',
        plazoMeses: formData.plazoMeses ? parseInt(formData.plazoMeses, 10) : null,
        fechaInicio: formData.fechaInicio,
        fechaVencimiento: formData.fechaVencimiento || null,
        acreedor: formData.acreedor,
        notas: formData.notas
      }

      if (isEditing) {
        await deudaService.update(deuda.id, dataToSend)
      } else {
        await deudaService.create(dataToSend)
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error al guardar deuda:', err)
      setError(err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la deuda`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Deuda" : "Nueva Deuda"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Nombre de la Deuda *"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Préstamo Personal Banco XYZ"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">
              Tipo de Deuda *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full input-field"
              required
            >
              <option value="PRESTAMO_PERSONAL">Préstamo Personal</option>
              <option value="HIPOTECA">Hipoteca</option>
              <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
              <option value="PRESTAMO_ESTUDIANTIL">Préstamo Estudiantil</option>
              <option value="PRESTAMO_AUTO">Préstamo de Auto</option>
              <option value="LINEA_CREDITO">Línea de Crédito</option>
              <option value="OTRO">Otros</option>
            </select>
          </div>

          <Input
            label="Acreedor"
            type="text"
            name="acreedor"
            value={formData.acreedor}
            onChange={handleChange}
            placeholder="Banco o institución"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Monto Total *"
            type="number"
            name="montoTotal"
            value={formData.montoTotal}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />

          <Input
            label="Monto Pagado"
            type="number"
            name="montoPagado"
            value={formData.montoPagado}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Tasa (%)"
            type="number"
            name="tasaInteres"
            value={formData.tasaInteres}
            onChange={handleChange}
            placeholder="Ej: 15"
            step="0.01"
            min="0"
            max="100"
          />

          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">
              Tipo de tasa
            </label>
            <select
              name="tipoTasa"
              value={formData.tipoTasa}
              onChange={handleChange}
              className="w-full input-field"
            >
              <option value="MENSUAL">Mensual</option>
              <option value="ANUAL">Anual</option>
            </select>
          </div>

          <Input
            label="Plazo (meses)"
            type="number"
            name="plazoMeses"
            value={formData.plazoMeses}
            onChange={handleChange}
            placeholder="Ej: 1"
            step="1"
            min="1"
          />
        </div>

        {formData.montoTotal && formData.tasaInteres && formData.plazoMeses && (
          <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 text-amber-900 px-4 py-3 rounded-lg text-sm">
            {(() => {
              const capital = parseFloat(formData.montoTotal)
              const tasa = parseFloat(formData.tasaInteres) / 100
              const meses = parseInt(formData.plazoMeses, 10)
              const periodos = formData.tipoTasa === 'ANUAL' ? meses / 12 : meses
              const total = capital * (1 + tasa * periodos)
              const tipoLabel = formData.tipoTasa === 'ANUAL' ? 'anual' : 'mensual'
              return (
                <>
                  Con interés ({formData.tasaInteres}% {tipoLabel} × {meses}{' '}
                  {meses === 1 ? 'mes' : 'meses'}):{' '}
                  <span className="font-semibold">{formatMoney(total)}</span>
                </>
              )
            })()}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha de Inicio *"
            type="date"
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleChange}
            required
          />

          <Input
            label="Fecha de Vencimiento"
            type="date"
            name="fechaVencimiento"
            value={formData.fechaVencimiento}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">
            Notas (opcional)
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            placeholder="Notas sobre esta deuda..."
            className="w-full input-field resize-none"
            rows="3"
          />
        </div>

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
            {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Deuda' : 'Crear Deuda')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalDeuda
