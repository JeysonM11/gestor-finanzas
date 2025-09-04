const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ============= CONTROLADOR DE CUENTAS =============

// Obtener todas las cuentas del usuario
exports.obtenerCuentas = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cuentas = await prisma.cuenta.findMany({
      where: { userId, activa: true },
      include: {
        _count: {
          select: {
            transaccionesOrigen: true,
            transaccionesDestino: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    // Calcular balance total
    const balanceTotal = cuentas.reduce((total, cuenta) => {
      return cuenta.incluirEnBalance ? total + cuenta.saldoActual : total;
    }, 0);

    res.status(200).json({
      cuentas,
      balanceTotal,
      resumen: {
        totalCuentas: cuentas.length,
        cuentasActivas: cuentas.filter(c => c.activa).length,
        tiposCuenta: [...new Set(cuentas.map(c => c.tipo))]
      }
    });
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear nueva cuenta
exports.crearCuenta = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      nombre, tipo, banco, numeroCuenta, saldoInicial, 
      moneda, color, icono, descripcion, fechaApertura 
    } = req.body;

    // Validaciones
    if (!nombre || !tipo) {
      return res.status(400).json({ 
        message: 'Nombre y tipo de cuenta son obligatorios' 
      });
    }

    const cuenta = await prisma.cuenta.create({
      data: {
        nombre,
        tipo,
        banco,
        numeroCuenta,
        saldoInicial: saldoInicial || 0,
        saldoActual: saldoInicial || 0,
        moneda: moneda || 'USD',
        color,
        icono,
        descripcion,
        fechaApertura: fechaApertura ? new Date(fechaApertura) : new Date(),
        userId
      }
    });

    res.status(201).json({
      message: 'Cuenta creada exitosamente',
      cuenta
    });
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar saldo de cuenta
exports.actualizarSaldo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { nuevoSaldo, motivo } = req.body;

    const cuenta = await prisma.cuenta.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!cuenta) {
      return res.status(404).json({ message: 'Cuenta no encontrada' });
    }

    const cuentaActualizada = await prisma.cuenta.update({
      where: { id: parseInt(id) },
      data: { saldoActual: nuevoSaldo }
    });

    // Crear transacción de ajuste si es necesario
    if (motivo) {
      const diferencia = nuevoSaldo - cuenta.saldoActual;
      await prisma.transaccion.create({
        data: {
          tipo: diferencia > 0 ? 'INGRESO' : 'GASTO',
          monto: Math.abs(diferencia),
          descripcion: `Ajuste de saldo: ${motivo}`,
          categoria: 'Ajustes',
          cuentaOrigenId: parseInt(id),
          userId
        }
      });
    }

    res.status(200).json({
      message: 'Saldo actualizado exitosamente',
      cuenta: cuentaActualizada
    });
  } catch (error) {
    console.error('Error al actualizar saldo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ============= CONTROLADOR DE INVERSIONES =============

// Obtener inversiones del usuario
exports.obtenerInversiones = async (req, res) => {
  try {
    const userId = req.user.id;

    const inversiones = await prisma.inversion.findMany({
      where: { userId, activa: true },
      include: {
        historialValores: {
          orderBy: { fecha: 'desc' },
          take: 30 // Últimos 30 registros
        }
      },
      orderBy: { fechaCompra: 'desc' }
    });

    // Calcular métricas
    const totalInvertido = inversiones.reduce((sum, inv) => sum + inv.montoInvertido, 0);
    const valorActualTotal = inversiones.reduce((sum, inv) => sum + (inv.valorActual || inv.montoInvertido), 0);
    const gananciaTotal = valorActualTotal - totalInvertido;
    const porcentajeGanancia = totalInvertido > 0 ? (gananciaTotal / totalInvertido) * 100 : 0;

    res.status(200).json({
      inversiones,
      resumen: {
        totalInvertido,
        valorActualTotal,
        gananciaTotal,
        porcentajeGanancia,
        cantidadInversiones: inversiones.length
      }
    });
  } catch (error) {
    console.error('Error al obtener inversiones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear nueva inversión
exports.crearInversion = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nombre, tipo, simbolo, montoInvertido, cantidad,
      fechaCompra, broker, comisiones, notas
    } = req.body;

    const inversion = await prisma.inversion.create({
      data: {
        nombre,
        tipo,
        simbolo,
        montoInvertido,
        valorActual: montoInvertido, // Inicialmente igual al monto invertido
        cantidad,
        fechaCompra: new Date(fechaCompra),
        broker,
        comisiones: comisiones || 0,
        notas,
        userId
      }
    });

    // Crear registro inicial en historial
    await prisma.historialInversion.create({
      data: {
        valor: montoInvertido,
        inversionId: inversion.id
      }
    });

    res.status(201).json({
      message: 'Inversión creada exitosamente',
      inversion
    });
  } catch (error) {
    console.error('Error al crear inversión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ============= CONTROLADOR DE DEUDAS =============

// Obtener deudas del usuario
exports.obtenerDeudas = async (req, res) => {
  try {
    const userId = req.user.id;

    const deudas = await prisma.deuda.findMany({
      where: { userId },
      include: {
        pagos: {
          orderBy: { fecha: 'desc' }
        }
      },
      orderBy: { fechaVencimiento: 'asc' }
    });

    // Calcular métricas
    const totalDeuda = deudas.reduce((sum, deuda) => sum + deuda.montoActual, 0);
    const deudasVencidas = deudas.filter(d => 
      d.fechaVencimiento && d.fechaVencimiento < new Date() && !d.pagada
    );
    const pagoMinimoTotal = deudas.reduce((sum, deuda) => sum + (deuda.pagoMinimo || 0), 0);

    res.status(200).json({
      deudas,
      resumen: {
        totalDeuda,
        cantidadDeudas: deudas.length,
        deudasVencidas: deudasVencidas.length,
        pagoMinimoTotal,
        deudasPagadas: deudas.filter(d => d.pagada).length
      }
    });
  } catch (error) {
    console.error('Error al obtener deudas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Registrar pago de deuda
exports.registrarPagoDeuda = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deudaId } = req.params;
    const { monto, capital, interes, fecha, notas } = req.body;

    // Verificar que la deuda pertenece al usuario
    const deuda = await prisma.deuda.findFirst({
      where: { id: parseInt(deudaId), userId }
    });

    if (!deuda) {
      return res.status(404).json({ message: 'Deuda no encontrada' });
    }

    // Crear el pago
    const pago = await prisma.pagoDeuda.create({
      data: {
        monto,
        capital: capital || monto,
        interes: interes || 0,
        fecha: new Date(fecha || Date.now()),
        notas,
        deudaId: parseInt(deudaId)
      }
    });

    // Actualizar el monto actual de la deuda
    const nuevoMonto = Math.max(0, deuda.montoActual - (capital || monto));
    const deudaActualizada = await prisma.deuda.update({
      where: { id: parseInt(deudaId) },
      data: {
        montoActual: nuevoMonto,
        pagada: nuevoMonto === 0
      }
    });

    res.status(201).json({
      message: 'Pago registrado exitosamente',
      pago,
      deuda: deudaActualizada
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ============= CONTROLADOR DE GAMIFICACIÓN =============

// Obtener logros del usuario
exports.obtenerLogrosUsuario = async (req, res) => {
  try {
    const userId = req.user.id;

    const logrosObtenidos = await prisma.userLogro.findMany({
      where: { userId },
      include: {
        logro: true
      },
      orderBy: { fechaObtenido: 'desc' }
    });

    const todosLosLogros = await prisma.logro.findMany({
      where: { activo: true },
      include: {
        usuarios: {
          where: { userId }
        }
      }
    });

    const puntosTotal = logrosObtenidos.reduce((sum, ul) => sum + ul.logro.puntos, 0);
    
    // Calcular nivel basado en puntos
    const nivel = Math.floor(puntosTotal / 1000) + 1;

    res.status(200).json({
      logrosObtenidos,
      todosLosLogros,
      estadisticas: {
        puntosTotal,
        nivel,
        logrosObtenidos: logrosObtenidos.length,
        logrosDisponibles: todosLosLogros.length,
        porcentajeCompletado: (logrosObtenidos.length / todosLosLogros.length) * 100
      }
    });
  } catch (error) {
    console.error('Error al obtener logros:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Verificar y otorgar logros automáticamente
exports.verificarLogros = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ejemplo: Logro por primera transacción
    const transacciones = await prisma.transaccion.count({
      where: { userId }
    });

    if (transacciones === 1) {
      // Otorgar logro "Primera Transacción"
      const logro = await prisma.logro.findFirst({
        where: { nombre: 'Primera Transacción' }
      });

      if (logro) {
        await prisma.userLogro.upsert({
          where: {
            userId_logroId: {
              userId,
              logroId: logro.id
            }
          },
          create: {
            userId,
            logroId: logro.id
          },
          update: {}
        });
      }
    }

    // Aquí puedes agregar más lógica para otros logros...

    res.status(200).json({ message: 'Logros verificados' });
  } catch (error) {
    console.error('Error al verificar logros:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
