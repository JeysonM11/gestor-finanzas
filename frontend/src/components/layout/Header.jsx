import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../notifications/NotificationBell'
import { useLayout } from './LayoutContext'
import { Button } from '../ui'
import { LogOut, Menu, User } from 'lucide-react'

const Header = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { toggleMobile } = useLayout()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.name || user?.email || 'Usuario'
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 h-header shrink-0 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="flex h-full items-center gap-3 px-3 sm:px-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={toggleMobile}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-semibold text-ink truncate">
            Hola, {user?.name?.split(' ')[0] || 'de nuevo'}
          </p>
          <p className="hidden sm:block text-xs text-ink-muted truncate">
            Gestiona tus finanzas de manera inteligente
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <NotificationBell />

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-line bg-surface-muted/60 pl-1 pr-3 py-1">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-[11px] font-semibold text-white"
              aria-hidden="true"
            >
              {initials || <User className="h-3.5 w-3.5" />}
            </span>
            <span className="text-xs font-medium text-ink max-w-[9rem] truncate">
              {displayName}
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="text-ink-muted"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
