import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services/auth.service'
import { reporteService } from '../services/reporte.service'
import { Card, Button, Input, Alert, Badge } from '../components/ui'
import { MONEDAS } from '../utils/currency'
import { User, Lock, Bell, Download, Shield, Moon, Tags } from 'lucide-react'
import CategoriasConfig from '../components/categorias/CategoriasConfig'
import SesionesSeguridad from '../components/configuracion/SesionesSeguridad'

const Configuracion = () => {
  const { user, setUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('perfil')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  // Estado para perfil
  const [perfilData, setPerfilData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    ocupacion: user?.ocupacion || ''
  })

  // Estado para contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Estado para preferencias
  const [preferencias, setPreferencias] = useState({
    notificacionesEmail: user?.configuracion?.notificacionesEmail ?? true,
    notificacionesPush: user?.configuracion?.notificacionesPush ?? true,
    notificacionesTransacciones: user?.configuracion?.notificacionesTransacciones ?? true,
    notificacionesRecurrentes: user?.configuracion?.notificacionesRecurrentes ?? true,
    monedaPrincipal: user?.monedaPrincipal || 'USD',
    tema: user?.configuracion?.tema || theme || 'system',
  })

  useEffect(() => {
    if (!user) return
    setPerfilData({
      name: user.name || '',
      email: user.email || '',
      telefono: user.telefono || '',
      ocupacion: user.ocupacion || ''
    })
    setPreferencias((prev) => ({
      ...prev,
      notificacionesEmail: user.configuracion?.notificacionesEmail ?? true,
      notificacionesPush: user.configuracion?.notificacionesPush ?? true,
      notificacionesTransacciones: user.configuracion?.notificacionesTransacciones ?? true,
      notificacionesRecurrentes: user.configuracion?.notificacionesRecurrentes ?? true,
      monedaPrincipal: user.monedaPrincipal || 'USD',
      tema: user.configuracion?.tema || prev.tema || 'system',
    }))
  }, [user])

  useEffect(() => {
    setPreferencias((prev) =>
      prev.tema === theme ? prev : { ...prev, tema: theme }
    )
  }, [theme])

  const handlePerfilChange = (e) => {
    setPerfilData({
      ...perfilData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handlePreferenciasChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextValue = type === 'checkbox' ? checked : value
    setPreferencias({
      ...preferencias,
      [name]: nextValue,
    })
    if (name === 'tema') {
      setTheme(value)
    }
  }

  const handleGuardarPreferencias = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      setTheme(preferencias.tema)
      const response = await authService.updatePreferences(preferencias)
      if (response.user) {
        setUser(response.user)
      }
      setMensaje({ tipo: 'success', texto: response.message || 'Preferencias guardadas exitosamente' })
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.message || 'Error al guardar preferencias'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGuardarPerfil = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje({ tipo: '', texto: '' })

    try {
      const response = await authService.updateProfile({
        name: perfilData.name,
        telefono: perfilData.telefono,
        ocupacion: perfilData.ocupacion
      })
      if (response.user) {
        setUser(response.user)
      }
      setMensaje({ tipo: 'success', texto: response.message || 'Perfil actualizado exitosamente' })
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.message || 'Error al actualizar perfil'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCambiarPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje({ tipo: '', texto: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden' })
      setLoading(false)
      return
    }

    try {
      const response = await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setMensaje({ tipo: 'success', texto: response.message || 'Contraseña actualizada exitosamente' })
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.message || 'Error al cambiar contraseña'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportarDatos = async () => {
    setLoading(true)
    setMensaje({ tipo: '', texto: '' })
    try {
      const blob = await reporteService.exportarCSV()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'transacciones.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setMensaje({ tipo: 'success', texto: 'Exportacion iniciada' })
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: error.response?.data?.message || 'Error al exportar datos'
      })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguridad', label: 'Seguridad', icon: Lock },
    { id: 'notificaciones', label: 'Preferencias', icon: Bell },
    { id: 'categorias', label: 'Categorías', icon: Tags },
    { id: 'datos', label: 'Datos', icon: Download }
  ]

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Personaliza tu experiencia</p>
        </div>
      </div>

      {mensaje.texto && (
        <Alert variant={mensaje.tipo === 'success' ? 'success' : 'error'}>
          {mensaje.texto}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMensaje({ tipo: '', texto: '' })
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-950/50 dark:text-primary-300'
                      : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </Card>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          {/* Pestaña Perfil */}
          {activeTab === 'perfil' && (
            <Card>
              <h2 className="text-xl font-bold text-ink mb-6">Información del Perfil</h2>
              <form onSubmit={handleGuardarPerfil} className="space-y-4">
                <Input
                  label="Nombre completo"
                  type="text"
                  name="name"
                  value={perfilData.name}
                  onChange={handlePerfilChange}
                  placeholder="Tu nombre"
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={perfilData.email}
                  onChange={handlePerfilChange}
                  placeholder="tu@email.com"
                  required
                  disabled
                />
                <p className="text-xs text-ink-subtle -mt-2">
                  El email no se puede cambiar desde esta pantalla.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Teléfono"
                    type="tel"
                    name="telefono"
                    value={perfilData.telefono}
                    onChange={handlePerfilChange}
                    placeholder="+1234567890"
                  />

                  <Input
                    label="Ocupación"
                    type="text"
                    name="ocupacion"
                    value={perfilData.ocupacion}
                    onChange={handlePerfilChange}
                    placeholder="Tu ocupación"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  {user?.rol === 'ADMIN' && (
                    <Badge variant="purple">
                      <Shield className="h-3 w-3" />
                      Administrador
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-line">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Pestaña Seguridad */}
          {activeTab === 'seguridad' && (
            <>
            <Card>
              <h2 className="text-xl font-bold text-ink mb-6">Cambiar Contraseña</h2>
              <form onSubmit={handleCambiarPassword} className="space-y-4">
                <Input
                  label="Contraseña actual"
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                />

                <Input
                  label="Nueva contraseña"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                />

                <Input
                  label="Confirmar nueva contraseña"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                />

                <Alert variant="info">
                  <strong>Requisitos:</strong> Mínimo 6 caracteres, una mayúscula, una minúscula y un número.
                </Alert>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-line">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </Button>
                </div>
              </form>
            </Card>
            <SesionesSeguridad />
            </>
          )}

          {/* Pestaña Notificaciones */}
          {activeTab === 'notificaciones' && (
            <Card>
              <h2 className="text-xl font-bold text-ink mb-6">Preferencias</h2>
              <form onSubmit={handleGuardarPreferencias} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-line bg-surface-muted/40">
                    <Moon className="h-5 w-5 text-ink-muted mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <label className="block text-sm font-medium text-ink mb-1">
                        Apariencia
                      </label>
                      <p className="text-sm text-ink-muted mb-3">
                        Claro, oscuro o según el sistema
                      </p>
                      <select
                        name="tema"
                        value={preferencias.tema}
                        onChange={handlePreferenciasChange}
                        className="w-full input-field"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Oscuro</option>
                        <option value="system">Sistema</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">Notificaciones por email</p>
                      <p className="text-sm text-ink-muted">Recibe actualizaciones por correo electrónico</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notificacionesEmail"
                      checked={preferencias.notificacionesEmail}
                      onChange={handlePreferenciasChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-line rounded"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">Notificaciones push</p>
                      <p className="text-sm text-ink-muted">Recibe notificaciones en tiempo real</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notificacionesPush"
                      checked={preferencias.notificacionesPush}
                      onChange={handlePreferenciasChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-line rounded"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">Notificaciones de transacciones</p>
                      <p className="text-sm text-ink-muted">Recibe alertas cuando se registren transacciones</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notificacionesTransacciones"
                      checked={preferencias.notificacionesTransacciones}
                      onChange={handlePreferenciasChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-line rounded"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">Recordatorios de transacciones recurrentes</p>
                      <p className="text-sm text-ink-muted">Recibe recordatorios antes de ejecutar pagos recurrentes</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notificacionesRecurrentes"
                      checked={preferencias.notificacionesRecurrentes}
                      onChange={handlePreferenciasChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-line rounded"
                    />
                  </div>
                </div>

                <div className="border-t border-line pt-6">
                  <label className="block text-sm font-medium text-ink-muted mb-2">
                    Moneda principal
                  </label>
                  <select
                    name="monedaPrincipal"
                    value={preferencias.monedaPrincipal}
                    onChange={handlePreferenciasChange}
                    className="w-full input-field"
                  >
                    {MONEDAS.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-ink-subtle">
                    Se usa para mostrar montos en dashboard, transacciones, reportes y demás pantallas.
                    Las cuentas bancarias conservan su propia moneda.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-line">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? 'Guardando...' : 'Guardar Preferencias'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'categorias' && <CategoriasConfig />}

          {activeTab === 'datos' && (
            <Card>
              <h2 className="text-xl font-bold text-ink mb-6">Gestión de Datos</h2>
              <div className="space-y-6">
                <div className="p-4 border border-line rounded-lg">
                  <h3 className="font-medium text-ink mb-2">Exportar datos</h3>
                  <p className="text-sm text-ink-muted mb-4">
                    Descarga una copia de tus transacciones en formato CSV.
                  </p>
                  <Button variant="secondary" onClick={handleExportarDatos} disabled={loading} className="w-full sm:w-auto">
                    <Download className="h-4 w-4" />
                    {loading ? 'Exportando...' : 'Exportar Datos'}
                  </Button>
                </div>

                <Alert variant="error">
                  <h3 className="font-medium mb-2">Zona de peligro</h3>
                  <p className="mb-4">
                    La eliminación de cuenta aún no está implementada en el backend.
                  </p>
                  <Button variant="danger" disabled className="w-full sm:w-auto">
                    Eliminar mi cuenta (próximamente)
                  </Button>
                </Alert>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Configuracion
