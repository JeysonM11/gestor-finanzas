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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-10 w-44 rounded-card" />
    </div>
    <div className="stat-grid">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 rounded-card" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
      <Skeleton className="h-72 rounded-card" />
      <Skeleton className="h-72 rounded-card" />
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
      <Skeleton className="h-64 rounded-card xl:col-span-2" />
      <Skeleton className="h-64 rounded-card" />
    </div>
  </div>
)

export default Skeleton
