const request = require('supertest');
const express = require('express');
const { globalErrorHandler, notFoundHandler, catchAsync } = require('../middlewares/error.middleware');
const { AppError, ValidationError, AuthenticationError, NotFoundError } = require('../utils/errors');

// Configurar app de prueba
const app = express();
app.use(express.json());

// Rutas de prueba para diferentes tipos de errores
app.get('/test-app-error', (req, res, next) => {
  next(new AppError('Error de aplicación personalizado', 400, 'CUSTOM_ERROR'));
});

app.get('/test-validation-error', (req, res, next) => {
  next(new ValidationError('Error de validación'));
});

app.get('/test-auth-error', (req, res, next) => {
  next(new AuthenticationError());
});

app.get('/test-not-found-error', (req, res, next) => {
  next(new NotFoundError('Usuario'));
});

app.get('/test-prisma-error', (req, res, next) => {
  const prismaError = new Error('Unique constraint failed');
  prismaError.code = 'P2002';
  prismaError.meta = { target: ['email'] };
  next(prismaError);
});

app.get('/test-jwt-error', (req, res, next) => {
  const jwtError = new Error('invalid token');
  jwtError.name = 'JsonWebTokenError';
  next(jwtError);
});

app.get('/test-expired-jwt-error', (req, res, next) => {
  const jwtError = new Error('jwt expired');
  jwtError.name = 'TokenExpiredError';
  next(jwtError);
});

app.get('/test-async-error', catchAsync(async (req, res, next) => {
  throw new Error('Error asíncrono');
}));

app.get('/test-unhandled-error', (req, res, next) => {
  throw new Error('Error no manejado');
});

// Middleware para rutas no encontradas
app.get('/ruta-inexistente-test', notFoundHandler);

// Middleware global de errores
app.use(globalErrorHandler);

describe('Error Middleware', () => {
  beforeEach(() => {
    // Configurar NODE_ENV para testing
    process.env.NODE_ENV = 'test';
  });

  describe('globalErrorHandler', () => {
    it('debería manejar AppError correctamente', async () => {
      const response = await request(app)
        .get('/test-app-error')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        status: 'fail',
        message: 'Error de aplicación personalizado',
        code: 'CUSTOM_ERROR',
      });
      expect(response.body).toHaveProperty('timestamp');
    });

    it('debería manejar ValidationError correctamente', async () => {
      const response = await request(app)
        .get('/test-validation-error')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        status: 'fail',
        message: 'Error de validación',
        code: 'VALIDATION_ERROR',
      });
    });

    it('debería manejar AuthenticationError correctamente', async () => {
      const response = await request(app)
        .get('/test-auth-error')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        status: 'fail',
        message: 'No autorizado',
        code: 'AUTHENTICATION_ERROR',
      });
    });

    it('debería manejar NotFoundError correctamente', async () => {
      const response = await request(app)
        .get('/test-not-found-error')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        status: 'fail',
        message: 'Usuario no encontrado',
        code: 'NOT_FOUND_ERROR',
      });
    });

    it('debería manejar errores de Prisma P2002 (unique constraint)', async () => {
      const response = await request(app)
        .get('/test-prisma-error')
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        status: 'fail',
        message: 'Ya existe un registro con ese email',
        code: 'DUPLICATE_ENTRY',
      });
    });

    it('debería manejar errores de JWT inválido', async () => {
      const response = await request(app)
        .get('/test-jwt-error')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        status: 'fail',
        message: 'Token inválido',
        code: 'INVALID_TOKEN',
      });
    });

    it('debería manejar errores de JWT expirado', async () => {
      const response = await request(app)
        .get('/test-expired-jwt-error')
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
        status: 'fail',
        message: 'Token expirado',
        code: 'EXPIRED_TOKEN',
      });
    });

    it('debería incluir stack trace en desarrollo', async () => {
      process.env.NODE_ENV = 'development';
      
      const response = await request(app)
        .get('/test-app-error')
        .expect(400);

      expect(response.body).toHaveProperty('stack');
    });

    it('debería ocultar stack trace en producción', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app)
        .get('/test-app-error')
        .expect(400);

      expect(response.body).not.toHaveProperty('stack');
    });
  });

  describe('notFoundHandler', () => {
    it('debería manejar rutas no encontradas', async () => {
      const response = await request(app)
        .get('/ruta-inexistente-test')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        status: 'fail',
        message: 'No se pudo encontrar /ruta-inexistente-test en este servidor',
        code: 'ROUTE_NOT_FOUND',
      });
    });
  });

  describe('catchAsync', () => {
    it('debería capturar errores asíncronos', async () => {
      const response = await request(app)
        .get('/test-async-error')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        status: 'error',
      });
    });
  });

  describe('Error Classes', () => {
    it('debería crear AppError con propiedades correctas', () => {
      const error = new AppError('Test message', 400, 'TEST_CODE');
      
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.code).toBe('TEST_CODE');
      expect(error.isOperational).toBe(true);
      expect(error).toHaveProperty('timestamp');
    });

    it('debería crear ValidationError con status 400', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
    });

    it('debería crear AuthenticationError con status 401', () => {
      const error = new AuthenticationError('Custom auth message');
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Custom auth message');
    });

    it('debería crear NotFoundError con mensaje personalizado', () => {
      const error = new NotFoundError('Producto');
      
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.message).toBe('Producto no encontrado');
    });
  });
});