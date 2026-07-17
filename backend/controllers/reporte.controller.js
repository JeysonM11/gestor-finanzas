const prisma = require('../lib/prisma');
const { startOfDayUTC, endOfDayUTC } = require('../utils/date');

const TIPOS_GASTO = ['GASTO', 'PAGO_DEUDA'];

function esGasto(tipo) {
  return TIPOS_GASTO.includes(tipo);
}

function categoriaLabel(t) {
  if (t.tipo === 'PAGO_DEUDA') return t.categoria || 'Pago de deuda';
  return t.categoria || 'Sin categoria';
}

function mesKeyUTC(fecha) {
  const d = new Date(fecha);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function mesLabelUTC(fecha) {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function rangoMesUTC(anio, mes) {
  const fechaInicio = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0, 0));
  const fechaFin = new Date(Date.UTC(anio, mes, 0, 23, 59, 59, 999));
  return { fechaInicio, fechaFin };
}

function escapeCsv(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s) || /^[=+\-@]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

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

    const { fechaInicio, fechaFin } = rangoMesUTC(anio, mes);

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
      .filter((t) => esGasto(t.tipo))
      .reduce((sum, t) => sum + t.monto, 0);

    const porCategoria = {};
    transacciones.forEach((t) => {
      const key = categoriaLabel(t);
      if (!porCategoria[key]) {
        porCategoria[key] = { ingresos: 0, gastos: 0, cantidad: 0 };
      }

      if (t.tipo === 'INGRESO') {
        porCategoria[key].ingresos += t.monto;
      } else if (esGasto(t.tipo)) {
        porCategoria[key].gastos += t.monto;
      }
      porCategoria[key].cantidad++;
    });

    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anioAnterior = mes === 1 ? anio - 1 : anio;
    const prev = rangoMesUTC(anioAnterior, mesAnterior);

    const transaccionesAnterior = await prisma.transaccion.findMany({
      where: {
        userId,
        fecha: {
          gte: prev.fechaInicio,
          lte: prev.fechaFin,
        },
      },
    });

    const ingresosAnterior = transaccionesAnterior
      .filter((t) => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + t.monto, 0);

    const gastosAnterior = transaccionesAnterior
      .filter((t) => esGasto(t.tipo))
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
    const anio = parseInt(req.query.anio || new Date().getUTCFullYear(), 10);

    const ahora = new Date();
    const finMesActual = new Date(
      Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() + 1, 0, 23, 59, 59, 999)
    );
    const inicioRango = new Date(
      Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() - (Math.max(meses, 1) - 1), 1, 0, 0, 0, 0)
    );

    const transacciones = await prisma.transaccion.findMany({
      where: {
        userId,
        fecha: { gte: inicioRango, lte: finMesActual },
      },
      select: { tipo: true, monto: true, categoria: true, fecha: true },
    });

    const gastosPorCategoria = {};
    const evolucion = {};

    transacciones.forEach((t) => {
      const key = mesKeyUTC(t.fecha);
      const label = mesLabelUTC(t.fecha);

      if (!evolucion[key]) {
        evolucion[key] = { mesKey: key, mes: label, ingresos: 0, gastos: 0 };
      }

      if (t.tipo === 'INGRESO') {
        evolucion[key].ingresos += t.monto;
      } else if (esGasto(t.tipo)) {
        evolucion[key].gastos += t.monto;
        const cat = categoriaLabel(t);
        gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + t.monto;
      }
    });

    const inicioAnio = new Date(Date.UTC(anio, 0, 1, 0, 0, 0, 0));
    const finAnio = new Date(Date.UTC(anio, 11, 31, 23, 59, 59, 999));
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
      .filter((t) => esGasto(t.tipo))
      .reduce((s, t) => s + t.monto, 0);

    res.status(200).json({
      gastosPorCategoria: Object.entries(gastosPorCategoria)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      evolucionMensual: (() => {
        const serie = [];
        for (let i = Math.max(meses, 1) - 1; i >= 0; i--) {
          const d = new Date(
            Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() - i, 1)
          );
          const key = mesKeyUTC(d);
          const label = mesLabelUTC(d);
          const existente = evolucion[key];
          serie.push({
            mesKey: key,
            mes: label,
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

    const [user, transacciones] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { monedaPrincipal: true },
      }),
      prisma.transaccion.findMany({
        where: filtros,
        orderBy: { fecha: 'desc' },
      }),
    ]);

    const monedaPrincipal = user?.monedaPrincipal || 'USD';

    const headers = [
      'Fecha',
      'Tipo',
      'Descripcion',
      'Categoria',
      'Monto',
      'Moneda',
    ];
    const csvData = [
      headers.join(','),
      ...transacciones.map((t) => {
        const monedaFila =
          t.monedaOriginal && t.monedaOriginal !== monedaPrincipal
            ? t.monedaOriginal
            : monedaPrincipal;
        return [
          new Date(t.fecha).toISOString().split('T')[0],
          t.tipo,
          escapeCsv(t.descripcion || ''),
          escapeCsv(t.categoria || ''),
          t.monto,
          monedaFila,
        ].join(',');
      }),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=transacciones.csv'
    );
    const bom = '\uFEFF';
    const meta = `# moneda_preferencia=${monedaPrincipal}\n`;
    res.send(bom + meta + csvData);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
