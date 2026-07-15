const prisma = require('../lib/prisma');
const {
  mapTipoCuenta,
  normalizeDeudaInput,
  normalizeInversionInput,
  toDeudaDto,
  toInversionDto,
} = require('../utils/mappers');

// ============= CONTROLADOR DE CUENTAS =============

exports.obtenerCuentas = async (req, res) => {
  try {
    const userId = req.user.id;

    const cuentas = await prisma.cuenta.findMany({
      where: { userId, activa: true },
      include: {
        _count: {
          select: {
            transaccionesOrigen: true,
            transaccionesDestino: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    const balanceTotal = cuentas.reduce((total, cuenta) => {
      return cuenta.incluirEnBalance ? total + cuenta.saldoActual : total;
    }, 0);

    res.status(200).json({
      cuentas,
      balanceTotal,
      resumen: {
        totalCuentas: cuentas.length,
        cuentasActivas: cuentas.filter((c) => c.activa).length,
        tiposCuenta: [...new Set(cuentas.map((c) => c.tipo))],
      },
    });
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.crearCuenta = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nombre,
      tipo,
      tipoCuenta,
      banco,
      numeroCuenta,
      saldoInicial,
      saldoActual,
      moneda,
      color,
      icono,
      descripcion,
      fechaApertura,
    } = req.body;

    const tipoNormalizado = mapTipoCuenta(tipo || tipoCuenta);
    const saldo = Number(
      saldoInicial != null ? saldoInicial : saldoActual != null ? saldoActual : 0
    );

    if (!nombre || !tipoNormalizado) {
      return res.status(400).json({
        message: 'Nombre y tipo de cuenta son obligatorios',
      });
    }

    const cuenta = await prisma.cuenta.create({
      data: {
        nombre,
        tipo: tipoNormalizado,
        banco,
        numeroCuenta,
        saldoInicial: saldo,
        saldoActual: saldo,
        moneda: moneda || 'USD',
        color,
        icono,
        descripcion,
        fechaApertura: fechaApertura ? new Date(fechaApertura) : new Date(),
        userId,
      },
    });

    res.status(201).json({
      message: 'Cuenta creada exitosamente',
      cuenta,
    });
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.actualizarSaldo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { nuevoSaldo, saldoActual, motivo } = req.body;

    const saldoFinal =
      nuevoSaldo != null
        ? Number(nuevoSaldo)
        : saldoActual != null
          ? Number(saldoActual)
          : null;

    if (saldoFinal == null || Number.isNaN(saldoFinal)) {
      return res.status(400).json({
        message: 'Se requiere nuevoSaldo (o saldoActual) numerico',
      });
    }

    const cuenta = await prisma.cuenta.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!cuenta) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    const cuentaActualizada = await prisma.cuenta.update({
      where: { id: parseInt(id) },
      data: { saldoActual: saldoFinal },
    });

    if (motivo) {
      const diferencia = saldoFinal - cuenta.saldoActual;
      if (diferencia !== 0) {
        await prisma.transaccion.create({
          data: {
            tipo: diferencia > 0 ? 'INGRESO' : 'GASTO',
            monto: Math.abs(diferencia),
            descripcion: `Ajuste de saldo: ${motivo}`,
            categoria: 'Ajustes',
            cuentaOrigenId: parseInt(id),
            userId,
          },
        });
      }
    }

    res.status(200).json({
      message: 'Saldo actualizado exitosamente',
      cuenta: cuentaActualizada,
    });
  } catch (error) {
    console.error('Error al actualizar saldo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.eliminarCuenta = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const cuenta = await prisma.cuenta.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!cuenta) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    await prisma.cuenta.update({
      where: { id: parseInt(id) },
      data: { activa: false },
    });

    res.status(200).json({ message: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ============= CONTROLADOR DE INVERSIONES =============

exports.obtenerInversiones = async (req, res) => {
  try {
    const userId = req.user.id;

    const inversiones = await prisma.inversion.findMany({
      where: { userId, activa: true },
      include: {
        historialValores: {
          orderBy: { fecha: 'desc' },
          take: 30,
        },
      },
      orderBy: { fechaCompra: 'desc' },
    });

    const inversionesDto = inversiones.map(toInversionDto);

    const totalInvertido = inversiones.reduce(
      (sum, inv) => sum + inv.montoInvertido,
      0
    );
    const valorActualTotal = inversiones.reduce(
      (sum, inv) => sum + (inv.valorActual || inv.montoInvertido),
      0
    );
    const gananciaTotal = valorActualTotal - totalInvertido;
    const porcentajeGanancia =
      totalInvertido > 0 ? (gananciaTotal / totalInvertido) * 100 : 0;

    res.status(200).json({
      inversiones: inversionesDto,
      resumen: {
        totalInvertido,
        valorActualTotal,
        gananciaTotal,
        porcentajeGanancia,
        cantidadInversiones: inversiones.length,
      },
    });
  } catch (error) {
    console.error('Error al obtener inversiones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.crearInversion = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = normalizeInversionInput(req.body);

    if (!data.nombre || !data.tipo || data.montoInvertido == null || !data.fechaCompra) {
      return res.status(400).json({
        message: 'Nombre, tipo, montoInvertido (o montoInicial) y fechaCompra son obligatorios',
      });
    }

    const inversion = await prisma.inversion.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        simbolo: data.simbolo,
        montoInvertido: data.montoInvertido,
        valorActual: data.valorActual ?? data.montoInvertido,
        cantidad: data.cantidad,
        fechaCompra: new Date(data.fechaCompra),
        broker: data.broker,
        comisiones: data.comisiones || 0,
        notas: data.notas,
        userId,
      },
    });

    await prisma.historialInversion.create({
      data: {
        valor: data.valorActual ?? data.montoInvertido,
        inversionId: inversion.id,
      },
    });

    res.status(201).json({
      message: 'Inversion creada exitosamente',
      inversion: toInversionDto(inversion),
    });
  } catch (error) {
    console.error('Error al crear inversion:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.actualizarInversion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const data = normalizeInversionInput(req.body);

    const existente = await prisma.inversion.findFirst({
      where: { id: parseInt(id), userId, activa: true },
    });

    if (!existente) {
      return res.status(404).json({ message: 'Inversion no encontrada' });
    }

    const updateData = {};
    if (data.nombre != null) updateData.nombre = data.nombre;
    if (data.tipo != null) updateData.tipo = data.tipo;
    if (data.simbolo !== undefined) updateData.simbolo = data.simbolo;
    if (data.montoInvertido != null) updateData.montoInvertido = data.montoInvertido;
    if (data.valorActual != null) updateData.valorActual = data.valorActual;
    if (data.cantidad != null) updateData.cantidad = data.cantidad;
    if (data.fechaCompra) updateData.fechaCompra = new Date(data.fechaCompra);
    if (data.broker !== undefined) updateData.broker = data.broker;
    if (data.comisiones != null) updateData.comisiones = data.comisiones;
    if (req.body.notas !== undefined) updateData.notas = data.notas;

    const inversion = await prisma.inversion.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    if (data.valorActual != null && data.valorActual !== existente.valorActual) {
      await prisma.historialInversion.create({
        data: {
          valor: data.valorActual,
          inversionId: inversion.id,
        },
      });
    }

    res.status(200).json({
      message: 'Inversion actualizada exitosamente',
      inversion: toInversionDto(inversion),
    });
  } catch (error) {
    console.error('Error al actualizar inversion:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.eliminarInversion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existente = await prisma.inversion.findFirst({
      where: { id: parseInt(id), userId, activa: true },
    });

    if (!existente) {
      return res.status(404).json({ message: 'Inversion no encontrada' });
    }

    await prisma.inversion.update({
      where: { id: parseInt(id) },
      data: { activa: false },
    });

    res.status(200).json({ message: 'Inversion eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar inversion:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ============= CONTROLADOR DE DEUDAS =============

exports.obtenerDeudas = async (req, res) => {
  try {
    const userId = req.user.id;

    const deudas = await prisma.deuda.findMany({
      where: { userId },
      include: {
        pagos: {
          orderBy: { fecha: 'desc' },
        },
      },
      orderBy: { fechaVencimiento: 'asc' },
    });

    const deudasDto = deudas.map(toDeudaDto);

    const totalDeuda = deudas.reduce((sum, deuda) => sum + deuda.montoActual, 0);
    const deudasVencidas = deudas.filter(
      (d) => d.fechaVencimiento && d.fechaVencimiento < new Date() && !d.pagada
    );
    const pagoMinimoTotal = deudas.reduce(
      (sum, deuda) => sum + (deuda.pagoMinimo || 0),
      0
    );

    res.status(200).json({
      deudas: deudasDto,
      resumen: {
        totalDeuda,
        cantidadDeudas: deudas.length,
        deudasVencidas: deudasVencidas.length,
        pagoMinimoTotal,
        deudasPagadas: deudas.filter((d) => d.pagada).length,
      },
    });
  } catch (error) {
    console.error('Error al obtener deudas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.crearDeuda = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = normalizeDeudaInput(req.body);

    if (!data.nombre || !data.tipo || data.montoInicial == null) {
      return res.status(400).json({
        message: 'Nombre, tipo y montoInicial (o montoTotal) son obligatorios',
      });
    }

    if (!data.fechaInicio) {
      return res.status(400).json({ message: 'fechaInicio es obligatoria' });
    }

    const deuda = await prisma.deuda.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        montoInicial: data.montoInicial,
        montoActual: data.montoActual ?? data.montoInicial,
        tasaInteres: data.tasaInteres,
        fechaInicio: new Date(data.fechaInicio),
        fechaVencimiento: data.fechaVencimiento
          ? new Date(data.fechaVencimiento)
          : null,
        pagoMinimo: data.pagoMinimo,
        acreedor: data.acreedor,
        notas: data.notas,
        pagada: (data.montoActual ?? data.montoInicial) === 0,
        userId,
      },
    });

    res.status(201).json({
      message: 'Deuda creada exitosamente',
      deuda: toDeudaDto(deuda),
    });
  } catch (error) {
    console.error('Error al crear deuda:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.actualizarDeuda = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const data = normalizeDeudaInput(req.body);

    const existente = await prisma.deuda.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!existente) {
      return res.status(404).json({ message: 'Deuda no encontrada' });
    }

    const updateData = {};
    if (data.nombre != null) updateData.nombre = data.nombre;
    if (data.tipo != null) updateData.tipo = data.tipo;
    if (data.montoInicial != null) updateData.montoInicial = data.montoInicial;
    if (data.montoActual != null) {
      updateData.montoActual = data.montoActual;
      updateData.pagada = data.montoActual === 0;
    }
    if (data.tasaInteres != null) updateData.tasaInteres = data.tasaInteres;
    if (data.fechaInicio) updateData.fechaInicio = new Date(data.fechaInicio);
    if (req.body.fechaVencimiento !== undefined) {
      updateData.fechaVencimiento = data.fechaVencimiento
        ? new Date(data.fechaVencimiento)
        : null;
    }
    if (data.pagoMinimo != null) updateData.pagoMinimo = data.pagoMinimo;
    if (data.acreedor) updateData.acreedor = data.acreedor;
    if (req.body.notas !== undefined) updateData.notas = data.notas;

    const deuda = await prisma.deuda.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      message: 'Deuda actualizada exitosamente',
      deuda: toDeudaDto(deuda),
    });
  } catch (error) {
    console.error('Error al actualizar deuda:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.eliminarDeuda = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const resultado = await prisma.deuda.deleteMany({
      where: { id: parseInt(id), userId },
    });

    if (resultado.count === 0) {
      return res.status(404).json({ message: 'Deuda no encontrada' });
    }

    res.status(200).json({ message: 'Deuda eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar deuda:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.registrarPagoDeuda = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deudaId } = req.params;
    const { monto, capital, interes, fecha, notas } = req.body;

    const deuda = await prisma.deuda.findFirst({
      where: { id: parseInt(deudaId), userId },
    });

    if (!deuda) {
      return res.status(404).json({ message: 'Deuda no encontrada' });
    }

    const pago = await prisma.pagoDeuda.create({
      data: {
        monto,
        capital: capital || monto,
        interes: interes || 0,
        fecha: new Date(fecha || Date.now()),
        notas,
        deudaId: parseInt(deudaId),
      },
    });

    const nuevoMonto = Math.max(0, deuda.montoActual - (capital || monto));
    const deudaActualizada = await prisma.deuda.update({
      where: { id: parseInt(deudaId) },
      data: {
        montoActual: nuevoMonto,
        pagada: nuevoMonto === 0,
      },
    });

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      pago,
      deuda: toDeudaDto(deudaActualizada),
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ============= CONTROLADOR DE GAMIFICACION =============

exports.obtenerLogrosUsuario = async (req, res) => {
  try {
    const userId = req.user.id;

    const logrosObtenidos = await prisma.userLogro.findMany({
      where: { userId },
      include: {
        logro: true,
      },
      orderBy: { fechaObtenido: 'desc' },
    });

    const todosLosLogros = await prisma.logro.findMany({
      where: { activo: true },
      include: {
        usuarios: {
          where: { userId },
        },
      },
    });

    const obtenidosIds = new Set(logrosObtenidos.map((ul) => ul.logroId));
    const logros = todosLosLogros.map((logro) => {
      const userLogro = logro.usuarios[0];
      return {
        id: logro.id,
        nombre: logro.nombre,
        descripcion: logro.descripcion,
        icono: logro.icono,
        tipo: logro.tipo,
        puntos: logro.puntos,
        rareza: logro.rareza,
        desbloqueado: obtenidosIds.has(logro.id),
        fechaDesbloqueo: userLogro?.fechaObtenido || null,
        progreso: userLogro?.progreso ?? 0,
      };
    });

    const puntosTotal = logrosObtenidos.reduce(
      (sum, ul) => sum + ul.logro.puntos,
      0
    );
    const nivel = Math.floor(puntosTotal / 1000) + 1;
    const puntosNivelActual = puntosTotal % 1000;
    const progresoNivel = Math.round((puntosNivelActual / 1000) * 100);
    const porcentajeCompletado =
      todosLosLogros.length > 0
        ? (logrosObtenidos.length / todosLosLogros.length) * 100
        : 0;

    res.status(200).json({
      logrosObtenidos,
      todosLosLogros,
      logros,
      estadisticas: {
        puntosTotal,
        totalPuntos: puntosTotal,
        nivel,
        progresoNivel,
        logrosObtenidos: logrosObtenidos.length,
        logrosDisponibles: todosLosLogros.length,
        porcentajeCompletado,
      },
    });
  } catch (error) {
    console.error('Error al obtener logros:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.obtenerResumenLogros = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, logrosObtenidos, totalLogros] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { puntosAcumulados: true, nivel: true },
      }),
      prisma.userLogro.findMany({
        where: { userId },
        include: { logro: true },
      }),
      prisma.logro.count({ where: { activo: true } }),
    ]);

    const puntosTotal = logrosObtenidos.reduce(
      (sum, ul) => sum + ul.logro.puntos,
      0
    );
    const nivel = Math.floor(puntosTotal / 1000) + 1;
    const progresoNivel = Math.round(((puntosTotal % 1000) / 1000) * 100);

    res.status(200).json({
      nivel: user?.nivel || nivel,
      totalPuntos: user?.puntosAcumulados || puntosTotal,
      progresoNivel,
      logrosDesbloqueados: logrosObtenidos.length,
      logrosDisponibles: totalLogros,
    });
  } catch (error) {
    console.error('Error al obtener resumen de logros:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.obtenerHistorialPuntos = async (req, res) => {
  try {
    const userId = req.user.id;

    const logrosObtenidos = await prisma.userLogro.findMany({
      where: { userId },
      include: { logro: true },
      orderBy: { fechaObtenido: 'desc' },
      take: 50,
    });

    const historial = logrosObtenidos.map((ul) => ({
      fecha: ul.fechaObtenido,
      descripcion: `Logro: ${ul.logro.nombre}`,
      puntos: ul.logro.puntos,
    }));

    res.status(200).json({ historial });
  } catch (error) {
    console.error('Error al obtener historial de puntos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.verificarLogros = async (req, res) => {
  try {
    const userId = req.user.id;
    const otorgados = [];

    const [transacciones, inversiones, deudasPagadas, deudasTotales] =
      await Promise.all([
        prisma.transaccion.count({ where: { userId } }),
        prisma.inversion.count({ where: { userId, activa: true } }),
        prisma.deuda.count({ where: { userId, pagada: true } }),
        prisma.deuda.count({ where: { userId } }),
      ]);

    const reglas = [
      { nombre: 'Primera Transacción', ok: transacciones >= 1 },
      { nombre: 'Inversionista', ok: inversiones >= 1 },
      {
        nombre: 'Libre de Deudas',
        ok: deudasTotales > 0 && deudasPagadas === deudasTotales,
      },
    ];

    for (const regla of reglas) {
      if (!regla.ok) continue;

      const logro = await prisma.logro.findFirst({
        where: { nombre: regla.nombre, activo: true },
      });
      if (!logro) continue;

      const resultado = await prisma.userLogro.upsert({
        where: {
          userId_logroId: { userId, logroId: logro.id },
        },
        create: { userId, logroId: logro.id },
        update: {},
      });

      if (resultado) {
        otorgados.push(logro.nombre);
      }
    }

    const logrosObtenidos = await prisma.userLogro.findMany({
      where: { userId },
      include: { logro: true },
    });
    const puntosTotal = logrosObtenidos.reduce(
      (sum, ul) => sum + ul.logro.puntos,
      0
    );
    const nivel = Math.floor(puntosTotal / 1000) + 1;

    await prisma.user.update({
      where: { id: userId },
      data: {
        puntosAcumulados: puntosTotal,
        nivel,
      },
    });

    res.status(200).json({
      message: 'Logros verificados',
      otorgados,
      puntosTotal,
      nivel,
    });
  } catch (error) {
    console.error('Error al verificar logros:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
