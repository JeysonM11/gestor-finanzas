import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { deudaService } from '../../services/deuda.service'

const ModalDeuda = ({ isOpen, onClose, onSuccess, deuda = null }) => {
  const isEditing = !!deuda
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'PRESTAMO',
    montoTotal: '',
    montoPagado: '',
    tasaInteres: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    acreedor: '',
    frecuenciaPago: 'MENSUAL',
    notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (deuda && isOpen) {
      setFormData({
        nombre: deuda.nombre || '',
        tipo: deuda.tipo || 'PRESTAMO',
        montoTotal: deuda.montoTotal || '',
        montoPagado: deuda.montoPagado || '',
        tasaInteres: deuda.tasaInteres || '',
        fechaInicio: deuda.fechaInicio ? new Date(deuda.fechaInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        fechaVencimiento: deuda.fechaVencimiento ? new Date(deuda.fechaVencimiento).toISOString().split('T')[0] : '',
        acreedor: deuda.acreedor || '',
        frecuenciaPago: deuda.frecuenciaPago || 'MENSUAL',
        notas: deuda.notas || ''
      })
    } else if (!isOpen) {
      setFormData({
        nombre: '',
        tipo: 'PRESTAMO',
        montoTotal: '',
        montoPagado: '',
        tasaInteres: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaVencimiento: '',
        acreedor: '',
        frecuenciaPago: 'MENSUAL',
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
        ...formData,
        montoTotal: parseFloat(formData.montoTotal),
        montoPagado: parseFloat(formData.montoPagado) || 0,
        tasaInteres: parseFloat(formData.tasaInteres) || 0
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Deuda *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full input-field"
              required
            >
              <option value="PRESTAMO">Préstamo Personal</option>
              <option value="HIPOTECA">Hipoteca</option>
              <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
              <option value="PRESTAMO_ESTUDIANTIL">Préstamo Estudiantil</option>
              <option value="PRESTAMO_AUTO">Préstamo de Auto</option>
              <option value="OTROS">Otros</option>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tasa de Interés (%)"
            type="number"
            name="tasaInteres"
            value={formData.tasaInteres}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            max="100"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia de Pago
            </label>
            <select
              name="frecuenciaPago"
              value={formData.frecuenciaPago}
              onChange={handleChange}
              className="w-full input-field"
            >
              <option value="SEMANAL">Semanal</option>
              <option value="QUINCENAL">Quincenal</option>
              <option value="MENSUAL">Mensual</option>
              <option value="TRIMESTRAL">Trimestral</option>
              <option value="ANUAL">Anual</option>
            </select>
          </div>
        </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Deuda' : 'Crear Deuda')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalDeuda
