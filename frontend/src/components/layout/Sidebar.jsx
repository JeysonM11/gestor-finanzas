import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Repeat,
  CreditCard,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Trophy,
  Settings,
  Wallet,
  Bell,
  BellRing,
  Target,
  PieChart,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'
import { useLayout } from './LayoutContext'
import { cn } from '../../utils/cn'
import { recordatorioService } from '../../services/recordatorio.service'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transacciones', label: 'Transacciones', icon: ArrowLeftRight },
  { path: '/recurrentes', label: 'Recurrentes', icon: Repeat },
  { path: '/cuentas', label: 'Cuentas', icon: CreditCard },
  { path: '/inversiones', label: 'Inversiones', icon: TrendingUp },
  { path: '/deudas', label: 'Deudas', icon: AlertCircle },
  { path: '/metas', label: 'Metas', icon: Target },
  { path: '/presupuestos', label: 'Presupuestos', icon: PieChart },
  { path: '/reportes', label: 'Reportes', icon: BarChart3 },
  { path: '/gamificacion', label: 'Gamificación', icon: Trophy },
  { path: '/recordatorios', label: 'Recordatorios', icon: BellRing, badgeKey: 'recordatorios' },
  { path: '/notificaciones', label: 'Notificaciones', icon: Bell },
  { path: '/configuracion', label: 'Configuración', icon: Settings },
]

const SidebarPanel = ({ collapsed, showCollapseToggle, onCloseMobile, badges = {} }) => (
  <>
    <div
      className={cn(
        'flex items-center border-b border-line shrink-0',
        collapsed ? 'justify-center px-2 py-4' : 'gap-2.5 px-4 py-4'
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shrink-0">
        <Wallet className="h-5 w-5" aria-hidden="true" />
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink truncate">Finanzas</p>
          <p className="text-[11px] text-ink-subtle truncate">Panel personal</p>
        </div>
      )}
      {onCloseMobile && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-control text-ink-muted hover:bg-surface-muted"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>

    <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-0.5" aria-label="Principal">
      {menuItems.map((item) => {
        const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            title={
              collapsed
                ? badgeCount > 0
                  ? `${item.label} (${badgeCount})`
                  : item.label
                : undefined
            }
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-control text-sm font-medium transition-colors duration-150',
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative shrink-0">
                  <item.icon
                    className={cn(
                      'h-[18px] w-[18px] transition-colors',
                      isActive
                        ? 'text-primary-600'
                        : 'text-ink-subtle group-hover:text-ink-muted'
                    )}
                    aria-hidden="true"
                  />
                  {collapsed && badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[10px] font-semibold text-white">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className="truncate flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="ml-auto shrink-0 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 px-2 py-0.5 text-[11px] font-semibold">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>

    {showCollapseToggle && (
      <div className="hidden lg:flex border-t border-line p-2 shrink-0">
        <CollapseButton collapsed={collapsed} />
      </div>
    )}
  </>
)

const CollapseButton = ({ collapsed }) => {
  const { toggleCollapsed } = useLayout()
  return (
    <button
      type="button"
      onClick={toggleCollapsed}
      className={cn(
        'flex w-full items-center gap-2 rounded-control px-3 py-2 text-sm text-ink-muted hover:bg-surface-muted hover:text-ink transition-colors',
        collapsed && 'justify-center px-2'
      )}
      aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
    >
      {collapsed ? (
        <PanelLeftOpen className="h-4 w-4" />
      ) : (
        <>
          <PanelLeftClose className="h-4 w-4" />
          <span>Colapsar</span>
        </>
      )}
    </button>
  )
}

const Sidebar = () => {
  const { mobileOpen, closeMobile, collapsed } = useLayout()
  const [pendientesRecordatorios, setPendientesRecordatorios] = useState(0)

  useEffect(() => {
    let cancelled = false

    const cargarBadge = async () => {
      try {
        const data = await recordatorioService.getAll({ soloPendientes: true })
        if (!cancelled) {
          setPendientesRecordatorios(data.resumen?.pendientes ?? data.recordatorios?.length ?? 0)
        }
      } catch {
        if (!cancelled) setPendientesRecordatorios(0)
      }
    }

    cargarBadge()
    const interval = setInterval(cargarBadge, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const badges = { recordatorios: pendientesRecordatorios }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100%,16rem)] flex-col bg-surface border-r border-line shadow-dropdown transition-transform duration-sidebar ease-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Navegación móvil"
      >
        <SidebarPanel
          collapsed={false}
          onCloseMobile={closeMobile}
          badges={badges}
        />
      </aside>

      <aside
        className={cn(
          'hidden lg:flex shrink-0 flex-col bg-surface border-r border-line h-full transition-[width] duration-sidebar ease-out',
          collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
        )}
        aria-label="Navegación"
      >
        <SidebarPanel
          collapsed={collapsed}
          showCollapseToggle
          badges={badges}
        />
      </aside>
    </>
  )
}

export default Sidebar
