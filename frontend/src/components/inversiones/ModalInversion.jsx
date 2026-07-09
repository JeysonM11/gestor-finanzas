import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { inversionService } from '../../services/inversion.service'

const ModalInversion = ({ isOpen, onClose, onSuccess, inversion = null }) => {
  const isEditing = !!inversion
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'ACCIONES',
    montoInicial: '',
    montoActual: '',
    cantidadUnidades: '',
    fechaCompra: new Date().toISOString().split('T')[0],
    broker: '',
    notas: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (inversion && isOpen) {
      setFormData({
        nombre: inversion.nombre || '',
        tipo: inversion.tipo || 'ACCIONES',
        montoInicial: inversion.montoInicial ?? inversion.montoInvertido ?? '',
        montoActual: inversion.montoActual ?? inversion.valorActual ?? '',
        cantidadUnidades: inversion.cantidadUnidades ?? inversion.cantidad ?? '',
        fechaCompra: inversion.fechaCompra ? new Date(inversion.fechaCompra).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        broker: inversion.broker || '',
        notas: inversion.notas || ''
      })
    } else if (!isOpen) {
      setFormData({
        nombre: '',
        tipo: 'ACCIONES',
        montoInicial: '',
        montoActual: '',
        cantidadUnidades: '',
        fechaCompra: new Date().toISOString().split('T')[0],
        broker: '',
        notas: ''
      })
      setError('')
    }
  }, [inversion, isOpen])

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
        montoInicial: parseFloat(formData.montoInicial),
        montoActual: parseFloat(formData.montoActual),
        cantidadUnidades: formData.cantidadUnidades
          ? parseFloat(formData.cantidadUnidades)
          : null,
        fechaCompra: formData.fechaCompra,
        broker: formData.broker,
        notas: formData.notas
      }

      if (isEditing) {
        await inversionService.update(inversion.id, dataToSend)
      } else {
        await inversionService.create(dataToSend)
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error al guardar inversión:', err)
      setError(err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la inversión`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Inversión" : "Nueva Inversión"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Nombre de la Inversión *"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Apple Inc. (AAPL)"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Inversión *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full input-field"
              required
            >
              <option value="ACCIONES">Acciones</option>
              <option value="BONOS">Bonos</option>
              <option value="FONDOS_MUTUOS">Fondos de Inversión</option>
              <option value="ETF">ETF</option>
              <option value="CRIPTOMONEDAS">Criptomonedas</option>
              <option value="BIENES_RAICES">Bienes Raíces</option>
              <option value="COMMODITIES">Commodities</option>
              <option value="OTRO">Otros</option>
            </select>
          </div>

          <Input
            label="Broker/Plataforma"
            type="text"
            name="broker"
            value={formData.broker}
            onChange={handleChange}
            placeholder="Ej: Robinhood"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Monto Inicial *"
            type="number"
            name="montoInicial"
            value={formData.montoInicial}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />

          <Input
            label="Monto Actual *"
            type="number"
            name="montoActual"
            value={formData.montoActual}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cantidad de Unidades"
            type="number"
            name="cantidadUnidades"
            value={formData.cantidadUnidades}
            onChange={handleChange}
            placeholder="0"
            step="0.0001"
            min="0"
          />

          <Input
            label="Fecha de Compra *"
            type="date"
            name="fechaCompra"
            value={formData.fechaCompra}
            onChange={handleChange}
            required
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
            placeholder="Notas sobre esta inversión..."
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
            {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Inversión' : 'Crear Inversión')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalInversion
