import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { cuentaService } from '../../services/cuenta.service'
import { useCurrency } from '../../hooks/useCurrency'
import { MONEDAS, MONEDA_DEFAULT } from '../../utils/currency'

const ModalCuenta = ({ isOpen, onClose, onSuccess, cuenta = null }) => {
  const isEditing = !!cuenta
  const { currency: monedaPrincipal } = useCurrency()
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'BANCO_AHORROS',
    banco: '',
    moneda: MONEDA_DEFAULT,
    saldoActual: '',
    color: '#3B82F6',
    icono: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cuenta && isOpen) {
      setFormData({
        nombre: cuenta.nombre || '',
        tipo: cuenta.tipo || 'BANCO_AHORROS',
        banco: cuenta.banco || '',
        moneda: cuenta.moneda || monedaPrincipal || MONEDA_DEFAULT,
        saldoActual: cuenta.saldoActual ?? '',
        color: cuenta.color || '#3B82F6',
        icono: cuenta.icono || '',
      })
    } else if (isOpen && !cuenta) {
      setFormData({
        nombre: '',
        tipo: 'BANCO_AHORROS',
        banco: '',
        moneda: monedaPrincipal || MONEDA_DEFAULT,
        saldoActual: '',
        color: '#3B82F6',
        icono: '',
      })
      setError('')
    } else if (!isOpen) {
      setFormData({
        nombre: '',
        tipo: 'BANCO_AHORROS',
        banco: '',
        moneda: monedaPrincipal || MONEDA_DEFAULT,
        saldoActual: '',
        color: '#3B82F6',
        icono: '',
      })
      setError('')
    }
  }, [cuenta, isOpen, monedaPrincipal])

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
      const saldo = parseFloat(formData.saldoActual) || 0

      if (isEditing) {
        const updateData = {
          nombre: formData.nombre,
          tipo: formData.tipo,
          banco: formData.banco,
          color: formData.color,
          moneda: formData.moneda,
        }
        if (formData.icono) updateData.icono = formData.icono

        await cuentaService.update(cuenta.id, updateData)

        const saldoOriginal = Number(cuenta.saldoActual) || 0
        if (saldo !== saldoOriginal) {
          await cuentaService.updateSaldo(cuenta.id, saldo, undefined, formData.moneda)
        }
      } else {
        await cuentaService.create({
          nombre: formData.nombre,
          tipo: formData.tipo,
          banco: formData.banco,
          moneda: formData.moneda,
          saldoInicial: saldo,
          color: formData.color,
          ...(formData.icono ? { icono: formData.icono } : {}),
        })
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Error al guardar cuenta:', err)
      setError(err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la cuenta`)
    } finally {
      setLoading(false)
    }
  }

  const coloresDisponibles = [
    { nombre: 'Azul', valor: '#3B82F6' },
    { nombre: 'Verde', valor: '#10B981' },
    { nombre: 'Púrpura', valor: '#8B5CF6' },
    { nombre: 'Rosa', valor: '#EC4899' },
    { nombre: 'Naranja', valor: '#F59E0B' },
    { nombre: 'Rojo', valor: '#EF4444' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Cuenta" : "Nueva Cuenta"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Input
          label="Nombre de la Cuenta *"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Cuenta Principal"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">
              Tipo de Cuenta *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full input-field"
              required
            >
              <option value="BANCO_AHORROS">Ahorro</option>
              <option value="BANCO_CORRIENTE">Corriente</option>
              <option value="TARJETA_CREDITO">Tarjeta de crédito</option>
              <option value="TARJETA_DEBITO">Tarjeta de débito</option>
              <option value="INVERSION">Inversión</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="CRYPTO">Crypto</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <Input
            label="Banco"
            type="text"
            name="banco"
            value={formData.banco}
            onChange={handleChange}
            placeholder="Nombre del banco"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">
              Moneda *
            </label>
            <select
              name="moneda"
              value={formData.moneda}
              onChange={handleChange}
              className="w-full input-field"
              required
            >
              {MONEDAS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Saldo Actual *"
            type="number"
            name="saldoActual"
            value={formData.saldoActual}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>

        <Input
          label="Icono (opcional)"
          type="text"
          name="icono"
          value={formData.icono}
          onChange={handleChange}
          placeholder="Ej: wallet"
        />

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">
            Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {coloresDisponibles.map((color) => (
              <button
                key={color.valor}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, color: color.valor }))}
                className={`h-10 rounded-lg transition-all ${
                  formData.color === color.valor ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                }`}
                style={{ backgroundColor: color.valor }}
                title={color.nombre}
              />
            ))}
          </div>
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
            {loading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar' : 'Crear Cuenta')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalCuenta
