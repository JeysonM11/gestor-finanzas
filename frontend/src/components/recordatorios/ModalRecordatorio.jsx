import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { recordatorioService } from '../../services/recordatorio.service'
import { todayDateInput, toDateInputValue } from '../../utils/date'

const TIPOS = ['GENERAL', 'PAGO', 'META', 'PRESUPUESTO', 'INVERSION', 'DEUDA']
const FRECUENCIAS = ['DIARIA', 'SEMANAL', 'MENSUAL']

const initialForm = () => ({
  titulo: '',
  descripcion: '',
  tipo: 'GENERAL',
  fechaRecordatorio: todayDateInput(),
  repetir: false,
  frecuencia: 'MENSUAL',
})

const ModalRecordatorio = ({
  isOpen,
  onClose,
  onSuccess,
  recordatorio = null,
  defaults = null,
}) => {
  const isEditing = !!recordatorio
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm())
      setError('')
      return
    }

    if (recordatorio) {
      setFormData({
        titulo: recordatorio.titulo || '',
        descripcion: recordatorio.descripcion || '',
        tipo: recordatorio.tipo || 'GENERAL',
        fechaRecordatorio: recordatorio.fechaRecordatorio
          ? toDateInputValue(recordatorio.fechaRecordatorio)
          : todayDateInput(),
        repetir: Boolean(recordatorio.repetir),
        frecuencia: recordatorio.frecuencia || 'MENSUAL',
      })
      return
    }

    if (defaults) {
      setFormData({
        ...initialForm(),
        titulo: defaults.titulo || '',
        descripcion: defaults.descripcion || '',
        tipo: defaults.tipo || 'GENERAL',
        fechaRecordatorio: defaults.fechaRecordatorio
          ? toDateInputValue(defaults.fechaRecordatorio)
          : todayDateInput(),
        repetir: Boolean(defaults.repetir),
        frecuencia: defaults.frecuencia || 'MENSUAL',
      })
    } else {
      setFormData(initialForm())
    }
  }, [recordatorio, defaults, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion?.trim() || null,
        tipo: formData.tipo,
        fechaRecordatorio: formData.fechaRecordatorio,
        repetir: Boolean(formData.repetir),
        frecuencia: formData.repetir ? formData.frecuencia : null,
      }
      if (isEditing) {
        await recordatorioService.update(recordatorio.id, payload)
      } else {
        await recordatorioService.create(payload)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el recordatorio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar recordatorio' : 'Nuevo recordatorio'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Título *"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ej: Pagar tarjeta"
          required
          maxLength={150}
        />

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full input-field resize-none"
            rows="2"
            maxLength={1000}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Tipo</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full input-field"
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Fecha *"
            type="date"
            name="fechaRecordatorio"
            value={formData.fechaRecordatorio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="repetir"
            name="repetir"
            checked={formData.repetir}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-line rounded"
          />
          <label htmlFor="repetir" className="text-sm text-ink">
            Repetir
          </label>
        </div>

        {formData.repetir && (
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">Frecuencia *</label>
            <select
              name="frecuencia"
              value={formData.frecuencia}
              onChange={handleChange}
              className="w-full input-field"
              required
            >
              {FRECUENCIAS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-line">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalRecordatorio
