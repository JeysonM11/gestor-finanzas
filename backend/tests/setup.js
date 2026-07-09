// Setup mínimo para Jest (sin DB)
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-sprint1';
