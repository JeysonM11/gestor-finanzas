import { useAuth } from '../../context/AuthContext'
import { LogOut, User } from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bienvenido de nuevo
          </h2>
          <p className="text-sm text-gray-500">
            Gestiona tus finanzas de manera inteligente
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">{user?.name || user?.email}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
