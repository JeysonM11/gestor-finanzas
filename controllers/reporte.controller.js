const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Generar reporte mensual
exports.generarReporteMensual = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mes, año } = req.query;

    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0, 23, 59, 59);

    // Obtener transacciones del mes
    const transacciones = await prisma.transaccion.findMany({
      where: {
        userId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        }
      },
      orderBy: { fecha: 'desc' }
    });

    // Calcular totales
    const ingresos = transacciones
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);

    const gastos = transacciones
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);

    // Agrupar por categoría
    const porCategoria = {};
    transacciones.forEach(t => {
      if (!porCategoria[t.categoria || 'Sin categoría']) {
        porCategoria[t.categoria || 'Sin categoría'] = {
          ingresos: 0,
          gastos: 0,
          cantidad: 0
        };
      }
      
      if (t.tipo === 'ingreso') {
        porCategoria[t.categoria || 'Sin categoría'].ingresos += t.monto;
      } else {
        porCategoria[t.categoria || 'Sin categoría'].gastos += t.monto;
      }
      porCategoria[t.categoria || 'Sin categoría'].cantidad++;
    });

    // Comparar con mes anterior
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const añoAnterior = mes === 1 ? año - 1 : año;
    
    const fechaInicioAnterior = new Date(añoAnterior, mesAnterior - 1, 1);
    const fechaFinAnterior = new Date(añoAnterior, mesAnterior, 0, 23, 59, 59);

    const transaccionesAnterior = await prisma.transaccion.findMany({
      where: {
        userId,
        fecha: {
          gte: fechaInicioAnterior,
          lte: fechaFinAnterior
        }
      }
    });

    const ingresosAnterior = transaccionesAnterior
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);

    const gastosAnterior = transaccionesAnterior
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.monto, 0);

    const reporte = {
      periodo: { mes, año },
      resumen: {
        ingresos,
        gastos,
        balance: ingresos - gastos,
        cantidadTransacciones: transacciones.length
      },
      comparacion: {
        ingresosAnterior,
        gastosAnterior,
        variacionIngresos: ingresos - ingresosAnterior,
        variacionGastos: gastos - gastosAnterior,
        porcentajeIngresos: ingresosAnterior > 0 ? ((ingresos - ingresosAnterior) / ingresosAnterior) * 100 : 0,
        porcentajeGastos: gastosAnterior > 0 ? ((gastos - gastosAnterior) / gastosAnterior) * 100 : 0
      },
      porCategoria,
      transacciones: transacciones.slice(0, 10) // Top 10 más recientes
    };

    res.status(200).json(reporte);
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Exportar datos a CSV
exports.exportarCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fechaInicio, fechaFin } = req.query;

    const filtros = { userId };
    if (fechaInicio && fechaFin) {
      filtros.fecha = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      };
    }

    const transacciones = await prisma.transaccion.findMany({
      where: filtros,
      orderBy: { fecha: 'desc' }
    });

    // Generar CSV
    const headers = ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto'];
    const csvData = [
      headers.join(','),
      ...transacciones.map(t => [
        new Date(t.fecha).toLocaleDateString('es-ES'),
        t.tipo,
        `"${t.descripcion || ''}"`,
        t.categoria || '',
        t.monto
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transacciones.csv');
    res.send(csvData);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
