import { useState, useEffect } from 'react'
import { Card, Button, Spinner, Select, Input } from '../components/ui'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ModalTransaccion from '../components/transacciones/ModalTransaccion'
import { transaccionService } from '../services/transaccion.service'
import { useToast } from '../context/ToastContext'
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react'
import dayjs from 'dayjs'

const Transacciones = () => {
  const toast = useToast()
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

  if (loading && transacciones.length === 0) {
    return <Spinner fullPage />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-gray-600">Gestiona tus ingresos y gastos</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}>
          <Plus className="h-5 w-5 mr-2" />
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
        <form onSubmit={handleBuscar} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-2" />
              Tipo
            </label>
            <Select
              name="tipo"
              value={filtros.tipo}
              onChange={handleFiltroChange}
            >
              <option value="">Todos</option>
              <option value="INGRESO">Ingresos</option>
              <option value="GASTO">Gastos</option>
              <option value="TRANSFERENCIA">Transferencias</option>
            </Select>
          </div>

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
            label="Buscar"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Descripción o notas..."
          />

          <div className="flex items-end">
            <Button type="submit" variant="secondary" className="w-full">
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transacciones.length > 0 ? (
                transacciones.map((transaccion) => (
                  <tr key={transaccion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dayjs(transaccion.fecha).format('DD/MM/YYYY')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaccion.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaccion.categoria || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaccion.tipo === 'INGRESO'
                            ? 'bg-green-100 text-green-800'
                            : transaccion.tipo === 'TRANSFERENCIA'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaccion.tipo}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        transaccion.tipo === 'INGRESO'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaccion.tipo === 'INGRESO' ? '+' : '-'}$
                      {Number(transaccion.monto).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditar(transaccion)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEliminar(transaccion)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
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
