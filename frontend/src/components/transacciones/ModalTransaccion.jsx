import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Input from '../common/Input'
import { transaccionService } from '../../services/transaccion.service'
import { cuentaService } from '../../services/cuenta.service'
import { deudaService } from '../../services/deuda.service'
import { CATEGORIAS_DEFAULT, METODOS_PAGO, categoriasParaTipo } from '../../utils/constants'
import { formatMoney } from '../../utils/currency'
import { todayDateInput, toDateInputValue } from '../../utils/date'

const initialForm = () => ({
  tipo: 'GASTO',
  monto: '',
  descripcion: '',
  categoria: '',
  fecha: todayDateInput(),
  metodoPago: 'EFECTIVO',
  notas: '',
  cuentaOrigenId: '',
  cuentaDestinoId: '',
  deudaId: '',
})

const idCuentaAfectada = (transaccion) => {
  if (!transaccion) return ''
  const id = transaccion.cuentaOrigenId || transaccion.cuentaDestinoId
  return id ? String(id) : ''
}

/** Campos visibles por tipo — un solo formulario reactivo */
const CAMPOS_POR_TIPO = {
  GASTO: {
    descripcion: true,
    cuentaOrigen: true,
    cuentaDestino: false,
    metodoPago: true,
    categoria: true,
    deuda: false,
  },
  INGRESO: {
    descripcion: true,
    cuentaOrigen: true,
    cuentaDestino: false,
    metodoPago: false,
    categoria: true,
    deuda: false,
  },
  TRANSFERENCIA: {
    descripcion: false,
    cuentaOrigen: true,
    cuentaDestino: true,
    metodoPago: false,
    categoria: false,
    deuda: false,
  },
  PAGO_DEUDA: {
    descripcion: false,
    cuentaOrigen: true,
    cuentaDestino: false,
    metodoPago: false,
    categoria: false,
    deuda: true,
  },
}

const FieldReveal = ({ show, children }) => {
  if (!show) return null
  return <div className="animate-fade-in">{children}</div>
}

