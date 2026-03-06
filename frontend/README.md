# Gestor de Finanzas - Frontend 💳

Aplicación web para gestión de finanzas personales desarrollada con React, Vite y Tailwind CSS.

## 🚀 Tecnologías

- **React** (v18.2.0) - Biblioteca de UI
- **Vite** (v5.0.11) - Build tool y dev server ultrarrápido
- **Tailwind CSS** (v3.4.1) - Framework CSS utility-first
- **React Router DOM** (v6.21.1) - Enrutamiento
- **Axios** (v1.6.5) - Cliente HTTP
- **Day.js** (v1.11.10) - Manejo de fechas
- **Recharts** (v2.10.3) - Gráficos y visualizaciones
- **Lucide React** - Iconos modernos
- **clsx** - Utilidad para clase CSS condicional

## 📦 Instalación

```bash
cd frontend
npm install
```

## 🔧 Configuración

El frontend se conecta al backend en `http://localhost:5000`. Si necesitas cambiar esta configuración, edita el archivo de servicio API en `src/services/api.js`.

## 🏃 Desarrollo

```bash
npm run dev
```

El servidor se ejecutará en `http://localhost:5173`

## 🏗️ Build de Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

### Preview del build
```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── layout/         # Header, Sidebar, Layout
│   └── common/         # Button, Input, Card, etc.
├── pages/              # Páginas principales
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Transacciones.jsx
│   ├── Reportes.jsx
│   └── Configuracion.jsx
├── services/           # Servicios para llamadas API
│   ├── api.js         # Configuración de Axios
│   ├── auth.service.js
│   ├── transaccion.service.js
│   └── reporte.service.js
├── context/            # Context API de React
│   └── AuthContext.jsx
├── hooks/              # Custom hooks
│   └── useFetch.js
├── utils/              # Utilidades y helpers
│   ├── format.js
│   └── constants.js
├── App.jsx             # Componente raíz
├── main.jsx            # Punto de entrada
└── index.css           # Estilos globales + Tailwind
```

## ✨ Funcionalidades

### 🔐 Autenticación
- Registro e inicio de sesión
- Protección de rutas privadas
- Context API para gestión de estado
- Persistencia de sesión con localStorage
- Interceptores de Axios para tokens

### 📊 Dashboard
- Resumen de ingresos, gastos y balance
- Tarjetas con métricas clave
- Últimas transacciones
- Gráficos de tendencias

### 💸 Transacciones
- Lista completa de transacciones
- Filtros por tipo, fecha y categoría
- Crear, editar y eliminar transacciones
- Categorización automática

### 📈 Reportes
- Gráficos de gastos por categoría (Recharts)
- Análisis de tendencias mensuales
- Exportación de datos
- Reportes personalizados

### ⚙️ Configuración
- Gestión de perfil de usuario
- Preferencias de la aplicación
- Configuración de categorías

## 🎨 Estilos

El proyecto usa **Tailwind CSS** con configuración personalizada:

- Colores primarios definidos en `tailwind.config.js`
- Clases personalizadas en `index.css`
- Diseño responsive mobile-first
- Dark mode preparado (opcional)

## 🔌 Integración con Backend

El frontend espera que el backend esté corriendo en `http://localhost:5000` con los siguientes endpoints:

### Autenticación
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Transacciones
- `GET /api/transacciones`
- `POST /api/transacciones`
- `GET /api/transacciones/:id`
- `PUT /api/transacciones/:id`
- `DELETE /api/transacciones/:id`

### Reportes
- `GET /api/reportes/resumen`
- `GET /api/reportes/por-categoria`
- `GET /api/reportes/tendencias`

## 📝 Scripts

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # Linter ESLint
```

## 🌐 Variables de Entorno (Opcional)

Si necesitas configurar variables de entorno, crea un archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

Y úsalas en el código con `import.meta.env.VITE_API_URL`

## 👨‍💻 Autor

**Jeyson Miranda**

## 📄 Licencia

ISC

---

¡Desarrollado con ❤️ usando React y Vite!
