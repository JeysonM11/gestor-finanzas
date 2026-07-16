import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { metaService } from '../../services/meta.service'
import { toDateInputValue } from '../../utils/date'

const TIPOS = ['AHORRO', 'EMERGENCIA', 'INVERSION', 'DEUDA', 'GASTO']
const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']

const ModalMeta = ({ isOpen, onClose, onSuccess, meta = null }) => {
  const isEditing = !!meta
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'AHORRO',
    montoObjetivo: '',
    montoActual: '0',
    fechaLimite: '',
    categoria: '',
    prioridad: 'MEDIA',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (meta && isOpen) {
      setFormData({
        titulo: meta.titulo || '',
        descripcion: meta.descripcion || '',
        tipo: meta.tipo || 'AHORRO',
        montoObjetivo: meta.montoObjetivo ?? '',
        montoActual: meta.montoActual ?? 0,
        fechaLimite: meta.fechaLimite
          ? toDateInputValue(meta.fechaLimite)
          : '',
        categoria: meta.categoria || '',
        prioridad: meta.prioridad || 'MEDIA',
      })
    } else if (!isOpen) {
      setFormData({
        titulo: '',
        descripcion: '',
        tipo: 'AHORRO',
        montoObjetivo: '',
        montoActual: '0',
        fechaLimite: '',
        categoria: '',
        prioridad: 'MEDIA',
      })
      setError('')
    }
  }, [meta, isOpen])

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
        ...formData,
        montoObjetivo: parseFloat(formData.montoObjetivo),
        montoActual: parseFloat(formData.montoActual) || 0,
      }
      if (isEditing) {
        await metaService.update(meta.id, payload)
      } else {
        await metaService.create(payload)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la meta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Meta' : 'Nueva Meta'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Título *"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full input-field resize-none"
            rows="2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              className="w-full input-field"
            >
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Monto objetivo *"
            type="number"
            name="montoObjetivo"
            value={formData.montoObjetivo}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
          <Input
            label="Monto actual"
            type="number"
            name="montoActual"
            value={formData.montoActual}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
          <Input
            label="Fecha límite *"
            type="date"
            name="fechaLimite"
            value={formData.fechaLimite}
            onChange={handleChange}
            required
          />
          <Input
            label="Categoría"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Meta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalMeta
