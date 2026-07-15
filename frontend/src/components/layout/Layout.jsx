import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutProvider } from './LayoutContext'
import Sidebar from './Sidebar'
import Header from './Header'
import { Spinner } from '../ui'

const LayoutShell = () => (
  <div className="flex h-dvh bg-surface-muted overflow-hidden">
    <Sidebar />
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-3 sm:p-5 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
)

const Layout = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-surface-muted">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <LayoutProvider>
      <LayoutShell />
    </LayoutProvider>
  )
}

export default Layout
