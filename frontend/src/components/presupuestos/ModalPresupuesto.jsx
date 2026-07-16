import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { presupuestoService } from '../../services/presupuesto.service'
import { useCategorias } from '../../hooks/useCategorias'

const ModalPresupuesto = ({ isOpen, onClose, onSuccess, presupuesto = null, mes, anio }) => {
  const isEditing = !!presupuesto
  const { categorias, categoriasParaTipo } = useCategorias({ enabled: isOpen })
  const [formData, setFormData] = useState({
    categoria: '',
    limite: '',
    alertaEn: '80',
    mes: mes,
    anio: anio,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (presupuesto && isOpen) {
      setFormData({
        categoria: presupuesto.categoria || '',
        limite: presupuesto.limite ?? '',
        alertaEn: presupuesto.alertaEn ?? 80,
        mes: presupuesto.mes,
        anio: presupuesto.anio || presupuesto.año,
      })
    } else if (!isOpen) {
      setFormData({
        categoria: '',
        limite: '',
        alertaEn: '80',
        mes,
        anio,
      })
      setError('')
    } else {
      setFormData((prev) => ({ ...prev, mes, anio }))
    }
  }, [presupuesto, isOpen, mes, anio])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        categoria: formData.categoria,
        limite: parseFloat(formData.limite),
        alertaEn: parseFloat(formData.alertaEn) || 80,
        mes: Number(formData.mes),
        anio: Number(formData.anio),
      }
      if (isEditing) {
        await presupuestoService.update(presupuesto.id, payload)
      } else {
        await presupuestoService.create(payload)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el presupuesto')
    } finally {
      setLoading(false)
    }
  }

  const categoriasGasto = categoriasParaTipo('GASTO')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">Categoría *</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="w-full input-field"
            required
          >
            <option value="">Seleccionar...</option>
            {categoriasGasto.map((c) => (
              <option key={c.id || c.nombre} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
            {formData.categoria &&
              !categorias.some((c) => c.nombre === formData.categoria) && (
                <option value={formData.categoria}>{formData.categoria}</option>
              )}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Límite *"
            type="number"
            name="limite"
            value={formData.limite}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
          <Input
            label="Alerta en (%)"
            type="number"
            name="alertaEn"
            value={formData.alertaEn}
            onChange={handleChange}
            min="1"
            max="100"
          />
          <Input
            label="Mes"
            type="number"
            name="mes"
            value={formData.mes}
            onChange={handleChange}
            min="1"
            max="12"
            required
          />
          <Input
            label="Año"
            type="number"
            name="anio"
            value={formData.anio}
            onChange={handleChange}
            min="2000"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
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

export default ModalPresupuesto
