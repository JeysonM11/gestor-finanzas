# Tests - Gestor de Finanzas Backend

Este directorio contiene los tests para el backend del gestor de finanzas.

## 🧪 Estructura de Tests

```
tests/
├── setup.js                 # Configuración global y mocks
├── validators.test.js        # Tests para validadores Joi ✅
├── auth.test.js              # Tests para autenticación (en desarrollo)
└── error-middleware.test.js  # Tests para manejo de errores (en desarrollo)
```

## 🚀 Comandos de Testing

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests específicos
```bash
npm test validators.test.js
```

### Ejecutar tests en modo watch (desarrollo)
```bash
npm run test:watch
```

### Ejecutar tests con reporte de cobertura
```bash
npm run test:coverage
```

### Ejecutar tests de un archivo específico con cobertura
```bash
npm run test:coverage -- validators.test.js
```

## ✅ Tests Implementados

### Validadores (100% cobertura)
- ✅ **Auth Validators**
  - Validación de registro de usuarios
  - Validación de login
  - Validación de actualización de perfil
  
- ✅ **Transacción Validators**
  - Validación de creación de transacciones
  - Validación de actualización de transacciones
  - Validación de parámetros de consulta

### Tests en Desarrollo
- 🔄 **Auth Controller** - Tests de endpoint de autenticación
- 🔄 **Error Middleware** - Tests de manejo de errores

## 📊 Cobertura Actual

Los validadores tienen **100% de cobertura** en:
- Statements (declaraciones)
- Branches (ramas)
- Functions (funciones)
- Lines (líneas)

## 🛠️ Configuración

### Jest Configuration
La configuración de Jest está en `package.json`:

```json
{
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
    "testMatch": ["**/__tests__/**/*.js", "**/*.test.js"],
    "collectCoverageFrom": [
      "controllers/**/*.js",
      "middlewares/**/*.js", 
      "routes/**/*.js",
      "utils/**/*.js",
      "validators/**/*.js"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"],
    "verbose": true
  }
}
```

### Mocks
- **Prisma Client**: Mockeado para evitar conexiones reales a la base de datos
- **JWT**: Configurado para testing con secreto de prueba
- **bcrypt**: Funciona normalmente en tests

### Helpers Globales
- `generateTestToken(userId)`: Genera tokens JWT para testing
- `createTestUser(overrides)`: Crea usuarios de prueba
- `createTestTransaction(overrides)`: Crea transacciones de prueba

## 🔧 Próximos Pasos

1. **Completar tests de controladores**
   - Mejorar mocks de Prisma
   - Tests de endpoints completos
   
2. **Tests de integración**
   - Tests de flujos completos
   - Tests con base de datos de prueba
   
3. **Tests de performance**
   - Benchmarks de endpoints
   - Tests de carga

## 📝 Convenciones

### Nombres de Tests
- Usar `describe()` para agrupar tests relacionados
- Usar `it()` con descripciones claras en español
- Formato: "debería [acción esperada] [condición]"

### Estructura de Tests
```javascript
describe('Componente', () => {
  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('Método específico', () => {
    it('debería comportarse correctamente con datos válidos', () => {
      // Test implementation
    });

    it('debería fallar con datos inválidos', () => {
      // Test implementation  
    });
  });
});
```

### Assertions
- Usar `expect()` de Jest
- Preferir `toHaveProperty()` para objetos
- Usar `toMatchObject()` para comparaciones parciales
- Verificar tanto casos exitosos como de error

## 🐛 Debugging Tests

### Ver output detallado
```bash
npm test -- --verbose
```

### Ejecutar test específico
```bash
npm test -- --testNamePattern="nombre del test"
```

### Debug con breakpoints
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```