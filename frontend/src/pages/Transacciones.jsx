import { useState, useEffect } from 'react'
import { Card, Button, Spinner, Select, Input, Badge } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalTransaccion from '../components/transacciones/ModalTransaccion'
import { transaccionService } from '../services/transaccion.service'
import { useToast } from '../context/ToastContext'
import { useCurrency } from '../hooks/useCurrency'
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '../utils/date'

const Transacciones = () => {
  const toast = useToast()
  const { formatMoney } = useCurrency()
  const [transacciones, setTransacciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [transaccionAEliminar, setTransaccionAEliminar] = useState(null)
  const [filtros, setFiltros] = useState({
    tipo: '',
    fechaInicio: '',
    fechaFin: '',
    search: '',
    montoMin: '',
    montoMax: '',
  })
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    cargarTransacciones()
  }, [filtros])

  const cargarTransacciones = async () => {
    try {
      setLoading(true)
      const params = Object.entries(filtros).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})

      const data = await transaccionService.getAll(params)
      setTransacciones(data.transacciones || data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar transacciones')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value,
    })
  }

  const handleBuscar = (e) => {
    e?.preventDefault?.()
    setFiltros((prev) => ({ ...prev, search: searchInput.trim() }))
  }

  const handleTransaccionCreada = () => {
    cargarTransacciones()
  }

  const handleEditar = (transaccion) => {
    setTransaccionSeleccionada(transaccion)
    setModalAbierto(true)
  }

  const handleEliminar = (transaccion) => {
    setTransaccionAEliminar(transaccion)
    setConfirmDialogOpen(true)
  }

  const confirmarEliminar = async () => {
    if (!transaccionAEliminar) return

    try {
      await transaccionService.delete(transaccionAEliminar.id)
      toast.success('Transacción eliminada')
      cargarTransacciones()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar')
    }
  }

  const handleCloseModal = () => {
    setModalAbierto(false)
    setTransaccionSeleccionada(null)
  }

  const tipoBadge = (tipo) => {
    if (tipo === 'INGRESO') return 'green'
    if (tipo === 'TRANSFERENCIA') return 'blue'
    if (tipo === 'PAGO_DEUDA') return 'yellow'
    return 'red'
  }

  const etiquetaTipo = (tipo) => {
    if (tipo === 'PAGO_DEUDA') return 'Pagar deuda'
    return tipo
  }

  const etiquetaCuenta = (transaccion) => {
    if (transaccion.tipo === 'TRANSFERENCIA') {
      const origen = transaccion.cuentaOrigen?.nombre
      const destino = transaccion.cuentaDestino?.nombre
      if (origen && destino) return `${origen} → ${destino}`
      return origen || destino || null
    }
    if (transaccion.tipo === 'PAGO_DEUDA' && transaccion.deuda?.nombre) {
      const cuenta = transaccion.cuentaOrigen?.nombre
      return cuenta
        ? `${cuenta} → ${transaccion.deuda.nombre}`
        : transaccion.deuda.nombre
    }
    return (
      transaccion.cuentaOrigen?.nombre ||
      transaccion.cuentaDestino?.nombre ||
      null
    )
  }

  const signoMonto = (tipo) => {
    if (tipo === 'INGRESO') return '+'
    if (tipo === 'TRANSFERENCIA') return ''
    return '-'
  }

  const colorMonto = (tipo) => {
    if (tipo === 'INGRESO') return 'text-emerald-600'
    if (tipo === 'TRANSFERENCIA') return 'text-primary-700'
    return 'text-red-600'
  }

  if (loading && transacciones.length === 0) {
    return <Spinner fullPage />
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Transacciones</h1>
          <p className="page-subtitle">Gestiona tus ingresos y gastos</p>
        </div>
        <Button onClick={() => setModalAbierto(true)} className="w-full sm:w-auto shrink-0">
          <Plus className="h-4 w-4" />
          Nueva Transacción
        </Button>
      </div>

      <ModalTransaccion
        isOpen={modalAbierto}
        onClose={handleCloseModal}
        onSuccess={handleTransaccionCreada}
        transaccion={transaccionSeleccionada}
      />

      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmarEliminar}
        title="¿Eliminar transacción?"
        message="Esta acción no se puede deshacer. La transacción será eliminada permanentemente."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      <Card>
        <form
          onSubmit={handleBuscar}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
        >
          <Select
            label={
              <span className="inline-flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Tipo
              </span>
            }
            name="tipo"
            value={filtros.tipo}
            onChange={handleFiltroChange}
          >
            <option value="">Todos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="GASTO">Gastos</option>
            <option value="TRANSFERENCIA">Transferencias</option>
            <option value="PAGO_DEUDA">Pagos de deuda</option>
          </Select>

          <Input
            label="Fecha Inicio"
            type="date"
            name="fechaInicio"
            value={filtros.fechaInicio}
            onChange={handleFiltroChange}
          />

          <Input
            label="Fecha Fin"
            type="date"
            name="fechaFin"
            value={filtros.fechaFin}
            onChange={handleFiltroChange}
          />

          <Input
            label="Monto mín."
            type="number"
            name="montoMin"
            value={filtros.montoMin}
            onChange={handleFiltroChange}
            placeholder="0"
            step="0.01"
            min="0"
          />

          <Input
            label="Monto máx."
            type="number"
            name="montoMax"
            value={filtros.montoMax}
            onChange={handleFiltroChange}
            placeholder="0"
            step="0.01"
            min="0"
          />

          <Input
            label="Buscar"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Descripción o notas..."
          />

          <div className="flex items-end sm:col-span-2 xl:col-span-1">
            <Button type="submit" variant="secondary" className="w-full">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        </form>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {transacciones.length > 0 ? (
          transacciones.map((transaccion) => {
            const cuentaLabel = etiquetaCuenta(transaccion)
            return (
            <Card key={transaccion.id} className="!p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{transaccion.descripcion}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {formatDate(transaccion.fecha)} ·{' '}
                    {transaccion.categoria || '-'}
                    {cuentaLabel ? ` · ${cuentaLabel}` : ''}
                  </p>
                  <div className="mt-2">
                    <Badge variant={tipoBadge(transaccion.tipo)}>
                      {etiquetaTipo(transaccion.tipo)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`font-semibold tabular-nums ${colorMonto(transaccion.tipo)}`}
                  >
                    {signoMonto(transaccion.tipo)}
                    {formatMoney(transaccion.monto)}
                  </p>
                  <div className="flex justify-end gap-1 mt-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEditar(transaccion)}
                      aria-label="Editar"
                    >
                      <Edit className="h-4 w-4 text-primary-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEliminar(transaccion)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            )
          })
        ) : (
          <Card>
            <p className="text-center text-ink-muted py-8 text-sm">
              No se encontraron transacciones
            </p>
          </Card>
        )}
      </div>

      {/* Desktop / tablet table */}
      <Card padding={false} className="hidden md:block overflow-hidden">
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Cuenta</th>
                <th>Tipo</th>
                <th className="text-right">Monto</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.length > 0 ? (
                transacciones.map((transaccion) => (
                  <tr key={transaccion.id}>
                    <td className="whitespace-nowrap">
                      {formatDate(transaccion.fecha)}
                    </td>
                    <td className="max-w-[14rem] truncate">{transaccion.descripcion}</td>
                    <td className="text-ink-muted">{transaccion.categoria || '-'}</td>
                    <td className="text-ink-muted max-w-[10rem] truncate">
                      {etiquetaCuenta(transaccion) || '-'}
                    </td>
                    <td>
                      <Badge variant={tipoBadge(transaccion.tipo)}>
                        {etiquetaTipo(transaccion.tipo)}
                      </Badge>
                    </td>
                    <td
                      className={`text-right font-medium tabular-nums ${colorMonto(transaccion.tipo)}`}
                    >
                      {signoMonto(transaccion.tipo)}
                      {formatMoney(transaccion.monto)}
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEditar(transaccion)}
                          aria-label="Editar"
                        >
                          <Edit className="h-4 w-4 text-primary-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEliminar(transaccion)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="!text-center text-ink-muted py-10">
                    No se encontraron transacciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default Transacciones
