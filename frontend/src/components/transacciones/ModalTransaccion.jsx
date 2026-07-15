import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { transaccionService } from '../../services/transaccion.service'
import { CATEGORIAS_DEFAULT, METODOS_PAGO, categoriasParaTipo } from '../../utils/constants'

const ModalTransaccion = ({ isOpen, onClose, onSuccess, transaccion = null }) => {
  const isEditing = !!transaccion
  
  const [formData, setFormData] = useState({
    tipo: 'GASTO',
    monto: '',
    descripcion: '',
    categoria: '',
    fecha: new Date().toISOString().split('T')[0],
    metodoPago: 'EFECTIVO',
    notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar datos de transacción si estamos editando
  useEffect(() => {
    if (transaccion && isOpen) {
      setFormData({
        tipo: transaccion.tipo || 'GASTO',
        monto: transaccion.monto || '',
        descripcion: transaccion.descripcion || '',
        categoria: transaccion.categoria || '',
        fecha: transaccion.fecha ? new Date(transaccion.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        metodoPago: transaccion.metodoPago || 'EFECTIVO',
        notas: transaccion.notas || ''
      })
    } else if (!isOpen) {
      // Resetear formulario al cerrar
      setFormData({
        tipo: 'GASTO',
        monto: '',
        descripcion: '',
        categoria: '',
        fecha: new Date().toISOString().split('T')[0],
        metodoPago: 'EFECTIVO',
        notas: ''
      })
      setError('')
    }
  }, [transaccion, isOpen])

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
      // Convertir monto a número
      const dataToSend = {
        ...formData,
        monto: parseFloat(formData.monto)
      }

      if (isEditing) {
        await transaccionService.update(transaccion.id, dataToSend)
      } else {
        await transaccionService.create(dataToSend)
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error al guardar transacción:', err)
      setError(err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la transacción`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Transacción" : "Nueva Transacción"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo */}
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
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          {/* Monto */}
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

        {/* Descripción */}
        <Input
          label="Descripción *"
          type="text"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Ej: Compra de supermercado"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Categoría */}
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
              {/* Mantener valor al editar si no está en la lista filtrada */}
              {formData.categoria &&
                !CATEGORIAS_DEFAULT.some((c) => c.nombre === formData.categoria) && (
                  <option value={formData.categoria}>{formData.categoria}</option>
                )}
            </select>
          </div>

          {/* Fecha */}
          <Input
            label="Fecha *"
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </div>

        {/* Método de Pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago
          </label>
          <select
            name="metodoPago"
            value={formData.metodoPago}
            onChange={handleChange}
            className="w-full input-field"
          >
            {METODOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            placeholder="Agrega notas adicionales..."
            className="w-full input-field resize-none"
            rows="3"
          />
        </div>

        {/* Botones */}
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
            {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Transacción' : 'Crear Transacción')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalTransaccion
