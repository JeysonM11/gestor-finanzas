import { cn } from '../../utils/cn'

/**
 * Placeholder de carga (skeleton). Preparado para dark mode vía tokens.
 */
const Skeleton = ({ className = '' }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-control bg-slate-200/80 dark:bg-slate-700/60',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.4s_infinite]',
        'after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent',
        className
      )}
      aria-hidden="true"
    />
  )
}

export const PageSkeleton = () => (
  <div className="page-shell animate-fade-in" role="status" aria-label="Cargando contenido">
    <div className="space-y-2">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
    <div className="stat-grid">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-28 rounded-card" />
      ))}
    </div>
    <Skeleton className="h-64 rounded-card" />
  </div>
)

export default Skeleton
