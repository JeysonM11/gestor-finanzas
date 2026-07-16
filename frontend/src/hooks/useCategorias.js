import { useState, useEffect } from 'react'
import { categoriaService } from '../services/categoria.service'
import { CATEGORIAS_DEFAULT, categoriasParaTipo as filtrarPorTipo } from '../utils/constants'

/**
 * Carga el catálogo desde API; si falla, usa CATEGORIAS_DEFAULT.
 */
export function useCategorias({ enabled = true } = {}) {
  const [categorias, setCategorias] = useState(CATEGORIAS_DEFAULT)
  const [loading, setLoading] = useState(false)
  const [fromApi, setFromApi] = useState(false)

  useEffect(() => {
    if (!enabled) return undefined

    let cancelled = false

    const cargar = async () => {
      setLoading(true)
      try {
        const data = await categoriaService.getAll()
        if (cancelled) return
        if (Array.isArray(data.categorias) && data.categorias.length > 0) {
          setCategorias(data.categorias)
          setFromApi(true)
        }
      } catch {
        if (!cancelled) {
          setCategorias(CATEGORIAS_DEFAULT)
          setFromApi(false)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    cargar()
    return () => {
      cancelled = true
    }
  }, [enabled])

  const categoriasParaTipo = (tipo) => filtrarPorTipo(tipo, categorias)

  return { categorias, loading, fromApi, categoriasParaTipo }
}
