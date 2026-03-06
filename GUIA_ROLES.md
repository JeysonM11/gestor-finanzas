# Roles Implementados - Guía Rápida

## ✅ Implementación Completada

### Cambios Realizados

#### Backend
1. **Schema Prisma Actualizado**
   - Agregado enum `Rol` con valores: `ADMIN`, `USUARIO`
   - Campo `rol` agregado al modelo `User` con valor por defecto `USUARIO`
   - Migración aplicada: `20260306180431_agregar_rol_usuario`

2. **Middleware de Autorización**
   - `authMiddleware`: Verifica token JWT
   - `requireRole(...roles)`: Verifica permisos por rol
   - Ubicación: `backend/middlewares/auth.middleware.js`

3. **Auth Controller**
   - Token JWT ahora incluye el rol: `{ id, rol }`
   - Login y Register devuelven el rol en la respuesta
   - Endpoint `/api/auth/me` incluye el rol

4. **Usuario Admin Creado**
   ```
   Email: admin@gestor-finanzas.com
   Contraseña: Admin123
   ```

#### Frontend
1. **AuthContext Actualizado**
   - Nueva propiedad: `isAdmin` - Boolean que indica si es administrador
   - Nueva función: `hasRole(rol)` - Verifica rol específico
   
2. **Dashboard Actualizado**
   - Badge de "Administrador" visible para usuarios admin
   - Importa `useAuth` para acceder al rol

## 🚀 Cómo Usar

### Probar el Sistema

1. **Iniciar sesión como Admin:**
   ```
   Email: admin@gestor-finanzas.com
   Password: Admin123
   ```
   
   Deberías ver un badge "Administrador" en el Dashboard.

2. **Iniciar sesión como Usuario Normal:**
   ```
   Email: jeyson.miranda11@hotmail.com
   Password: [tu contraseña]
   ```
   
   No verás el badge de administrador.

### Proteger Rutas en Backend

```javascript
const { authMiddleware: authenticateToken, requireRole } = require('../middlewares/auth.middleware');

// Solo para administradores
router.get('/admin/usuarios', 
  authenticateToken, 
  requireRole('ADMIN'), 
  controller.obtenerTodosUsuarios
);

// Para admin o usuario específico
router.get('/data/:id', 
  authenticateToken, 
  requireRole('ADMIN', 'USUARIO'), 
  controller.getData
);
```

### Mostrar/Ocultar Contenido en Frontend

```javascript
import { useAuth } from '../context/AuthContext';

function MiComponente() {
  const { isAdmin, hasRole } = useAuth();

  return (
    <div>
      {/* Solo para admins */}
      {isAdmin && (
        <button>Panel de Administración</button>
      )}
      
      {/* Verificar rol específico */}
      {hasRole('ADMIN') && (
        <div>Contenido Admin</div>
      )}
      
      {hasRole('USUARIO') && (
        <div>Contenido Usuario</div>
      )}
    </div>
  );
}
```

### Crear una Ruta Protegida para Admins

```javascript
// components/auth/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
}

export default AdminRoute;

// En tu router
import AdminRoute from './components/auth/AdminRoute';

<Route 
  path="/admin" 
  element={
    <AdminRoute>
      <AdminPanel />
    </AdminRoute>
  } 
/>
```

## 📝 Ejemplos Prácticos

### Backend: Endpoint para obtener todos los usuarios (solo admin)

```javascript
// controllers/admin.controller.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.obtenerTodosUsuarios = async (req, res) => {
  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      rol: true,
      activo: true,
      createdAt: true
    }
  });

  res.json({
    success: true,
    usuarios
  });
};

// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware: authenticateToken, requireRole } = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');

router.get('/usuarios', 
  authenticateToken, 
  requireRole('ADMIN'), 
  adminController.obtenerTodosUsuarios
);

module.exports = router;

// app.js - agregar la ruta
app.use('/api/admin', require('./routes/admin.routes'));
```

### Frontend: Página de Administración

```javascript
// pages/Admin.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';

function Admin() {
  const { isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/usuarios', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => res.json())
      .then(data => setUsuarios(data.usuarios))
      .catch(err => console.error(err));
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <div>No tienes permisos para ver esta página.</div>;
  }

  return (
    <div>
      <h1>Panel de Administración</h1>
      <Card>
        <h2>Usuarios Registrados</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.rol}</td>
                <td>{user.activo ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default Admin;
```

## ⚠️ Importante

1. **Cambiar contraseña del admin** después del primer login
2. **No compartir** las credenciales de admin
3. **Verificar permisos** en el backend antes de realizar operaciones sensibles
4. **Nunca confiar solo en el frontend** - siempre validar en el servidor

## 🔄 Próximos Pasos Sugeridos

1. Crear página de administración de usuarios
2. Implementar cambio de contraseña para admin
3. Agregar más roles (MODERADOR, AUDITOR, etc.)
4. Sistema de permisos granulares
5. Registro de auditoría para acciones de admin

## 📚 Documentación Completa

Ver archivo `ROLES_Y_PERMISOS.md` para documentación técnica detallada.
