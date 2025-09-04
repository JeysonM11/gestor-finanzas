const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // ============= LOGROS PREDEFINIDOS =============
    const logros = [
      {
        nombre: 'Primera Transacción',
        descripcion: 'Registra tu primera transacción',
        icono: '🎯',
        tipo: 'HABITO',
        condicion: { transacciones: { min: 1 } },
        puntos: 100,
        rareza: 'COMUN'
      },
      {
        nombre: 'Ahorrador Principiante',
        descripcion: 'Ahorra $1,000 en total',
        icono: '💰',
        tipo: 'AHORRO',
        condicion: { ahorroTotal: 1000 },
        puntos: 250,
        rareza: 'POCO_COMUN'
      },
      {
        nombre: 'Maestro del Presupuesto',
        descripcion: 'Mantén un presupuesto por 3 meses consecutivos',
        icono: '📊',
        tipo: 'PRESUPUESTO',
        condicion: { presupuestoMeses: 3 },
        puntos: 500,
        rareza: 'RARO'
      },
      {
        nombre: 'Inversionista',
        descripcion: 'Realiza tu primera inversión',
        icono: '📈',
        tipo: 'INVERSION',
        condicion: { inversiones: { min: 1 } },
        puntos: 300,
        rareza: 'POCO_COMUN'
      },
      {
        nombre: 'Libre de Deudas',
        descripcion: 'Paga todas tus deudas',
        icono: '🎊',
        tipo: 'DEUDA',
        condicion: { deudasPagadas: 'todas' },
        puntos: 1000,
        rareza: 'EPICO'
      },
      {
        nombre: 'Disciplinado',
        descripcion: 'Registra transacciones por 30 días consecutivos',
        icono: '🏆',
        tipo: 'HABITO',
        condicion: { diasConsecutivos: 30 },
        puntos: 750,
        rareza: 'RARO'
      },
      {
        nombre: 'Millonario',
        descripcion: 'Acumula $1,000,000 en patrimonio',
        icono: '💎',
        tipo: 'AHORRO',
        condicion: { patrimonioTotal: 1000000 },
        puntos: 5000,
        rareza: 'LEGENDARIO'
      }
    ];

    for (const logro of logros) {
      await prisma.logro.upsert({
        where: { nombre: logro.nombre },
        update: logro,
        create: logro
      });
    }

    console.log(`✅ Creados ${logros.length} logros`);

    // ============= CONFIGURACIÓN DEL SISTEMA =============
    const configuraciones = [
      {
        clave: 'monedas_soportadas',
        valor: JSON.stringify(['USD', 'EUR', 'MXN', 'COP', 'ARS', 'CLP', 'PEN']),
        descripcion: 'Monedas soportadas en el sistema',
        tipo: 'json'
      },
      {
        clave: 'categorias_predefinidas_gastos',
        valor: JSON.stringify([
          'Alimentación', 'Transporte', 'Entretenimiento', 'Salud',
          'Educación', 'Servicios', 'Compras', 'Viajes', 'Hogar', 'Otros'
        ]),
        descripcion: 'Categorías predefinidas para gastos',
        tipo: 'json'
      },
      {
        clave: 'categorias_predefinidas_ingresos',
        valor: JSON.stringify([
          'Salario', 'Freelance', 'Inversiones', 'Bonos', 'Ventas', 'Otros'
        ]),
        descripcion: 'Categorías predefinidas para ingresos',
        tipo: 'json'
      },
      {
        clave: 'limite_transacciones_gratuitas',
        valor: '1000',
        descripcion: 'Límite de transacciones gratuitas por mes',
        tipo: 'number'
      },
      {
        clave: 'version_app',
        valor: '2.0.0',
        descripcion: 'Versión actual de la aplicación',
        tipo: 'string'
      }
    ];

    for (const config of configuraciones) {
      await prisma.configuracionSistema.upsert({
        where: { clave: config.clave },
        update: config,
        create: config
      });
    }

    console.log(`✅ Creadas ${configuraciones.length} configuraciones del sistema`);

    // ============= DATOS DE PRUEBA (OPCIONAL) =============
    const crearDatosPrueba = process.env.CREATE_TEST_DATA === 'true';

    if (crearDatosPrueba) {
      console.log('📊 Creando datos de prueba...');

      // Crear usuario de prueba
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('123456', 10);

      const usuarioPrueba = await prisma.user.upsert({
        where: { email: 'demo@finanzas.com' },
        update: {},
        create: {
          name: 'Usuario Demo',
          email: 'demo@finanzas.com',
          password: hashedPassword,
          telefono: '+1234567890',
          ocupacion: 'Desarrollador',
          salarioMensual: 5000,
          emailVerificado: true
        }
      });

      // Crear cuentas de prueba
      const cuentas = [
        {
          nombre: 'Cuenta Corriente',
          tipo: 'BANCO_CORRIENTE',
          banco: 'Banco Demo',
          saldoInicial: 2500,
          saldoActual: 2500,
          color: '#1E40AF',
          userId: usuarioPrueba.id
        },
        {
          nombre: 'Ahorros',
          tipo: 'BANCO_AHORROS',
          banco: 'Banco Demo',
          saldoInicial: 10000,
          saldoActual: 10000,
          color: '#059669',
          userId: usuarioPrueba.id
        },
        {
          nombre: 'Tarjeta de Crédito',
          tipo: 'TARJETA_CREDITO',
          banco: 'Banco Demo',
          saldoInicial: -500,
          saldoActual: -500,
          color: '#DC2626',
          userId: usuarioPrueba.id
        }
      ];

      for (const cuenta of cuentas) {
        await prisma.cuenta.create({ data: cuenta });
      }

      // Crear metas de prueba
      const metas = [
        {
          titulo: 'Fondo de Emergencia',
          descripcion: 'Ahorrar para emergencias',
          tipo: 'EMERGENCIA',
          montoObjetivo: 15000,
          montoActual: 5000,
          fechaLimite: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
          categoria: 'Ahorro',
          prioridad: 'ALTA',
          userId: usuarioPrueba.id
        },
        {
          titulo: 'Vacaciones',
          descripcion: 'Viaje a Europa',
          tipo: 'AHORRO',
          montoObjetivo: 8000,
          montoActual: 2000,
          fechaLimite: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 meses
          categoria: 'Viajes',
          prioridad: 'MEDIA',
          userId: usuarioPrueba.id
        }
      ];

      for (const meta of metas) {
        await prisma.meta.create({ data: meta });
      }

      console.log(`✅ Creados datos de prueba para usuario: ${usuarioPrueba.email}`);
    }

    console.log('🎉 Seed completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar seed
if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
