const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require('../validators/auth.validator');

const {
  createTransaccionSchema,
  updateTransaccionSchema,
  getTransaccionesSchema,
} = require('../validators/transaccion.validator');

describe('Validators', () => {
  describe('Auth Validators', () => {
    describe('registerSchema', () => {
      it('debería validar datos correctos de registro', () => {
        const validData = {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'Password123',
          telefono: '+57 300 123 4567',
          fechaNacimiento: '1990-05-15',
          ocupacion: 'Desarrollador',
          salarioMensual: 3000000,
        };

        const { error, value } = registerSchema.validate(validData);
        
        expect(error).toBeUndefined();
        expect(value.email).toBe('juan@example.com');
        expect(value.name).toBe('Juan Pérez');
      });

      it('debería fallar con email inválido', () => {
        const invalidData = {
          name: 'Juan Pérez',
          email: 'email-invalido',
          password: 'Password123',
        };

        const { error } = registerSchema.validate(invalidData);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('email');
      });

      it('debería fallar con contraseña débil', () => {
        const invalidData = {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: '123', // Muy corta y sin mayúsculas
        };

        const { error } = registerSchema.validate(invalidData);
        
        expect(error).toBeDefined();
        expect(error.details.some(detail => detail.path[0] === 'password')).toBe(true);
      });

      it('debería fallar con nombre muy corto', () => {
        const invalidData = {
          name: 'A',
          email: 'juan@example.com',
          password: 'Password123',
        };

        const { error } = registerSchema.validate(invalidData);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('name');
      });

      it('debería fallar con teléfono inválido', () => {
        const invalidData = {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'Password123',
          telefono: '123', // Muy corto
        };

        const { error } = registerSchema.validate(invalidData);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('telefono');
      });

      it('debería fallar con salario negativo', () => {
        const invalidData = {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'Password123',
          salarioMensual: -1000,
        };

        const { error } = registerSchema.validate(invalidData);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('salarioMensual');
      });
    });

    describe('loginSchema', () => {
      it('debería validar datos correctos de login', () => {
        const validData = {
          email: 'juan@example.com',
          password: 'Password123',
        };

        const { error, value } = loginSchema.validate(validData);
        
        expect(error).toBeUndefined();
        expect(value.email).toBe('juan@example.com');
      });

      it('debería convertir email a minúsculas', () => {
        const data = {
          email: 'JUAN@EXAMPLE.COM',
          password: 'Password123',
        };

        const { value } = loginSchema.validate(data);
        
        expect(value.email).toBe('juan@example.com');
      });

      it('debería fallar sin email', () => {
        const invalidData = {
          password: 'Password123',
        };

        const { error } = loginSchema.validate(invalidData);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('email');
      });
    });
  });

  describe('Transaccion Validators', () => {
    describe('createTransaccionSchema', () => {
      it('debería validar datos correctos de transacción', () => {
        const validData = {
          tipo: 'GASTO',
          monto: 25000,
          descripcion: 'Almuerzo en restaurante',
          categoria: 'Alimentación',
          metodoPago: 'TARJETA_DEBITO',
          etiquetas: ['trabajo', 'almuerzo'],
        };

        const { error, value } = createTransaccionSchema.validate(validData);
        
        expect(error).toBeUndefined();
        expect(value.tipo).toBe('GASTO');
        expect(value.monto).toBe(25000);
      });

      it('debería fallar con tipo inválido', () => {
        const invalidData = {
          tipo: 'TIPO_INVALIDO',
          monto: 25000,
        };

        const { error } = createTransaccionSchema.validate(invalidData);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('tipo');
      });

      it('debería fallar con monto negativo', () => {
        const invalidData = {
          tipo: 'GASTO',
          monto: -100,
        };

        const { error } = createTransaccionSchema.validate(invalidData);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('monto');
      });

      it('debería fallar con demasiadas etiquetas', () => {
        const invalidData = {
          tipo: 'GASTO',
          monto: 25000,
          etiquetas: new Array(15).fill('etiqueta'), // Más de 10
        };

        const { error } = createTransaccionSchema.validate(invalidData);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('etiquetas');
      });

      it('debería fallar con método de pago inválido', () => {
        const invalidData = {
          tipo: 'GASTO',
          monto: 25000,
          metodoPago: 'METODO_INVALIDO',
        };

        const { error } = createTransaccionSchema.validate(invalidData);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('metodoPago');
      });
    });

    describe('getTransaccionesSchema', () => {
      it('debería validar parámetros de consulta correctos', () => {
        const validQuery = {
          page: '1',
          limit: '20',
          tipo: 'GASTO',
          fechaInicio: '2024-01-01',
          fechaFin: '2024-01-31',
          montoMin: '100',
          montoMax: '1000',
        };

        const { error, value } = getTransaccionesSchema.validate(validQuery);
        
        expect(error).toBeUndefined();
        expect(value.page).toBe(1);
        expect(value.limit).toBe(20);
        expect(value.montoMin).toBe(100);
      });

      it('debería aplicar valores por defecto', () => {
        const emptyQuery = {};

        const { value } = getTransaccionesSchema.validate(emptyQuery);
        
        expect(value.page).toBe(1);
        expect(value.limit).toBe(20);
      });

      it('debería fallar si fechaFin es anterior a fechaInicio', () => {
        const invalidQuery = {
          fechaInicio: '2024-01-31',
          fechaFin: '2024-01-01', // Anterior a fechaInicio
        };

        const { error } = getTransaccionesSchema.validate(invalidQuery);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('fechaFin');
      });

      it('debería fallar si montoMax es menor a montoMin', () => {
        const invalidQuery = {
          montoMin: 1000,
          montoMax: 100, // Menor que montoMin
        };

        const { error } = getTransaccionesSchema.validate(invalidQuery);
        
        expect(error).toBeDefined();
        expect(error.details[0].path[0]).toBe('montoMax');
      });
    });
  });
});