const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ============= CONTROLADOR DE TRANSACCIONES RECURRENTES =============

// Obtener transacciones recurrentes del usuario
exports.obtenerTransaccionesRecurrentes = async (req, res) => {
  try {
    const userId = req.user.id;

    const transaccionesRecurrentes = await prisma.transaccionRecurrente.findMany({
      where: { userId },
      include: {
        transacciones: {
          orderBy: { fecha: 'desc' },
          take: 5 // Últimas 5 ejecuciones
        }
      },
      orderBy: { proximaEjecucion: 'asc' }
    });

    const estadisticas = {
      total: transaccionesRecurrentes.length,
      activas: transaccionesRecurrentes.filter(tr => tr.activa).length,
      inactivas: transaccionesRecurrentes.filter(tr => !tr.activa).length,
      proximasEjecuciones: transaccionesRecurrentes
        .filter(tr => tr.activa && tr.proximaEjecucion > new Date())
        .slice(0, 5)
    };

    res.status(200).json({
      transaccionesRecurrentes,
      estadisticas
    });
  } catch (error) {
    console.error('Error al obtener transacciones recurrentes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear transacción recurrente
exports.crearTransaccionRecurrente = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nombre, descripcion, tipo, monto, categoria,
      frecuencia, diaEjecucion, diaSemana, fechaInicio, fechaFin
    } = req.body;

    // Validaciones
    if (!nombre || !tipo || !monto || !frecuencia) {
      return res.status(400).json({
        message: 'Nombre, tipo, monto y frecuencia son obligatorios'
      });
    }

    // Calcular próxima ejecución
    const proximaEjecucion = calcularProximaEjecucion(
      frecuencia, fechaInicio, diaEjecucion, diaSemana
    );

    const transaccionRecurrente = await prisma.transaccionRecurrente.create({
      data: {
        nombre,
        descripcion,
        tipo,
        monto,
        categoria,
        frecuencia,
        diaEjecucion,
        diaSemana,
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        proximaEjecucion,
        userId
      }
    });

    res.status(201).json({
      message: 'Transacción recurrente creada exitosamente',
      transaccionRecurrente
    });
  } catch (error) {
    console.error('Error al crear transacción recurrente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Ejecutar transacciones recurrentes pendientes
exports.ejecutarTransaccionesRecurrentes = async (req, res) => {
  try {
    const ahora = new Date();

    // Obtener transacciones que deben ejecutarse
    const transaccionesPendientes = await prisma.transaccionRecurrente.findMany({
      where: {
        activa: true,
        proximaEjecucion: {
          lte: ahora
        },
        OR: [
          { fechaFin: null },
          { fechaFin: { gte: ahora } }
        ]
      }
    });

    const resultados = [];

    for (const tr of transaccionesPendientes) {
      try {
        // Crear la transacción
        const nuevaTransaccion = await prisma.transaccion.create({
          data: {
            tipo: tr.tipo,
            monto: tr.monto,
            descripcion: tr.descripcion || `${tr.nombre} (Automática)`,
            categoria: tr.categoria,
            userId: tr.userId,
            transaccionRecurrenteId: tr.id
          }
        });

        // Calcular siguiente ejecución
        const siguienteEjecucion = calcularProximaEjecucion(
          tr.frecuencia, tr.proximaEjecucion, tr.diaEjecucion, tr.diaSemana
        );

        // Actualizar transacción recurrente
        await prisma.transaccionRecurrente.update({
          where: { id: tr.id },
          data: {
            proximaEjecucion: siguienteEjecucion,
            ejecutadas: tr.ejecutadas + 1
          }
        });

        resultados.push({
          transaccionRecurrente: tr.nombre,
          transaccionCreada: nuevaTransaccion.id,
          monto: tr.monto,
          siguienteEjecucion
        });

      } catch (error) {
        console.error(`Error al ejecutar transacción recurrente ${tr.id}:`, error);
        resultados.push({
          transaccionRecurrente: tr.nombre,
          error: 'Error al crear transacción'
        });
      }
    }

    res.status(200).json({
      message: `Procesadas ${transaccionesPendientes.length} transacciones recurrentes`,
      resultados,
      procesadas: resultados.filter(r => !r.error).length,
      errores: resultados.filter(r => r.error).length
    });
  } catch (error) {
    console.error('Error al ejecutar transacciones recurrentes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Función auxiliar para calcular próxima ejecución
function calcularProximaEjecucion(frecuencia, fechaBase, diaEjecucion, diaSemana) {
  const fecha = new Date(fechaBase);

  switch (frecuencia) {
    case 'DIARIA':
      fecha.setDate(fecha.getDate() + 1);
      break;

    case 'SEMANAL':
      fecha.setDate(fecha.getDate() + 7);
      break;

    case 'QUINCENAL':
      fecha.setDate(fecha.getDate() + 15);
      break;

    case 'MENSUAL':
      if (diaEjecucion) {
        fecha.setMonth(fecha.getMonth() + 1);
        fecha.setDate(Math.min(diaEjecucion, getLastDayOfMonth(fecha)));
      } else {
        fecha.setMonth(fecha.getMonth() + 1);
      }
      break;

    case 'BIMESTRAL':
      fecha.setMonth(fecha.getMonth() + 2);
      break;

    case 'TRIMESTRAL':
      fecha.setMonth(fecha.getMonth() + 3);
      break;

    case 'SEMESTRAL':
      fecha.setMonth(fecha.getMonth() + 6);
      break;

    case 'ANUAL':
      fecha.setFullYear(fecha.getFullYear() + 1);
      break;

    default:
      fecha.setDate(fecha.getDate() + 1);
  }

  return fecha;
}

function getLastDayOfMonth(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
}

// ============= CONTROLADOR DE NOTIFICACIONES =============

// Obtener notificaciones del usuario
exports.obtenerNotificaciones = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, soloNoLeidas = false } = req.query;

    const filtros = { userId };
    if (soloNoLeidas === 'true') {
      filtros.leida = false;
    }

    const notificaciones = await prisma.notificacion.findMany({
      where: filtros,
      orderBy: { fechaEnvio: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const contadores = await prisma.notificacion.groupBy({
      by: ['leida'],
      where: { userId },
      _count: { leida: true }
    });

    const noLeidas = contadores.find(c => !c.leida)?._count?.leida || 0;
    const leidas = contadores.find(c => c.leida)?._count?.leida || 0;

    res.status(200).json({
      notificaciones,
      contadores: {
        noLeidas,
        leidas,
        total: noLeidas + leidas
      }
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear notificación
exports.crearNotificacion = async (req, res) => {
  try {
    const { userId, titulo, mensaje, tipo, datos } = req.body;

    const notificacion = await prisma.notificacion.create({
      data: {
        titulo,
        mensaje,
        tipo,
        datos,
        userId
      }
    });

    res.status(201).json({
      message: 'Notificación creada exitosamente',
      notificacion
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Marcar notificación como leída
exports.marcarComoLeida = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notificacion = await prisma.notificacion.updateMany({
      where: {
        id: parseInt(id),
        userId
      },
      data: {
        leida: true,
        fechaLeida: new Date()
      }
    });

    if (notificacion.count === 0) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }

    res.status(200).json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Marcar todas las notificaciones como leídas
exports.marcarTodasLeidas = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notificacion.updateMany({
      where: {
        userId,
        leida: false
      },
      data: {
        leida: true,
        fechaLeida: new Date()
      }
    });

    res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
