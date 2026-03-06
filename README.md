# Gestor de Finanzas Personales 💰

Sistema completo de gestión de finanzas personales con funcionalidades avanzadas como gamificación, inversiones, cuentas múltiples y análisis predictivo.

## 🏗️ Arquitectura del Proyecto

```
gestor-finanzas/
├── backend/          # API REST con Node.js + Express + Prisma
├── frontend/         # Aplicación React + Vite + Tailwind CSS
└── README.md         # Este archivo
```

## 🚀 Inicio Rápido

### Modo Manual

**Terminal 1 - Backend:**
```powershell
cd backend
npm install
# Configurar .env (ver GUIA_EJECUCION.md)
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

## 📋 Requisitos

- **Node.js** v16 o superior
- **PostgreSQL** v13 o superior
- **npm** o **yarn**

## 🔧 Tecnologías

### Backend
- **Node.js** + **Express** - Framework web
- **Prisma ORM** - Base de datos
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación
- **Jest** - Testing

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos

## 📚 Documentación

- [**backend/README.md**](backend/README.md) - Documentación del backend
- [**frontend/README.md**](frontend/README.md) - Documentación del frontend

## 📡 Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend | 5000 | http://localhost:5000 |
| Frontend | 5173 | http://localhost:5173 |
| PostgreSQL | 5432 | localhost:5432 |

## ✨ Características

### Gestión de Transacciones
- ✅ Registro de ingresos y gastos
- ✅ Categorización automática
- ✅ Transacciones recurrentes
- ✅ Múltiples cuentas bancarias

### Análisis y Reportes
- ✅ Dashboard con métricas clave
- ✅ Gráficos de gastos por categoría
- ✅ Reportes personalizados
- ✅ Exportación de datos

### Funcionalidades Avanzadas
- ✅ Sistema de metas financieras
- ✅ Presupuestos por categoría
- ✅ Gamificación con puntos y logros
- ✅ Tracking de inversiones y deudas

## 👨‍💻 Autor

**Jeyson Miranda**

## 📄 Licencia

ISC

### Gestión Básica
- ✅ Registro e inicio de sesión
- ✅ Dashboard con resumen financiero
- ✅ Gestión de transacciones (ingresos/gastos)
- ✅ Categorización de transacciones
- ✅ Filtros y búsqueda

### Características Avanzadas
- 📊 Reportes y análisis
- 💳 Múltiples cuentas bancarias
- 📈 Seguimiento de inversiones
- 💰 Gestión de deudas
- 🎯 Gamificación con logros
- 🔄 Transacciones recurrentes
- 🔔 Sistema de notificaciones

## 🛠️ Comandos Útiles

### Backend
```powershell
npm run dev              # Desarrollo
npm test                 # Tests
npm run prisma:studio    # Abrir Prisma Studio
npm run prisma:migrate   # Ejecutar migraciones
```

### Frontend
```powershell
npm run dev      # Desarrollo
npm run build    # Build producción
npm run preview  # Vista previa del build
```

## 🐛 Solución de Problemas

### Puerto ocupado
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :5000

# Terminar el proceso
taskkill /PID <PID> /F
```

### Error de conexión a la base de datos
1. Verifica que PostgreSQL esté corriendo
2. Revisa las credenciales en `backend/.env`
3. Asegúrate de que la base de datos exista

### El frontend no se conecta al backend
1. Verifica que el backend esté en el puerto 5000
2. Revisa la consola del navegador (F12)
3. Verifica el proxy en `frontend/vite.config.js`

## 📝 Configuración Inicial

1. **Clonar el repositorio**
2. **Configurar backend:**
   - Copiar `backend/.env.example` a `backend/.env`
   - Configurar las variables de entorno
   - Ejecutar migraciones: `npm run prisma:migrate`
3. **Instalar dependencias:**
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
4. **Iniciar servicios:**
   - Usar `.\iniciar.ps1` o iniciar manualmente

## 👨‍💻 Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

ISC

## 👤 Autor

Jeyson Miranda

---

Para más detalles, consulta la [**Guía de Ejecución**](GUIA_EJECUCION.md) completa.
