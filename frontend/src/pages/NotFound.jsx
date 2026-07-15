import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-surface-muted relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgb(37 99 235 / 0.15), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgb(15 23 42 / 0.04), transparent)',
        }}
      />
      <div className="relative text-center max-w-md">
        <p className="text-6xl sm:text-7xl font-bold text-primary-600 mb-3 tracking-tight">404</p>
        <h1 className="text-xl sm:text-2xl font-semibold text-ink mb-2">
          Página no encontrada
        </h1>
        <p className="text-sm text-ink-muted mb-8">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link to="/dashboard">
          <Button className="w-full sm:w-auto">
            <Home className="h-4 w-4" />
            Volver al dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
