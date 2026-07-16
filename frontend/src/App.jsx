import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ThemeUserSync from './context/ThemeUserSync'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transacciones from './pages/Transacciones'
import TransaccionesRecurrentes from './pages/TransaccionesRecurrentes'
import Cuentas from './pages/Cuentas'
import Notificaciones from './pages/Notificaciones'
import Reportes from './pages/Reportes'
import Inversiones from './pages/Inversiones'
import Deudas from './pages/Deudas'
import Gamificacion from './pages/Gamificacion'
import Configuracion from './pages/Configuracion'
import Metas from './pages/Metas'
import Asesor from './pages/Asesor'
import Presupuestos from './pages/Presupuestos'
import Recordatorios from './pages/Recordatorios'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeUserSync />
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="transacciones" element={<Transacciones />} />
                <Route path="recurrentes" element={<TransaccionesRecurrentes />} />
                <Route path="cuentas" element={<Cuentas />} />
                <Route path="inversiones" element={<Inversiones />} />
                <Route path="deudas" element={<Deudas />} />
                <Route path="asesor" element={<Asesor />} />
                <Route path="metas" element={<Metas />} />
                <Route path="presupuestos" element={<Presupuestos />} />
                <Route path="recordatorios" element={<Recordatorios />} />
                <Route path="notificaciones" element={<Notificaciones />} />
                <Route path="reportes" element={<Reportes />} />
                <Route path="gamificacion" element={<Gamificacion />} />
                <Route path="configuracion" element={<Configuracion />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
