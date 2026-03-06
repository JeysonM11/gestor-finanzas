# Gestor de Finanzas - Frontend

Frontend desarrollado con React, Vite y Tailwind CSS para gestionar finanzas personales.

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos
- **Recharts** - Gráficos (opcional para reportes)
- **Day.js** - Manejo de fechas

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# o con yarn
yarn install
```

## 🔧 Configuración

El proyecto está configurado para conectarse al backend en `http://localhost:5000`. Si necesitas cambiar la URL del API, edita el archivo `vite.config.js`:

```javascript
server: {
  port: 5173,  // Puerto del frontend
  proxy: {
    '/api': {
      target: 'http://localhost:5000', // Cambia aquí la URL del backend
      changeOrigin: true,
    },
  },
}
```

## 🏃 Desarrollo

```bash
npm run dev
```

El servidor de desarrollo se ejecutará en `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

Los archivos de producción se generarán en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── layout/         # Componentes de layout (Header, Sidebar, Layout)
│   └── common/         # Componentes comunes (Button, Input, Card)
├── pages/              # Páginas de la aplicación
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Transacciones.jsx
│   ├── Reportes.jsx
│   └── Configuracion.jsx
├── services/           # Servicios API
│   ├── api.js         # Configuración de axios
│   ├── auth.service.js
│   ├── transaccion.service.js
│   ├── reporte.service.js
│   └── categoria.service.js
├── context/            # Context API
│   └── AuthContext.jsx
├── hooks/              # Custom hooks
│   └── useFetch.js
├── utils/              # Utilidades
│   ├── format.js
│   └── constants.js
├── App.jsx             # Componente principal
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales
```

## 🎨 Características

### Autenticación
- Login y registro de usuarios
- Protección de rutas privadas
- Context API para manejo de estado de autenticación
- Persistencia de sesión con localStorage

### Dashboard
- Resumen de ingresos, gastos y balance
- Últimas transacciones
- Tarjetas con estadísticas clave

### Transacciones
- Lista de todas las transacciones
- Filtros por tipo, fecha y categoría
- Agregar, editar y eliminar transacciones

### Reportes
- Gráficos de gastos por categoría
- Evolución mensual de finanzas
- Exportación de datos

### Configuración
- Perfil de usuario
- Preferencias de notificaciones
- Seguridad y privacidad

## 🎯 Próximos Pasos

El proyecto está completamente estructurado. Puedes continuar desarrollando:

1. **Modales y Formularios**: Agregar modales para crear/editar transacciones
2. **Gráficos**: Implementar gráficos con Recharts en la página de Reportes
3. **Validación**: Mejorar validación de formularios
4. **Responsive**: Optimizar diseño para móviles
5. **Notificaciones**: Sistema de notificaciones toast
6. **Categorías**: Gestión de categorías personalizadas
7. **Transacciones Recurrentes**: Implementar funcionalidad de transacciones recurrentes

## 📝 Notas

- El proyecto usa Tailwind CSS con clases personalizadas definidas en `index.css`
- Los colores primarios están configurados en `tailwind.config.js`
- El interceptor de Axios maneja automáticamente la autenticación y redirecciones
- Todos los endpoints del API están centralizados en los servicios

## 🤝 Integración con Backend

Asegúrate de que el backend esté corriendo en `http://localhost:5000` con los siguientes endpoints:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/transacciones`
- `POST /api/transacciones`
- `PUT /api/transacciones/:id`
- `DELETE /api/transacciones/:id`
- `GET /api/reportes/*`
- `GET /api/categorias`

---

¡Listo para desarrollar! 🚀
