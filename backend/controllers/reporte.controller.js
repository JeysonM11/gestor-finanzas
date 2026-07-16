const prisma = require('../lib/prisma');
const { startOfDayUTC, endOfDayUTC } = require('../utils/date');

// Generar reporte mensual
exports.generarReporteMensual = async (req, res) => {
  try {
    const userId = req.user.id;
    const mes = parseInt(req.query.mes, 10);
    const anio = parseInt(req.query.anio || req.query.año, 10);

    if (!mes || !anio || mes < 1 || mes > 12) {
      return res.status(400).json({
        message: 'Se requieren mes (1-12) y anio validos',
      });
    }

    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    const transacciones = await prisma.transaccion.findMany({
      where: {
        userId,
        fecha: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      orderBy: { fecha: 'desc' },
    });

    const ingresos = transacciones
      .filter((t) => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + t.monto, 0);

    const gastos = transacciones
      .filter((t) => t.tipo === 'GASTO')
      .reduce((sum, t) => sum + t.monto, 0);

    const porCategoria = {};
    transacciones.forEach((t) => {
      const key = t.categoria || 'Sin categoria';
      if (!porCategoria[key]) {
        porCategoria[key] = { ingresos: 0, gastos: 0, cantidad: 0 };
      }

      if (t.tipo === 'INGRESO') {
        porCategoria[key].ingresos += t.monto;
      } else if (t.tipo === 'GASTO') {
        porCategoria[key].gastos += t.monto;
      }
      porCategoria[key].cantidad++;
    });

    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anioAnterior = mes === 1 ? anio - 1 : anio;

    const fechaInicioAnterior = new Date(anioAnterior, mesAnterior - 1, 1);
    const fechaFinAnterior = new Date(anioAnterior, mesAnterior, 0, 23, 59, 59);

    const transaccionesAnterior = await prisma.transaccion.findMany({
      where: {
        userId,
        fecha: {
          gte: fechaInicioAnterior,
          lte: fechaFinAnterior,
        },
      },
    });

    const ingresosAnterior = transaccionesAnterior
      .filter((t) => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + t.monto, 0);

    const gastosAnterior = transaccionesAnterior
      .filter((t) => t.tipo === 'GASTO')
      .reduce((sum, t) => sum + t.monto, 0);

    res.status(200).json({
      periodo: { mes, anio },
      resumen: {
        ingresos,
        gastos,
        balance: ingresos - gastos,
        cantidadTransacciones: transacciones.length,
      },
      comparacion: {
        ingresosAnterior,
        gastosAnterior,
        variacionIngresos: ingresos - ingresosAnterior,
        variacionGastos: gastos - gastosAnterior,
        porcentajeIngresos:
          ingresosAnterior > 0
            ? ((ingresos - ingresosAnterior) / ingresosAnterior) * 100
            : 0,
        porcentajeGastos:
          gastosAnterior > 0
            ? ((gastos - gastosAnterior) / gastosAnterior) * 100
            : 0,
      },
      porCategoria,
      transacciones: transacciones.slice(0, 10),
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Agregados para graficos (gastos por categoria, evolucion, comparacion anual)
exports.obtenerAgregados = async (req, res) => {
  try {
    const userId = req.user.id;
    const meses = parseInt(req.query.meses || '6', 10);
    const anio = parseInt(req.query.anio || new Date().getFullYear(), 10);

    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - meses);

    const transacciones = await prisma.transaccion.findMany({
      where: {
        userId,
        fecha: { gte: fechaInicio, lte: fechaFin },
      },
      select: { tipo: true, monto: true, categoria: true, fecha: true },
    });

    const gastosPorCategoria = {};
    const evolucion = {};

    transacciones.forEach((t) => {
      const fecha = new Date(t.fecha);
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const mesLabel = fecha.toLocaleDateString('es-ES', {
        month: 'short',
        year: 'numeric',
      });

      if (!evolucion[mesKey]) {
        evolucion[mesKey] = { mesKey, mes: mesLabel, ingresos: 0, gastos: 0 };
      }

      if (t.tipo === 'INGRESO') {
        evolucion[mesKey].ingresos += t.monto;
      } else if (t.tipo === 'GASTO') {
        evolucion[mesKey].gastos += t.monto;
        const cat = t.categoria || 'Sin categoria';
        gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + t.monto;
      }
    });

    const inicioAnio = new Date(anio, 0, 1);
    const finAnio = new Date(anio, 11, 31, 23, 59, 59);
    const anuales = await prisma.transaccion.findMany({
      where: {
        userId,
        fecha: { gte: inicioAnio, lte: finAnio },
      },
      select: { tipo: true, monto: true },
    });

    const totalIngresos = anuales
      .filter((t) => t.tipo === 'INGRESO')
      .reduce((s, t) => s + t.monto, 0);
    const totalGastos = anuales
      .filter((t) => t.tipo === 'GASTO')
      .reduce((s, t) => s + t.monto, 0);

    res.status(200).json({
      gastosPorCategoria: Object.entries(gastosPorCategoria)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      evolucionMensual: (() => {
        const serie = [];
        const cursor = new Date();
        cursor.setDate(1);
        cursor.setHours(0, 0, 0, 0);
        for (let i = Math.max(meses, 1) - 1; i >= 0; i--) {
          const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
          const mesKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const mesLabel = d.toLocaleDateString('es-ES', {
            month: 'short',
            year: 'numeric',
          });
          const existente = evolucion[mesKey];
          serie.push({
            mesKey,
            mes: mesLabel,
            ingresos: existente?.ingresos || 0,
            gastos: existente?.gastos || 0,
          });
        }
        return serie;
      })(),
      comparacionAnual: [
        { name: 'Ingresos', value: totalIngresos, fill: '#10B981' },
        { name: 'Gastos', value: totalGastos, fill: '#EF4444' },
      ],
    });
  } catch (error) {
    console.error('Error al obtener agregados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Exportar datos a CSV
exports.exportarCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fechaInicio, fechaFin } = req.query;

    const filtros = { userId };
    if (fechaInicio || fechaFin) {
      filtros.fecha = {};
      if (fechaInicio) filtros.fecha.gte = startOfDayUTC(fechaInicio);
      if (fechaFin) filtros.fecha.lte = endOfDayUTC(fechaFin);
    }

    const transacciones = await prisma.transaccion.findMany({
      where: filtros,
      orderBy: { fecha: 'desc' },
    });

    const headers = ['Fecha', 'Tipo', 'Descripcion', 'Categoria', 'Monto'];
    const csvData = [
      headers.join(','),
      ...transacciones.map((t) =>
        [
          new Date(t.fecha).toISOString().split('T')[0],
          t.tipo,
          `"${(t.descripcion || '').replace(/"/g, '""')}"`,
          t.categoria || '',
          t.monto,
        ].join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transacciones.csv'
    );
    res.send(csvData);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
