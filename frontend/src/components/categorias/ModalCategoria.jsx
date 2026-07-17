import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { categoriaService } from '../../services/categoria.service'
import {
  Wallet,
  Home,
  Car,
  ShoppingCart,
  Heart,
  Briefcase,
  Coffee,
  Plane,
  Tags,
} from 'lucide-react'

export const ICONOS_CATEGORIA = [
  { value: 'Wallet', label: 'Wallet', Icon: Wallet },
  { value: 'Home', label: 'Home', Icon: Home },
  { value: 'Car', label: 'Car', Icon: Car },
  { value: 'ShoppingCart', label: 'ShoppingCart', Icon: ShoppingCart },
  { value: 'Heart', label: 'Heart', Icon: Heart },
  { value: 'Briefcase', label: 'Briefcase', Icon: Briefcase },
  { value: 'Coffee', label: 'Coffee', Icon: Coffee },
  { value: 'Plane', label: 'Plane', Icon: Plane },
]

export function resolveCategoriaIcon(name) {
  const found = ICONOS_CATEGORIA.find((i) => i.value === name)
  return found?.Icon || Tags
}

const initialForm = () => ({
  nombre: '',
  tipo: 'GASTO',
  color: '#6B7280',
  icono: '',
  orden: '',
  descripcion: '',
})

const ModalCategoria = ({ isOpen, onClose, onSuccess, categoria = null }) => {
  const isEditing = !!categoria
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (categoria && isOpen) {
      setFormData({
        nombre: categoria.nombre || '',
        tipo: categoria.tipo === 'INGRESO' ? 'INGRESO' : 'GASTO',
        color: categoria.color || '#6B7280',
        icono: categoria.icono || '',
        orden: categoria.orden != null ? String(categoria.orden) : '',
        descripcion: categoria.descripcion || '',
      })
    } else if (!isOpen) {
      setFormData(initialForm())
      setError('')
    }
  }, [categoria, isOpen])

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
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        color: formData.color || '#6B7280',
        icono: formData.icono?.trim() || null,
        descripcion: formData.descripcion?.trim() || null,
      }
      if (formData.orden !== '' && formData.orden != null) {
        const n = Number(formData.orden)
        if (!Number.isNaN(n)) payload.orden = n
      }
      if (isEditing) {
        await categoriaService.update(categoria.id, payload)
      } else {
        await categoriaService.create(payload)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la categoría')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar categoría' : 'Nueva categoría'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Nombre *"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Mascotas"
          required
          maxLength={100}
        />

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">Tipo *</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full input-field"
            required
          >
            <option value="GASTO">Gasto</option>
            <option value="INGRESO">Ingreso</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="color"
              value={formData.color || '#6B7280'}
              onChange={handleChange}
              className="h-10 w-14 cursor-pointer rounded border border-line bg-transparent"
            />
            <span className="text-sm text-ink-muted">{formData.color}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">Icono</label>
          <select
            name="icono"
            value={formData.icono}
            onChange={handleChange}
            className="w-full input-field"
          >
            <option value="">Sin icono</option>
            {ICONOS_CATEGORIA.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {formData.icono && (
            <div className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
              {(() => {
                const Icon = resolveCategoriaIcon(formData.icono)
                return <Icon className="h-5 w-5" style={{ color: formData.color }} />
              })()}
              <span>{formData.icono}</span>
            </div>
          )}
        </div>

        <Input
          label="Orden"
          type="number"
          name="orden"
          value={formData.orden}
          onChange={handleChange}
          placeholder="Ej: 1"
          min={0}
          step={1}
        />

        <Input
          label="Descripción"
          type="text"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Opcional"
          maxLength={500}
        />

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

export default ModalCategoria
