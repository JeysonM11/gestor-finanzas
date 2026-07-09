const prisma = require('../lib/prisma');

// Crear una nueva transacción
exports.crearTransaccion = async (req, res) => {
  try {
    const userId = req.user.id;
    const transaccionData = {
      ...req.body,
      userId
    };

    const transaccion = await prisma.transaccion.create({
      data: transaccionData,
    });

    res.status(201).json({
      success: true,
      message: "Transacción creada exitosamente",
      transaccion,
    });
  } catch (error) {
    console.error("Error al crear transacción:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear transacción",
      error: error.message 
    });
  }
};

// Obtener todas las transacciones del usuario
exports.obtenerTransacciones = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tipo, categoria, fechaInicio, fechaFin, page = 1, limit = 20, search } = req.query;

    // Construir filtros dinámicos
    const where = {
      userId,
      ...(tipo && { tipo }),
      ...(categoria && { categoria }),
    };

    // Filtro de fechas
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
      if (fechaFin) where.fecha.lte = new Date(fechaFin);
    }

    // Filtro de búsqueda
    if (search) {
      where.OR = [
        { descripcion: { contains: search, mode: 'insensitive' } },
        { notas: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Obtener total de registros
    const total = await prisma.transaccion.count({ where });

    // Obtener transacciones
    const transacciones = await prisma.transaccion.findMany({
      where,
      orderBy: {
        fecha: "desc",
      },
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        descripcion: true,
        monto: true,
        tipo: true,
        categoria: true,
        subcategoria: true,
        fecha: true,
        metodoPago: true,
        notas: true,
        etiquetas: true,
      },
    });

    // Calcular ingresos y gastos totales
    let totalIngresos = 0;
    let totalGastos = 0;

    transacciones.forEach((t) => {
      if (t.tipo === "INGRESO") {
        totalIngresos += t.monto;
      } else if (t.tipo === "GASTO") {
        totalGastos += t.monto;
      }
    });

    res.status(200).json({
      success: true,
      transacciones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      resumen: {
        balance: totalIngresos - totalGastos,
        totalIngresos,
        totalGastos,
      }
    });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};

// Obtener transacción por ID
exports.obtenerTransaccionPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const transaccion = await prisma.transaccion.findUnique({
      where: { id: parseInt(id) },
    });
    if (!transaccion) {
      return res.status(404).json({ message: "Transacción no encontrada" });
    }
    return res.json(transaccion);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener la transacción", error });
  }
};

// Actualizar transacción
exports.actualizarTransaccion = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const transaccion = await prisma.transaccion.update({
      where: { id: parseInt(id) },
      data,
    });
    return res.json(transaccion);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al actualizar la transacción", error });
  }
};

// Eliminar transacción
exports.eliminarTransaccion = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.transaccion.delete({
      where: { id: parseInt(id) },
    });
    return res.json({ message: "Transacción eliminada correctamente" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al eliminar la transacción", error });
  }
};

// Obtener resumen de transacciones
exports.obtenerResumen = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fechaInicio, fechaFin } = req.query;

    // Construir filtro de fechas
    const where = { userId };
    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
      if (fechaFin) where.fecha.lte = new Date(fechaFin);
    }

    // Obtener todas las transacciones para calcular el resumen
    const transacciones = await prisma.transaccion.findMany({
      where,
      select: {
        monto: true,
        tipo: true,
      },
    });

    // Calcular totales
    let totalIngresos = 0;
    let totalGastos = 0;

    transacciones.forEach((t) => {
      if (t.tipo === "INGRESO") {
        totalIngresos += t.monto;
      } else if (t.tipo === "GASTO") {
        totalGastos += t.monto;
      }
    });

    const balance = totalIngresos - totalGastos;

    res.status(200).json({
      success: true,
      totalIngresos,
      totalGastos,
      balance,
      cantidadTransacciones: transacciones.length,
    });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen",
      error: error.message,
    });
  }
};
