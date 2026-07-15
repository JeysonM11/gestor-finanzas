const { PrismaClient } = require('@prisma/client');

/**
 * Singleton de PrismaClient para evitar múltiples instancias
 * y agotar el pool de conexiones a PostgreSQL.
 */
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
