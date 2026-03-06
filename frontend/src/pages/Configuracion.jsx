import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { User, Bell, Lock, Database } from 'lucide-react'

const Configuracion = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-2">Personaliza tu experiencia</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <User className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Perfil</h2>
          </div>
          <p className="text-gray-600 mb-4">Actualiza tu información personal</p>
          <Button variant="outline">Editar Perfil</Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Notificaciones</h2>
          </div>
          <p className="text-gray-600 mb-4">Configura tus preferencias de notificaciones</p>
          <Button variant="outline">Configurar</Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Seguridad</h2>
          </div>
          <p className="text-gray-600 mb-4">Cambia tu contraseña y opciones de seguridad</p>
          <Button variant="outline">Gestionar</Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Datos</h2>
          </div>
          <p className="text-gray-600 mb-4">Exporta o elimina tus datos</p>
          <Button variant="outline">Ver Opciones</Button>
        </Card>
      </div>
    </div>
  )
}

export default Configuracion