const ModalTransaccion = ({ isOpen, onClose, onSuccess, transaccion = null }) => {
  const isEditing = !!transaccion

  const [formData, setFormData] = useState(initialForm)
  const [cuentas, setCuentas] = useState([])
  const [deudas, setDeudas] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCuentas, setLoadingCuentas] = useState(false)
  const [loadingDeudas, setLoadingDeudas] = useState(false)
  const [errorCuentas, setErrorCuentas] = useState(false)
  const [error, setError] = useState('')

  const campos = CAMPOS_POR_TIPO[formData.tipo] || CAMPOS_POR_TIPO.GASTO
  const deudaSeleccionada = deudas.find((d) => String(d.id) === String(formData.deudaId))
  const saldoPendienteVisible = (() => {
    if (!deudaSeleccionada) return 0
    const actual = Number(deudaSeleccionada.montoActual) || 0
    if (
      isEditing &&
      Number(transaccion?.deudaId) === Number(deudaSeleccionada.id)
    ) {
      return actual + (Number(transaccion.monto) || 0)
    }
    return actual
  })()

  useEffect(() => {
    if (!isOpen) return

    const cargarCuentas = async () => {
      try {
        setLoadingCuentas(true)
        setErrorCuentas(false)
        const data = await cuentaService.getAll()
        const activas = data.cuentas || data || []

        const extras = []
        if (transaccion?.cuentaOrigen && !activas.some((c) => c.id === transaccion.cuentaOrigen.id)) {
          extras.push({
            ...transaccion.cuentaOrigen,
            activa: false,
            saldoActual: transaccion.cuentaOrigen.saldoActual,
          })
        }
        if (
          transaccion?.cuentaDestino &&
          !activas.some((c) => c.id === transaccion.cuentaDestino.id) &&
          !extras.some((c) => c.id === transaccion.cuentaDestino.id)
        ) {
          extras.push({
            ...transaccion.cuentaDestino,
            activa: false,
            saldoActual: transaccion.cuentaDestino.saldoActual,
          })
        }

        const idsActivas = new Set(activas.map((c) => c.id))
        const idsExtras = new Set(extras.map((c) => c.id))
        if (transaccion?.cuentaOrigenId && !idsActivas.has(transaccion.cuentaOrigenId) && !idsExtras.has(transaccion.cuentaOrigenId)) {
          extras.push({
            id: transaccion.cuentaOrigenId,
            nombre: `Cuenta #${transaccion.cuentaOrigenId} (inactiva)`,
            activa: false,
          })
        }
        if (
          transaccion?.cuentaDestinoId &&
          !idsActivas.has(transaccion.cuentaDestinoId) &&
          !idsExtras.has(transaccion.cuentaDestinoId)
        ) {
          extras.push({
            id: transaccion.cuentaDestinoId,
            nombre: `Cuenta #${transaccion.cuentaDestinoId} (inactiva)`,
            activa: false,
          })
        }

        setCuentas([...activas, ...extras])
      } catch (err) {
        console.error('Error al cargar cuentas:', err)
        setCuentas([])
        setErrorCuentas(true)
      } finally {
        setLoadingCuentas(false)
      }
    }

    cargarCuentas()
  }, [isOpen, transaccion])

  useEffect(() => {
    if (!isOpen) return

    const cargarDeudas = async () => {
      try {
        setLoadingDeudas(true)
        const data = await deudaService.getAll()
        const lista = data.deudas || data || []
        const pagables = lista.filter(
          (d) => !d.pagada && Number(d.montoActual) > 0
        )

        // Al editar, incluir la deuda vinculada aunque ya esté pagada
        if (
          transaccion?.deudaId &&
          !pagables.some((d) => d.id === transaccion.deudaId)
        ) {
          const vinculada =
            lista.find((d) => d.id === transaccion.deudaId) ||
            (transaccion.deuda
              ? { ...transaccion.deuda, montoActual: Number(transaccion.monto) || 0 }
              : null)
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
  }, [isOpen, transaccion])

  useEffect(() => {
    if (transaccion && isOpen) {
      const origenId =
        transaccion.tipo === 'INGRESO'
          ? idCuentaAfectada(transaccion)
          : transaccion.cuentaOrigenId
            ? String(transaccion.cuentaOrigenId)
            : ''

      setFormData({
        tipo: transaccion.tipo || 'GASTO',
        monto: transaccion.monto || '',
        descripcion: transaccion.descripcion || '',
        categoria: transaccion.categoria || '',
        fecha: transaccion.fecha ? toDateInputValue(transaccion.fecha) : todayDateInput(),
        metodoPago: transaccion.metodoPago || 'EFECTIVO',
        notas: transaccion.notas || '',
        cuentaOrigenId: origenId,
        cuentaDestinoId: transaccion.cuentaDestinoId
          ? String(transaccion.cuentaDestinoId)
          : '',
        deudaId: transaccion.deudaId ? String(transaccion.deudaId) : '',
      })
    } else if (!isOpen) {
      setFormData(initialForm())
      setError('')
      setErrorCuentas(false)
    }
  }, [transaccion, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }

      if (name === 'tipo') {
        next.categoria = ''
        next.deudaId = ''
        next.cuentaDestinoId = ''

        if (value === 'TRANSFERENCIA') {
          next.metodoPago = 'TRANSFERENCIA'
          next.descripcion = ''
        } else if (value === 'PAGO_DEUDA') {
          next.metodoPago = 'EFECTIVO'
          next.descripcion = ''
        } else if (prev.tipo === 'TRANSFERENCIA' || prev.tipo === 'PAGO_DEUDA') {
          next.metodoPago = 'EFECTIVO'
        }
      }

      return next
    })
    setError('')
  }

  const etiquetaCuentaAfectada = () => {
    if (formData.tipo === 'INGRESO') return 'Cuenta destino *'
    if (formData.tipo === 'PAGO_DEUDA') return 'Cuenta desde donde se paga *'
    if (formData.tipo === 'GASTO') return 'Cuenta de origen *'
    return 'Cuenta origen *'
  }

  const etiquetaMonto = () => {
    if (formData.tipo === 'PAGO_DEUDA') return 'Monto a pagar *'
    return 'Monto *'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (campos.deuda && !formData.deudaId) {
      setError('Selecciona la deuda a pagar')
      return
    }

    if (!formData.cuentaOrigenId) {
      setError(
        formData.tipo === 'INGRESO'
          ? 'Selecciona la cuenta destino'
          : formData.tipo === 'PAGO_DEUDA'
            ? 'Selecciona la cuenta desde donde se paga'
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

    if (formData.tipo === 'PAGO_DEUDA' && deudaSeleccionada) {
      const montoPago = parseFloat(formData.monto)
      if (montoPago > saldoPendienteVisible + 0.001) {
        setError(
          `No puedes pagar más del saldo pendiente (${formatMoney(saldoPendienteVisible)})`
        )
        return
      }
    }

    if (campos.descripcion && !formData.descripcion?.trim()) {
      setError('La descripción es obligatoria')
      return
    }

    if (errorCuentas) {
      setError('No se pudieron cargar las cuentas. Reintenta antes de guardar.')
      return
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
        fecha: formData.fecha,
        cuentaOrigenId: Number(formData.cuentaOrigenId),
      }

      if (formData.notas) dataToSend.notas = formData.notas

      if (formData.tipo === 'TRANSFERENCIA') {
        dataToSend.cuentaDestinoId = Number(formData.cuentaDestinoId)
        dataToSend.metodoPago = 'TRANSFERENCIA'
        dataToSend.descripcion =
          formData.descripcion?.trim() || 'Transferencia entre cuentas'
        dataToSend.categoria = null
        dataToSend.deudaId = null
      } else if (formData.tipo === 'PAGO_DEUDA') {
        dataToSend.deudaId = Number(formData.deudaId)
        dataToSend.descripcion =
          formData.descripcion?.trim() ||
          (deudaSeleccionada
            ? `Pago de deuda: ${deudaSeleccionada.nombre}`
            : 'Pago de deuda')
        dataToSend.categoria = null
        dataToSend.metodoPago = null
        dataToSend.cuentaDestinoId = null
      } else {
        dataToSend.descripcion = formData.descripcion
        if (formData.categoria) dataToSend.categoria = formData.categoria
        if (formData.tipo === 'GASTO') dataToSend.metodoPago = formData.metodoPago
        if (isEditing) {
          dataToSend.cuentaDestinoId = null
          dataToSend.deudaId = null
        }
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

  const etiquetaOpcionCuenta = (cuenta) => {
    const saldo =
      cuenta.saldoActual != null ? ` (${formatMoney(cuenta.saldoActual)})` : ''
    const inactiva = cuenta.activa === false ? ' — inactiva' : ''
    return `${cuenta.nombre}${saldo}${inactiva}`
  }

  const etiquetaOpcionDeuda = (deuda) => {
    const pendiente = formatMoney(deuda.montoActual)
    return `${deuda.nombre} — pendiente ${pendiente}`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Transacción' : 'Nueva Transacción'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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
            label={etiquetaMonto()}
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <FieldReveal show={campos.descripcion}>
          <Input
            label="Descripción *"
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Ej: Compra de supermercado"
            required={campos.descripcion}
          />
        </FieldReveal>

        <FieldReveal show={campos.deuda}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">
                Deuda *
              </label>
              <select
                name="deudaId"
                value={formData.deudaId}
                onChange={handleChange}
                className="w-full input-field"
                required={campos.deuda}
                disabled={loadingDeudas}
              >
                <option value="">
                  {loadingDeudas ? 'Cargando deudas...' : 'Seleccionar deuda'}
                </option>
                {deudas.map((deuda) => (
                  <option key={deuda.id} value={deuda.id}>
                    {etiquetaOpcionDeuda(deuda)}
                  </option>
                ))}
              </select>
              {!loadingDeudas && deudas.length === 0 && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 rounded-lg px-3 py-2 mt-2">
                  No hay deudas activas con saldo pendiente.
                </p>
              )}
            </div>

            {deudaSeleccionada && (
              <div className="rounded-lg border border-line bg-surface-muted/60 px-3 py-3 text-sm space-y-1.5 transition-opacity duration-300">
                <p className="text-ink">
                  <span className="text-ink-muted">Acreedor:</span>{' '}
                  {deudaSeleccionada.acreedor || '—'}
                </p>
                <p className="text-ink">
                  <span className="text-ink-muted">Valor total:</span>{' '}
                  {formatMoney(
                    deudaSeleccionada.montoConInteres ??
                      deudaSeleccionada.montoInicial
                  )}
                </p>
                <p className="text-ink font-medium">
                  <span className="text-ink-muted font-normal">Saldo pendiente:</span>{' '}
                  {formatMoney(saldoPendienteVisible)}
                </p>
              </div>
            )}
          </div>
        </FieldReveal>

        <div
          className={`grid grid-cols-1 gap-4 transition-all duration-300 ${
            campos.cuentaDestino || campos.metodoPago
              ? 'md:grid-cols-2'
              : 'md:grid-cols-1'
          }`}
        >
          <FieldReveal show={campos.cuentaOrigen}>
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">
                {etiquetaCuentaAfectada()}
              </label>
              <select
                name="cuentaOrigenId"
                value={formData.cuentaOrigenId}
                onChange={handleChange}
                className="w-full input-field"
                required={campos.cuentaOrigen}
                disabled={loadingCuentas}
              >
                <option value="">
                  {loadingCuentas ? 'Cargando cuentas...' : 'Seleccionar cuenta'}
                </option>
                {cuentas.map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {etiquetaOpcionCuenta(cuenta)}
                  </option>
                ))}
              </select>
            </div>
          </FieldReveal>

          <FieldReveal show={campos.cuentaDestino}>
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">
                Cuenta destino *
              </label>
              <select
                name="cuentaDestinoId"
                value={formData.cuentaDestinoId}
                onChange={handleChange}
                className="w-full input-field"
                required={campos.cuentaDestino}
                disabled={loadingCuentas}
              >
                <option value="">
                  {loadingCuentas ? 'Cargando cuentas...' : 'Seleccionar cuenta'}
                </option>
                {cuentas
                  .filter((c) => String(c.id) !== String(formData.cuentaOrigenId))
                  .map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>
                      {etiquetaOpcionCuenta(cuenta)}
                    </option>
                  ))}
              </select>
            </div>
          </FieldReveal>

          <FieldReveal show={campos.metodoPago}>
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">
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
          </FieldReveal>
        </div>

        {errorCuentas && !loadingCuentas && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 rounded-lg px-3 py-2">
            No se pudieron cargar las cuentas. Cierra y vuelve a abrir el
            formulario.
          </p>
        )}

        {!errorCuentas && cuentas.length === 0 && !loadingCuentas && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 rounded-lg px-3 py-2">
            No tienes cuentas activas. Crea una en Cuentas para que el saldo se
            actualice.
          </p>
        )}

        <div
          className={`grid grid-cols-1 gap-4 transition-all duration-300 ${
            campos.categoria ? 'md:grid-cols-2' : 'md:grid-cols-1'
          }`}
        >
          <FieldReveal show={campos.categoria}>
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
          </FieldReveal>

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
          <label className="block text-sm font-medium text-ink-muted mb-2">
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
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
