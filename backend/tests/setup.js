const { PrismaClient } = require('@prisma/client');

// Mock de Prisma para testing
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaccion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

// Configuración global para tests
beforeAll(async () => {
  // Configurar variables de entorno para testing
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_for_testing_purposes_only';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
});

afterAll(async () => {
  // Limpiar después de todos los tests
});

beforeEach(() => {
  // Limpiar mocks antes de cada test
  jest.clearAllMocks();
});

// Helper para generar tokens JWT válidos para testing
global.generateTestToken = (userId = 1) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Helper para crear usuarios de prueba
global.createTestUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: '$2a$12$hashed_password',
  telefono: '+57 300 123 4567',
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Helper para crear transacciones de prueba
global.createTestTransaction = (overrides = {}) => ({
  id: 1,
  tipo: 'GASTO',
  monto: 25000,
  descripcion: 'Test transaction',
  categoria: 'Alimentación',
  fecha: new Date(),
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});