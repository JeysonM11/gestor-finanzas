import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transacciones from './pages/Transacciones'
import TransaccionesRecurrentes from './pages/TransaccionesRecurrentes'
import Cuentas from './pages/Cuentas'
import Notificaciones from './pages/Notificaciones'
import Reportes from './pages/Reportes'
import Configuracion from './pages/Configuracion'

function App() {
  return (
    <AuthProvider>
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
            <Route path="notificaciones" element={<Notificaciones />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
