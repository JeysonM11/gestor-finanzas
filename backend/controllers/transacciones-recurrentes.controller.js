const prisma = require('../lib/prisma');
const { mapTipoNotificacion, toNotificacionDto } = require('../utils/mappers');

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
          take: 5 // Ultimas 5 ejecuciones
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

// Crear transaccion recurrente
exports.crearTransaccionRecurrente = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nombre, descripcion, tipo, monto, categoria,
      frecuencia, diaEjecucion, diaSemana, fechaInicio, fechaFin, activa
    } = req.body;

    if (!nombre || !tipo || !monto || !frecuencia) {
      return res.status(400).json({
        message: 'Nombre, tipo, monto y frecuencia son obligatorios'
      });
    }

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
        activa: activa !== undefined ? Boolean(activa) : true,
        userId
      }
    });

    res.status(201).json({
      message: 'Transaccion recurrente creada exitosamente',
      transaccionRecurrente
    });
  } catch (error) {
    console.error('Error al crear transaccion recurrente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.actualizarTransaccionRecurrente = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      nombre, descripcion, tipo, monto, categoria,
      frecuencia, diaEjecucion, diaSemana, fechaInicio, fechaFin, activa
    } = req.body;

    const existente = await prisma.transaccionRecurrente.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!existente) {
      return res.status(404).json({ message: 'Transaccion recurrente no encontrada' });
    }

    const updateData = {};
    if (nombre != null) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (tipo != null) updateData.tipo = tipo;
    if (monto != null) updateData.monto = Number(monto);
    if (categoria !== undefined) updateData.categoria = categoria;
    if (frecuencia != null) updateData.frecuencia = frecuencia;
    if (diaEjecucion !== undefined) updateData.diaEjecucion = diaEjecucion != null ? Number(diaEjecucion) : null;
    if (diaSemana !== undefined) updateData.diaSemana = diaSemana != null ? Number(diaSemana) : null;
    if (fechaInicio) updateData.fechaInicio = new Date(fechaInicio);
    if (fechaFin !== undefined) {
      updateData.fechaFin = fechaFin ? new Date(fechaFin) : null;
    }
    if (activa !== undefined) updateData.activa = Boolean(activa);

    if (frecuencia || fechaInicio || diaEjecucion !== undefined || diaSemana !== undefined) {
      updateData.proximaEjecucion = calcularProximaEjecucion(
        frecuencia || existente.frecuencia,
        fechaInicio || existente.fechaInicio,
        diaEjecucion !== undefined ? diaEjecucion : existente.diaEjecucion,
        diaSemana !== undefined ? diaSemana : existente.diaSemana
      );
    }

    const transaccionRecurrente = await prisma.transaccionRecurrente.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      message: 'Transaccion recurrente actualizada exitosamente',
      transaccionRecurrente,
    });
  } catch (error) {
    console.error('Error al actualizar transaccion recurrente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.eliminarTransaccionRecurrente = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const resultado = await prisma.transaccionRecurrente.deleteMany({
      where: { id: parseInt(id), userId },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ message: 'Transaccion recurrente no encontrada' });
    }

    res.status(200).json({ message: 'Transaccion recurrente eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar transaccion recurrente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.toggleTransaccionRecurrente = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { activa } = req.body;

    const existente = await prisma.transaccionRecurrente.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!existente) {
      return res.status(404).json({ message: 'Transaccion recurrente no encontrada' });
    }

    const nuevoEstado =
      activa !== undefined ? Boolean(activa) : !existente.activa;

    const transaccionRecurrente = await prisma.transaccionRecurrente.update({
      where: { id: parseInt(id) },
      data: { activa: nuevoEstado },
    });

    res.status(200).json({
      message: 'Estado actualizado exitosamente',
      transaccionRecurrente,
    });
  } catch (error) {
    console.error('Error al cambiar estado de recurrente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Ejecutar transacciones recurrentes pendientes (solo del usuario autenticado)
exports.ejecutarTransaccionesRecurrentes = async (req, res) => {
  try {
    const userId = req.user.id;
    const ahora = new Date();

    const transaccionesPendientes = await prisma.transaccionRecurrente.findMany({
      where: {
        userId,
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
        const nuevaTransaccion = await prisma.transaccion.create({
          data: {
            tipo: tr.tipo,
            monto: tr.monto,
            descripcion: tr.descripcion || `${tr.nombre} (Automatica)`,
            categoria: tr.categoria,
            userId: tr.userId,
            transaccionRecurrenteId: tr.id
          }
        });

        const siguienteEjecucion = calcularProximaEjecucion(
          tr.frecuencia, tr.proximaEjecucion, tr.diaEjecucion, tr.diaSemana
        );

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
        console.error(`Error al ejecutar transaccion recurrente ${tr.id}:`, error);
        resultados.push({
          transaccionRecurrente: tr.nombre,
          error: 'Error al crear transaccion'
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

exports.obtenerNotificaciones = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, soloNoLeidas = false, leida } = req.query;

    const filtros = { userId };
    if (soloNoLeidas === 'true' || leida === 'false') {
      filtros.leida = false;
    } else if (leida === 'true') {
      filtros.leida = true;
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
      notificaciones: notificaciones.map(toNotificacionDto),
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

// Crear notificacion solo para el usuario autenticado
exports.crearNotificacion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { titulo, mensaje, tipo, datos } = req.body;

    if (!titulo || !mensaje || !tipo) {
      return res.status(400).json({
        message: 'Titulo, mensaje y tipo son obligatorios'
      });
    }

    const tipoNormalizado = mapTipoNotificacion(tipo);

    const notificacion = await prisma.notificacion.create({
      data: {
        titulo,
        mensaje,
        tipo: tipoNormalizado,
        datos,
        userId
      }
    });

    res.status(201).json({
      message: 'Notificacion creada exitosamente',
      notificacion: toNotificacionDto(notificacion)
    });
  } catch (error) {
    console.error('Error al crear notificacion:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

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
      return res.status(404).json({ message: 'Notificacion no encontrada' });
    }

    res.status(200).json({ message: 'Notificacion marcada como leida' });
  } catch (error) {
    console.error('Error al marcar notificacion:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

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

    res.status(200).json({ message: 'Todas las notificaciones marcadas como leidas' });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.eliminarNotificacion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const resultado = await prisma.notificacion.deleteMany({
      where: { id: parseInt(id), userId },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ message: 'Notificacion no encontrada' });
    }

    res.status(200).json({ message: 'Notificacion eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar notificacion:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
