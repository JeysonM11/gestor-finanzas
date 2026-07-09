import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-primary-600 mb-2">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Página no encontrada
        </h1>
        <p className="text-gray-600 mb-8">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link to="/dashboard">
          <Button>Volver al dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
