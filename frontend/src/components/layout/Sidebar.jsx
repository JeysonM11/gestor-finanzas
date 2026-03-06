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
  Wallet
} from 'lucide-react'

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transacciones', label: 'Transacciones', icon: ArrowLeftRight },
    { path: '/recurrentes', label: 'Recurrentes', icon: Repeat },
    { path: '/cuentas', label: 'Cuentas', icon: CreditCard },
    { path: '/inversiones', label: 'Inversiones', icon: TrendingUp },
    { path: '/deudas', label: 'Deudas', icon: AlertCircle },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
    { path: '/gamificacion', label: 'Gamificación', icon: Trophy },
    { path: '/configuracion', label: 'Configuración', icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="flex items-center gap-2 p-6 border-b border-gray-200">
        <Wallet className="h-8 w-8 text-primary-600" />
        <h1 className="text-xl font-bold text-gray-900">Finanzas</h1>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
