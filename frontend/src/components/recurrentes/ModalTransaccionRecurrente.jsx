import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { transaccionRecurrenteService } from '../../services/transaccion-recurrente.service'
import { cuentaService } from '../../services/cuenta.service'
import { deudaService } from '../../services/deuda.service'
import { useCategorias } from '../../hooks/useCategorias'
import { useCurrency } from '../../hooks/useCurrency'
import { todayDateInput, toDateInputValue } from '../../utils/date'

const ModalTransaccionRecurrente = ({ isOpen, onClose, onSuccess, transaccion = null }) => {
  const isEditing = !!transaccion
  const { formatMoney } = useCurrency()
  const { categorias, categoriasParaTipo } = useCategorias({ enabled: isOpen })

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'GASTO',
    monto: '',
    categoria: '',
    frecuencia: 'MENSUAL',
    diaEjecucion: new Date().getDate(),
    fechaInicio: todayDateInput(),
    fechaFin: '',
    activa: true,
    cuentaOrigenId: '',
    cuentaDestinoId: '',
    deudaId: '',
  })
  const [cuentas, setCuentas] = useState([])
  const [deudas, setDeudas] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCuentas, setLoadingCuentas] = useState(false)
  const [loadingDeudas, setLoadingDeudas] = useState(false)
  const [error, setError] = useState('')

  const showCategoria = formData.tipo === 'INGRESO' || formData.tipo === 'GASTO'
  const showDestino = formData.tipo === 'TRANSFERENCIA'
  const showDeuda = formData.tipo === 'PAGO_DEUDA'

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
    if (!isOpen || formData.tipo !== 'PAGO_DEUDA') return

    const cargarDeudas = async () => {
      try {
        setLoadingDeudas(true)
        const data = await deudaService.getAll()
        const lista = data.deudas || data || []
        const pagables = lista.filter(
          (d) => !d.pagada && Number(d.montoActual) > 0
        )
        if (
          transaccion?.deudaId &&
          !pagables.some((d) => d.id === transaccion.deudaId)
        ) {
          const vinculada = lista.find((d) => d.id === transaccion.deudaId)
          if (vinculada) pagables.push(vinculada)
        }
        setDeudas(pagables)
      } catch (err) {
        console.error('Error al cargar deudas:', err)
        setDeudas([])
      } finally {
        setLoadingDeudas(false)
      }
    }

    cargarDeudas()
  }, [isOpen, formData.tipo, transaccion])

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
        fechaInicio: transaccion.fechaInicio ? toDateInputValue(transaccion.fechaInicio) : todayDateInput(),
        fechaFin: transaccion.fechaFin ? toDateInputValue(transaccion.fechaFin) : '',
        activa: transaccion.activa !== undefined ? transaccion.activa : true,
        cuentaOrigenId: transaccion.cuentaOrigenId ? String(transaccion.cuentaOrigenId) : '',
        cuentaDestinoId: transaccion.cuentaDestinoId ? String(transaccion.cuentaDestinoId) : '',
        deudaId: transaccion.deudaId ? String(transaccion.deudaId) : '',
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
        fechaInicio: todayDateInput(),
        fechaFin: '',
        activa: true,
        cuentaOrigenId: '',
        cuentaDestinoId: '',
        deudaId: '',
      })
      setError('')
    }
  }, [transaccion, isOpen])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }
      if (name === 'tipo') {
        if (value !== 'TRANSFERENCIA') next.cuentaDestinoId = ''
        if (value !== 'PAGO_DEUDA') next.deudaId = ''
        if (value !== 'INGRESO' && value !== 'GASTO') next.categoria = ''
      }
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        monto: parseFloat(formData.monto),
        frecuencia: formData.frecuencia,
        diaEjecucion: parseInt(formData.diaEjecucion),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin || null,
        activa: formData.activa,
        cuentaOrigenId: Number(formData.cuentaOrigenId),
      }

      if (showCategoria && formData.categoria) {
        dataToSend.categoria = formData.categoria
      }
      if (showDestino) {
        dataToSend.cuentaDestinoId = Number(formData.cuentaDestinoId)
      }
      if (showDeuda) {
        dataToSend.deudaId = Number(formData.deudaId)
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

  const etiquetaCuenta = (cuenta) => {
    const saldo = formatMoney(cuenta.saldoActual ?? 0)
    return `${cuenta.nombre} (${saldo})`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Transacción Recurrente" : "Nueva Transacción Recurrente"}>
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
            <label className="block text-sm font-medium text-ink-muted mb-2">
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
              <option value="PAGO_DEUDA">Pagar deuda</option>
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

        <div>
          <label className="block text-sm font-medium text-ink-muted mb-2">
            Cuenta origen *
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
                {etiquetaCuenta(cuenta)}
              </option>
            ))}
          </select>
        </div>

        {showDestino && (
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">
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
                    {etiquetaCuenta(cuenta)}
                  </option>
                ))}
            </select>
          </div>
        )}

        {showDeuda && (
          <div>
            <label className="block text-sm font-medium text-ink-muted mb-2">
              Deuda *
            </label>
            <select
              name="deudaId"
              value={formData.deudaId}
              onChange={handleChange}
              className="w-full input-field"
              required
              disabled={loadingDeudas}
            >
              <option value="">
                {loadingDeudas ? 'Cargando deudas...' : 'Seleccionar deuda'}
              </option>
              {deudas.map((deuda) => (
                <option key={deuda.id} value={deuda.id}>
                  {deuda.nombre} — pendiente {formatMoney(deuda.montoActual)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showCategoria && (
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">
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
          )}

          <div className={showCategoria ? '' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-ink-muted mb-2">
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
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-line rounded"
          />
          <label className="ml-2 block text-sm text-ink">
            Transacción activa
          </label>
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
            {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar' : 'Crear Transacción')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ModalTransaccionRecurrente
