import { useState, useEffect } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import ModalTransaccion from '../components/transacciones/ModalTransaccion'
import { transaccionService } from '../services/transaccion.service'
import { Plus, Search, Filter } from 'lucide-react'
import dayjs from 'dayjs'

const Transacciones = () => {
  const [transacciones, setTransacciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [filtros, setFiltros] = useState({
    tipo: '',
    fechaInicio: '',
    fechaFin: ''
  })

  useEffect(() => {
    cargarTransacciones()
  }, [filtros])

  const cargarTransacciones = async () => {
    try {
      // Filtrar parámetros vacíos
      const params = Object.entries(filtros).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const data = await transaccionService.getAll(params)
      setTransacciones(data.transacciones || data)
    } catch (error) {
      console.error('Error al cargar transacciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    })
  }

  const handleTransaccionCreada = () => {
    cargarTransacciones()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
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

      {/* Modal */}
      <ModalTransaccion 
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSuccess={handleTransaccionCreada}
      />

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-2" />
              Tipo
            </label>
            <select
              name="tipo"
              value={filtros.tipo}
              onChange={handleFiltroChange}
              className="w-full input-field"
            >
              <option value="">Todos</option>
              <option value="INGRESO">Ingresos</option>
              <option value="GASTO">Gastos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              className="w-full input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
              className="w-full input-field"
            />
          </div>

          <div className="flex items-end">
            <Button variant="secondary" className="w-full">
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de transacciones */}
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaccion.tipo === 'INGRESO' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaccion.tipo}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      transaccion.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaccion.tipo === 'INGRESO' ? '+' : '-'}${transaccion.monto.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
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
