import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth.service'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { User, Lock, Bell, Download, Shield } from 'lucide-react'

const Configuracion = () => {
  const { user, setUser } = useAuth()
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
    monedaPrincipal: user?.monedaPrincipal || 'USD'
  })

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
    setPreferencias({
      ...preferencias,
      [name]: type === 'checkbox' ? checked : value
    })
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

  const handleGuardarPreferencias = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje({ tipo: '', texto: '' })

    try {
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

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguridad', label: 'Seguridad', icon: Lock },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'datos', label: 'Datos', icon: Download }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-2">Personaliza tu experiencia</p>
      </div>

      {/* Mensaje de éxito/error */}
      {mensaje.texto && (
        <div className={`p-4 rounded-lg ${
          mensaje.tipo === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de tabs */}
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
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">Información del Perfil</h2>
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
                <p className="text-xs text-gray-500 -mt-2">
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
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 text-sm">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Administrador</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Pestaña Seguridad */}
          {activeTab === 'seguridad' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Cambiar Contraseña</h2>
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

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Requisitos:</strong> Mínimo 6 caracteres, una mayúscula, una minúscula y un número.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Pestaña Notificaciones */}
          {activeTab === 'notificaciones' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Preferencias de Notificaciones</h2>
              <form onSubmit={handleGuardarPreferencias} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Notificaciones por email</p>
                      <p className="text-sm text-gray-500">Recibe actualizaciones por correo electrónico</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notificacionesEmail"
                      checked={preferencias.notificacionesEmail}
                      onChange={handlePreferenciasChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Notificaciones push</p>
                      <p className="text-sm text-gray-500">Recibe notificaciones en tiempo real</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notificacionesPush"
                      checked={preferencias.notificacionesPush}
                      onChange={handlePreferenciasChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Notificaciones de transacciones</p>
                      <p className="text-sm text-gray-500">Recibe alertas cuando se registren transacciones</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notificacionesTransacciones"
                      checked={preferencias.notificacionesTransacciones}
                      onChange={handlePreferenciasChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Recordatorios de transacciones recurrentes</p>
                      <p className="text-sm text-gray-500">Recibe recordatorios antes de ejecutar pagos recurrentes</p>
                    </div>
                    <input
                      type="checkbox"
                      name="notificacionesRecurrentes"
                      checked={preferencias.notificacionesRecurrentes}
                      onChange={handlePreferenciasChange}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda principal
                  </label>
                  <select
                    name="monedaPrincipal"
                    value={preferencias.monedaPrincipal}
                    onChange={handlePreferenciasChange}
                    className="w-full input-field"
                  >
                    <option value="USD">USD - Dólar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="COP">COP - Peso Colombiano</option>
                    <option value="ARS">ARS - Peso Argentino</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Preferencias'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Pestaña Datos */}
          {activeTab === 'datos' && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Gestión de Datos</h2>
              <div className="space-y-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Exportar datos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    La exportación CSV estará disponible en el Sprint 3 (reportes backend).
                  </p>
                  <Button variant="secondary" disabled>
                    <Download className="h-5 w-5 mr-2" />
                    Exportar Datos (próximamente)
                  </Button>
                </div>

                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">Zona de peligro</h3>
                  <p className="text-sm text-red-600 mb-4">
                    La eliminación de cuenta aún no está implementada en el backend.
                  </p>
                  <Button variant="danger" disabled>
                    Eliminar mi cuenta (próximamente)
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Configuracion
