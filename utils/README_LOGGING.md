# Sistema de Logging - Gestor de Finanzas

Este proyecto implementa un sistema de logging estructurado y profesional usando Winston.

## 🔍 Características del Sistema de Logging

### Niveles de Log
- **error**: Errores críticos y excepciones
- **warn**: Advertencias y eventos de seguridad
- **info**: Información general y eventos importantes
- **http**: Requests HTTP y respuestas
- **debug**: Información detallada para debugging

### Transportes Configurados

#### 1. **Consola (Solo desarrollo)**
- Output colorizado para mejor legibilidad
- Formato simplificado con timestamp
- Solo se muestra en `NODE_ENV !== 'production'`

#### 2. **Archivos con Rotación Diaria**
- **error-YYYY-MM-DD.log**: Solo errores críticos
- **combined-YYYY-MM-DD.log**: Todos los niveles de log
- **http-YYYY-MM-DD.log**: Solo requests HTTP
- Rotación automática cada día
- Máximo 20MB por archivo
- Retención de 30 días
- Formato JSON estructurado

## 📁 Estructura de Archivos

```
logs/
├── combined-2025-09-18.log    # Todos los logs del día
├── error-2025-09-18.log       # Solo errores
├── http-2025-09-18.log        # Solo requests HTTP
└── *.audit.json               # Archivos de auditoría de Winston
```

## 🛠️ Funciones de Logging Disponibles

### 1. **Logger Principal**
```javascript
const { logger } = require('./utils/logger');

logger.info('Mensaje informativo');
logger.error('Error crítico');
logger.warn('Advertencia');
logger.debug('Información de debug');
```

### 2. **Logging de Requests HTTP**
```javascript
const { logRequest } = require('./utils/logger');

// Se ejecuta automáticamente con Morgan
// Registra: método, URL, status, tiempo de respuesta, IP, User-Agent
```

### 3. **Logging de Errores**
```javascript
const { logError } = require('./utils/logger');

logError(error, req, { additionalData: 'value' });
```

### 4. **Logging de Acciones de Usuario**
```javascript
const { logUserAction } = require('./utils/logger');

logUserAction('USER_LOGIN', userId, {
  email: 'user@example.com',
  ip: '192.168.1.1'
});
```

### 5. **Logging de Eventos de Seguridad**
```javascript
const { logSecurityEvent } = require('./utils/logger');

logSecurityEvent('LOGIN_ATTEMPT_INVALID_PASSWORD', {
  userId: 123,
  ip: '192.168.1.1'
});
```

### 6. **Logging de Consultas de Base de Datos**
```javascript
const { logDatabaseQuery } = require('./utils/logger');

logDatabaseQuery('SELECT * FROM users', 45, results);
```

## 📊 Formato de Logs

### Formato JSON (Archivos)
```json
{
  "timestamp": "2025-09-18 17:41:50",
  "level": "info",
  "message": "Usuario registrado exitosamente",
  "environment": "development",
  "userId": 123,
  "email": "user@example.com",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

### Formato Consola (Desarrollo)
```
[17:41:50] info: Usuario registrado exitosamente {"userId":123,"email":"user@example.com"}
```

## 🔧 Configuración

### Variables de Entorno
```env
# Nivel de logging (error, warn, info, http, debug)
LOG_LEVEL=debug

# Ambiente (afecta el formato y transporte)
NODE_ENV=development
```

### Personalización
El sistema está configurado en `utils/logger.js` y permite:
- Cambiar niveles de log
- Modificar formatos
- Agregar nuevos transportes
- Configurar rotación de archivos

## 📈 Eventos Registrados Automáticamente

### Sistema
- ✅ Inicio del servidor
- ✅ Errores no capturados
- ✅ Promesas rechazadas

### HTTP
- ✅ Todas las requests con Morgan
- ✅ Método, URL, status code, tiempo de respuesta
- ✅ IP del cliente y User-Agent

### Autenticación
- ✅ Registro de usuarios
- ✅ Logins exitosos
- ✅ Intentos de login fallidos
- ✅ Usuarios inactivos

### Errores
- ✅ Errores de aplicación con contexto
- ✅ Errores de validación
- ✅ Errores de base de datos
- ✅ Errores JWT

### Seguridad
- ✅ Intentos de login con email inválido
- ✅ Intentos de login con contraseña incorrecta
- ✅ Acceso a recursos protegidos sin token

## 🔍 Análisis de Logs

### Buscar Errores
```bash
# Ver errores del día actual
cat logs/error-$(date +%Y-%m-%d).log | jq '.'

# Buscar errores específicos
grep "AUTHENTICATION_ERROR" logs/combined-*.log
```

### Analizar Tráfico HTTP
```bash
# Ver requests del día
cat logs/http-$(date +%Y-%m-%d).log

# Contar requests por método
grep -o '"method":"[^"]*"' logs/http-*.log | sort | uniq -c
```

### Monitorear Usuarios
```bash
# Ver logins del día
grep "USER_LOGIN" logs/combined-*.log | jq '.'

# Buscar intentos de seguridad
grep "LOGIN_ATTEMPT" logs/combined-*.log
```

## 🚨 Monitoreo y Alertas

### Logs que Requieren Atención
- **error**: Todos los errores críticos
- **warn**: Eventos de seguridad sospechosos
- Múltiples `LOGIN_ATTEMPT_INVALID_PASSWORD` del mismo IP
- Errores de base de datos frecuentes

### Integración con Herramientas
El formato JSON permite integración fácil con:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **DataDog**
- **New Relic**
- **CloudWatch** (AWS)

## ⚡ Performance

### Impacto en Rendimiento
- Logging asíncrono (sin bloqueo)
- Rotación automática de archivos
- Compresión de logs antiguos
- Eliminación automática después de 30 días

### Optimizaciones
- Logs de debug solo en desarrollo
- Formato JSON optimizado
- Buffer de escritura para mejor I/O

## 🔒 Seguridad

### Datos Sensibles
- ❌ **Nunca** loggear contraseñas
- ❌ **Nunca** loggear tokens completos
- ✅ Loggear solo metadatos seguros
- ✅ Hash o truncar información sensible

### Ejemplo Seguro
```javascript
// ❌ MAL
logger.info('User data', { password: 'secreto123' });

// ✅ BIEN
logger.info('User registered', { 
  userId: user.id, 
  email: user.email 
});
```

## 📝 Mejores Prácticas

1. **Usa niveles apropiados**
   - `error` para problemas críticos
   - `warn` para situaciones sospechosas
   - `info` para eventos importantes
   - `debug` para información detallada

2. **Incluye contexto útil**
   - IDs de usuario
   - Timestamps
   - IP addresses
   - User agents

3. **Mantén mensajes consistentes**
   - Usa códigos de acción claros
   - Formato estructurado
   - Información relevante

4. **Monitorea regularmente**
   - Revisa logs de error diariamente
   - Analiza patrones de tráfico
   - Detecta anomalías de seguridad