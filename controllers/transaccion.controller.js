const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Crear una nueva transacción
exports.crearTransaccion = async (req, res) => {
  try {
    const { descripcion, monto, tipo, categoria } = req.body;
    const userId = req.user.id;

    // Validación de campos obligatorios
    if (!descripcion || !monto || !tipo) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Validación de tipo
    if (!["ingreso", "gasto"].includes(tipo)) {
      return res.status(400).json({ message: "Tipo de transacción inválido" });
    }

    // Validación de monto
    if (isNaN(monto) || monto <= 0) {
      return res
        .status(400)
        .json({ message: "Monto debe ser un número positivo" });
    }

    const transaccion = await prisma.transaccion.create({
      data: {
        descripcion,
        monto,
        tipo,
        categoria,
        userId,
      },
    });

    res.status(201).json({
      message: "Transacción creada",
      transaccion,
    });
  } catch (error) {
    console.error("Error al crear transacción:", error);
    res.status(500).json({ message: error });
  }
};

// Obtener todas las transacciones del usuario
exports.obtenerTransacciones = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tipo, categoria, desde, hasta } = req.query;

    // Validación de fechas
    let fechaDesde = null;
    let fechaHasta = null;

    if (desde) {
      fechaDesde = new Date(desde);
      if (isNaN(fechaDesde)) {
        return res.status(400).json({ message: "Fecha desde inválida" });
      }
    }

    if (hasta) {
      fechaHasta = new Date(hasta);
      if (isNaN(fechaHasta)) {
        return res.status(400).json({ message: "Fecha hasta inválida" });
      }
    }

    const transacciones = await prisma.transaccion.findMany({
      where: {
        userId,
        ...(tipo && { tipo }),
        ...(fechaDesde &&
          fechaHasta && {
            fecha: {
              gte: fechaDesde,
              lte: fechaHasta,
            },
          }),
        ...(fechaDesde &&
          !fechaHasta && {
            fecha: {
              gte: fechaDesde,
            },
          }),
        ...(fechaHasta &&
          !fechaDesde && {
            fecha: {
              lte: fechaHasta,
            },
          }),
      },
      orderBy: {
        fecha: "desc",
      },
      select: {
        id: true,
        descripcion: true,
        monto: true,
        tipo: true,
        fecha: true,
      },
    });

    // Calcular ingresos y gastos en una sola pasada
    let totalIngresos = 0;
    let totalGastos = 0;

    transacciones.forEach((t) => {
      if (t.tipo === "ingreso") {
        totalIngresos += t.monto;
      } else if (t.tipo === "gasto") {
        totalGastos += t.monto;
      }
    });

    res.status(200).json({
      transacciones,
      balance: totalIngresos - totalGastos,
      totalIngresos,
      totalGastos,
    });
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
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
