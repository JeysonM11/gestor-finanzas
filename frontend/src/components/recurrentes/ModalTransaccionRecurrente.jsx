import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { transaccionRecurrenteService } from '../../services/transaccion-recurrente.service'
import { CATEGORIAS_DEFAULT, categoriasParaTipo } from '../../utils/constants'

const ModalTransaccionRecurrente = ({ isOpen, onClose, onSuccess, transaccion = null }) => {
  const isEditing = !!transaccion
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'GASTO',
    monto: '',
    categoria: '',
    frecuencia: 'MENSUAL',
    diaEjecucion: new Date().getDate(),
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    activa: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (transaccion && isOpen) {
      setFormData({
        nombre: transaccion.nombre || '',
        descripcion: transaccion.descripcion || '',
        tipo: transaccion.tipo || 'GASTO',
        monto: transaccion.monto || '',
        categoria: transaccion.categoria || '',
        frecuencia: transaccion.frecuencia || 'MENSUAL',
        diaEjecucion: transaccion.diaEjecucion || new Date().getDate(),
        fechaInicio: transaccion.fechaInicio ? new Date(transaccion.fechaInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fechaFin: transaccion.fechaFin ? new Date(transaccion.fechaFin).toISOString().split('T')[0] : '',
        activa: transaccion.activa !== undefined ? transaccion.activa : true
      })
    } else if (!isOpen) {
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: 'GASTO',
        monto: '',
        categoria: '',
        frecuencia: 'MENSUAL',
        diaEjecucion: new Date().getDate(),
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        activa: true
      })
      setError('')
    }
  }, [transaccion, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        monto: parseFloat(formData.monto),
        diaEjecucion: parseInt(formData.diaEjecucion)
      }

      if (isEditing) {
        await transaccionRecurrenteService.update(transaccion.id, dataToSend)
      } else {
        await transaccionRecurrenteService.create(dataToSend)
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error al guardar transacción recurrente:', err)
      setError(err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la transacción recurrente`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Transacción Recurrente" : "Nueva Transacción Recurrente"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Nombre *"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Alquiler mensual"
          required
        />

        <Input
          label="Descripción"
          type="text"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Detalles adicionales"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full input-field"
              required
            >
              <option value="INGRESO">Ingreso</option>
              <option value="GASTO">Gasto</option>
            </select>
          </div>

          <Input
            label="Monto *"
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              className="w-full input-field"
            >
              <option value="">Sin categoría</option>
              {categoriasParaTipo(formData.tipo).map((c) => (
                <option key={c.nombre} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
              {formData.categoria &&
                !CATEGORIAS_DEFAULT.some((c) => c.nombre === formData.categoria) && (
                  <option value={formData.categoria}>{formData.categoria}</option>
                )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia *
            </label>
            <select
              name="frecuencia"
              value={formData.frecuencia}
              onChange={handleChange}
              className="w-full input-field"
              required
            >
              <option value="DIARIA">Diaria</option>
              <option value="SEMANAL">Semanal</option>
              <option value="QUINCENAL">Quincenal</option>
              <option value="MENSUAL">Mensual</option>
              <option value="ANUAL">Anual</option>
            </select>
          </div>
        </div>

        {(formData.frecuencia === 'MENSUAL' || formData.frecuencia === 'ANUAL') && (
          <Input
            label="Día de Ejecución *"
            type="number"
            name="diaEjecucion"
            value={formData.diaEjecucion}
            onChange={handleChange}
            min="1"
            max="31"
            required
          />
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
            label="Fecha de Fin (opcional)"
            type="date"
            name="fechaFin"
            value={formData.fechaFin}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="activa"
            checked={formData.activa}
            onChange={handleChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Transacción activa
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
            {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar' : 'Crear Transacción')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalTransaccionRecurrente
