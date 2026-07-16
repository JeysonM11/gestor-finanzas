import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { transaccionService } from '../../services/transaccion.service'
import { cuentaService } from '../../services/cuenta.service'
import { CATEGORIAS_DEFAULT, METODOS_PAGO, categoriasParaTipo } from '../../utils/constants'

const initialForm = () => ({
  tipo: 'GASTO',
  monto: '',
  descripcion: '',
  categoria: '',
  fecha: new Date().toISOString().split('T')[0],
  metodoPago: 'EFECTIVO',
  notas: '',
  cuentaOrigenId: '',
  cuentaDestinoId: '',
})

const ModalTransaccion = ({ isOpen, onClose, onSuccess, transaccion = null }) => {
  const isEditing = !!transaccion

  const [formData, setFormData] = useState(initialForm)
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCuentas, setLoadingCuentas] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return

    const cargarCuentas = async () => {
      try {
        setLoadingCuentas(true)
        const data = await cuentaService.getAll()
        setCuentas(data.cuentas || data || [])
      } catch (err) {
        console.error('Error al cargar cuentas:', err)
        setCuentas([])
      } finally {
        setLoadingCuentas(false)
      }
    }

    cargarCuentas()
  }, [isOpen])

  useEffect(() => {
    if (transaccion && isOpen) {
      setFormData({
        tipo: transaccion.tipo || 'GASTO',
        monto: transaccion.monto || '',
        descripcion: transaccion.descripcion || '',
        categoria: transaccion.categoria || '',
        fecha: transaccion.fecha
          ? new Date(transaccion.fecha).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        metodoPago: transaccion.metodoPago || 'EFECTIVO',
        notas: transaccion.notas || '',
        cuentaOrigenId: transaccion.cuentaOrigenId
          ? String(transaccion.cuentaOrigenId)
          : '',
        cuentaDestinoId: transaccion.cuentaDestinoId
          ? String(transaccion.cuentaDestinoId)
          : '',
      })
    } else if (!isOpen) {
      setFormData(initialForm())
      setError('')
    }
  }, [transaccion, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }

      if (name === 'tipo') {
        if (value === 'TRANSFERENCIA') {
          next.metodoPago = 'TRANSFERENCIA'
        } else if (prev.tipo === 'TRANSFERENCIA') {
          next.cuentaDestinoId = ''
          next.metodoPago = 'EFECTIVO'
        }
      }

      return next
    })
  }

  const etiquetaCuentaAfectada = () => {
    if (formData.tipo === 'INGRESO') return 'Cuenta que recibe *'
    if (formData.tipo === 'GASTO') return 'Cuenta de origen *'
    return 'Cuenta origen *'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.cuentaOrigenId) {
      setError(
        formData.tipo === 'INGRESO'
          ? 'Selecciona la cuenta donde entra el dinero'
          : 'Selecciona la cuenta de origen'
      )
      return
    }

    if (formData.tipo === 'TRANSFERENCIA') {
      if (!formData.cuentaDestinoId) {
        setError('Selecciona la cuenta destino')
        return
      }
      if (formData.cuentaOrigenId === formData.cuentaDestinoId) {
        setError('Origen y destino deben ser cuentas distintas')
        return
      }
    }

    if (cuentas.length === 0) {
      setError('Crea al menos una cuenta antes de registrar transacciones')
      return
    }

    setLoading(true)

    try {
      const dataToSend = {
        tipo: formData.tipo,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion,
        fecha: formData.fecha,
        cuentaOrigenId: Number(formData.cuentaOrigenId),
      }

      if (formData.categoria) dataToSend.categoria = formData.categoria
      if (formData.notas) dataToSend.notas = formData.notas

      if (formData.tipo === 'TRANSFERENCIA') {
        dataToSend.cuentaDestinoId = Number(formData.cuentaDestinoId)
        dataToSend.metodoPago = 'TRANSFERENCIA'
      } else {
        dataToSend.metodoPago = formData.metodoPago
        // Al editar, limpiar destino si ya no es transferencia entre cuentas
        if (isEditing) dataToSend.cuentaDestinoId = null
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
      setError(
        err.response?.data?.message ||
          `Error al ${isEditing ? 'actualizar' : 'crear'} la transacción`
      )
    } finally {
      setLoading(false)
    }
  }

  const esTransferencia = formData.tipo === 'TRANSFERENCIA'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Transacción' : 'Nueva Transacción'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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
              <option value="TRANSFERENCIA">Transferencia</option>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {etiquetaCuentaAfectada()}
            </label>
            <select
              name="cuentaOrigenId"
              value={formData.cuentaOrigenId}
              onChange={handleChange}
              className="w-full input-field"
              required
              disabled={loadingCuentas}
            >
              <option value="">
                {loadingCuentas ? 'Cargando cuentas...' : 'Seleccionar cuenta'}
              </option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.id} value={cuenta.id}>
                  {cuenta.nombre}
                  {cuenta.saldoActual != null
                    ? ` ($${Number(cuenta.saldoActual).toFixed(2)})`
                    : ''}
                </option>
              ))}
            </select>
          </div>

          {esTransferencia ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuenta destino *
              </label>
              <select
                name="cuentaDestinoId"
                value={formData.cuentaDestinoId}
                onChange={handleChange}
                className="w-full input-field"
                required
                disabled={loadingCuentas}
              >
                <option value="">
                  {loadingCuentas ? 'Cargando cuentas...' : 'Seleccionar cuenta'}
                </option>
                {cuentas
                  .filter((c) => String(c.id) !== String(formData.cuentaOrigenId))
                  .map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {cuenta.nombre}
                      {cuenta.saldoActual != null
                        ? ` ($${Number(cuenta.saldoActual).toFixed(2)})`
                        : ''}
                    </option>
                  ))}
              </select>
            </div>
          ) : (
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
          )}
        </div>

        {!esTransferencia && cuentas.length === 0 && !loadingCuentas && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            No tienes cuentas activas. Crea una en Cuentas para que el saldo se
            actualice.
          </p>
        )}

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

          <Input
            label="Fecha *"
            type="date"
            name="fecha"
            value={formData.fecha}
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
            placeholder="Agrega notas adicionales..."
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
          <Button type="submit" disabled={loading || loadingCuentas}>
            {loading
              ? isEditing
                ? 'Actualizando...'
                : 'Creando...'
              : isEditing
                ? 'Actualizar Transacción'
                : 'Crear Transacción'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalTransaccion
