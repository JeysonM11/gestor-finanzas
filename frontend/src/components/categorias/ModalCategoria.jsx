import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { categoriaService } from '../../services/categoria.service'

const initialForm = () => ({
  nombre: '',
  tipo: 'GASTO',
  color: '#6B7280',
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
        descripcion: formData.descripcion?.trim() || null,
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
