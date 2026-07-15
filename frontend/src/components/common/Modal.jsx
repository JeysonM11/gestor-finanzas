import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className={cn(
            'relative w-full bg-surface border border-line shadow-modal animate-scale-in',
            'rounded-t-2xl sm:rounded-card',
            'max-h-[95dvh] sm:max-h-[90vh] flex flex-col',
            sizes[size] || sizes.md
          )}
        >
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-line shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-ink truncate">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-control text-ink-subtle hover:text-ink hover:bg-surface-muted transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
