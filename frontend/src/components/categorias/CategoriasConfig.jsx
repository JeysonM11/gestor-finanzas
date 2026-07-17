import { useState, useEffect, useMemo } from 'react'
import { Card, Button, Spinner, EmptyState, Badge, Input } from '../ui'
import ConfirmDialog from '../common/ConfirmDialog'
import ModalCategoria, { resolveCategoriaIcon } from './ModalCategoria'
import { categoriaService } from '../../services/categoria.service'
import { useToast } from '../../context/ToastContext'
import { Plus, Edit, Trash2, Tags, Search } from 'lucide-react'

/**
 * CRUD de categorías personalizadas (pestaña Configuración).
 */
const CategoriasConfig = () => {
  const toast = useToast()
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionada, setSeleccionada] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [aEliminar, setAEliminar] = useState(null)

  const cargar = async () => {
    try {
      setLoading(true)
      const data = await categoriaService.getPersonalizadas()
      setCategorias(data.categorias || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return categorias
    return categorias.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(q) ||
        c.descripcion?.toLowerCase().includes(q) ||
        c.tipo?.toLowerCase().includes(q) ||
        c.icono?.toLowerCase().includes(q)
    )
  }, [categorias, busqueda])

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    try {
      await categoriaService.delete(aEliminar.id)
      toast.success('Categoría desactivada')
      cargar()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al desactivar')
    }
  }

  if (loading) {
    return (
      <Card>
        <Spinner />
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-ink">Categorías personalizadas</h2>
            <p className="text-sm text-ink-muted mt-1">
              Se suman a las predefinidas en transacciones, presupuestos y recurrentes.
            </p>
          </div>
          <Button
            onClick={() => {
              setSeleccionada(null)
              setModalAbierto(true)
            }}
            className="w-full sm:w-auto shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nueva
          </Button>
        </div>

        {categorias.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle pointer-events-none" />
            <Input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, tipo o icono…"
              className="pl-0"
              inputClassName="pl-9"
              aria-label="Buscar categorías"
            />
          </div>
        )}

        {filtradas.length === 0 ? (
          <EmptyState
            icon={<Tags className="h-16 w-16" />}
            title={
              categorias.length === 0
                ? 'Sin categorías personalizadas'
                : 'Sin resultados'
            }
            description={
              categorias.length === 0
                ? 'Crea una para usarla al registrar gastos o ingresos.'
                : 'Prueba con otro término de búsqueda.'
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {filtradas.map((cat) => {
              const Icon = resolveCategoriaIcon(cat.icono)
              return (
                <li
                  key={cat.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 border border-line"
                      style={{
                        backgroundColor: `${cat.color || '#6B7280'}22`,
                        color: cat.color || '#6B7280',
                      }}
                      aria-hidden
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || '#6B7280' }}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">{cat.nombre}</p>
                      {cat.descripcion && (
                        <p className="text-sm text-ink-muted truncate">{cat.descripcion}</p>
                      )}
                      <p className="text-xs text-ink-subtle mt-0.5">
                        Orden: {cat.orden != null ? cat.orden : '—'}
                        {cat.icono ? ` · ${cat.icono}` : ''}
                      </p>
                    </div>
                    <Badge variant={cat.tipo === 'INGRESO' ? 'green' : 'gray'}>
                      {cat.tipo}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSeleccionada(cat)
                        setModalAbierto(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAEliminar(cat)
                        setConfirmOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <ModalCategoria
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false)
          setSeleccionada(null)
        }}
        onSuccess={() => {
          toast.success(seleccionada ? 'Categoría actualizada' : 'Categoría creada')
          cargar()
        }}
        categoria={seleccionada}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setAEliminar(null)
        }}
        onConfirm={confirmarEliminar}
        title="¿Desactivar categoría?"
        message="Dejará de aparecer en los selectores. Los gastos e ingresos históricos conservan el nombre."
        confirmText="Desactivar"
        type="warning"
      />
    </>
  )
}

export default CategoriasConfig
