import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((texto, tipo = 'error', durationMs = 4000) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, texto, tipo }])
    window.setTimeout(() => removeToast(id), durationMs)
  }, [removeToast])

  const value = useMemo(
    () => ({
      showToast,
      success: (texto) => showToast(texto, 'success'),
      error: (texto) => showToast(texto, 'error'),
      info: (texto) => showToast(texto, 'info'),
    }),
    [showToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg px-4 py-3 text-sm shadow-lg border ${
              t.tipo === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : t.tipo === 'info'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span>{t.texto}</span>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-current opacity-60 hover:opacity-100"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de ToastProvider')
  }
  return ctx
}
