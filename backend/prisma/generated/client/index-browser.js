
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  avatar: 'avatar',
  telefono: 'telefono',
  fechaNacimiento: 'fechaNacimiento',
  ocupacion: 'ocupacion',
  salarioMensual: 'salarioMensual',
  monedaPrincipal: 'monedaPrincipal',
  configuracion: 'configuracion',
  emailVerificado: 'emailVerificado',
  activo: 'activo',
  ultimoAcceso: 'ultimoAcceso',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  puntosAcumulados: 'puntosAcumulados',
  nivel: 'nivel'
};

exports.Prisma.CuentaScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  tipo: 'tipo',
  banco: 'banco',
  numeroCuenta: 'numeroCuenta',
  saldoInicial: 'saldoInicial',
  saldoActual: 'saldoActual',
  moneda: 'moneda',
  color: 'color',
  icono: 'icono',
  activa: 'activa',
  incluirEnBalance: 'incluirEnBalance',
  descripcion: 'descripcion',
  fechaApertura: 'fechaApertura',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransaccionScalarFieldEnum = {
  id: 'id',
  tipo: 'tipo',
  monto: 'monto',
  descripcion: 'descripcion',
  categoria: 'categoria',
  subcategoria: 'subcategoria',
  fecha: 'fecha',
  ubicacion: 'ubicacion',
  notas: 'notas',
  etiquetas: 'etiquetas',
  montoOriginal: 'montoOriginal',
  monedaOriginal: 'monedaOriginal',
  tasaCambio: 'tasaCambio',
  comprobante: 'comprobante',
  metodoPago: 'metodoPago',
  esTransferencia: 'esTransferencia',
  verificada: 'verificada',
  userId: 'userId',
  cuentaOrigenId: 'cuentaOrigenId',
  cuentaDestinoId: 'cuentaDestinoId',
  transaccionRecurrenteId: 'transaccionRecurrenteId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TransaccionRecurrenteScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  descripcion: 'descripcion',
  tipo: 'tipo',
  monto: 'monto',
  categoria: 'categoria',
  frecuencia: 'frecuencia',
  diaEjecucion: 'diaEjecucion',
  diaSemana: 'diaSemana',
  fechaInicio: 'fechaInicio',
  fechaFin: 'fechaFin',
  proximaEjecucion: 'proximaEjecucion',
  activa: 'activa',
  ejecutadas: 'ejecutadas',
  configuracion: 'configuracion',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MetaScalarFieldEnum = {
  id: 'id',
  titulo: 'titulo',
  descripcion: 'descripcion',
  tipo: 'tipo',
  montoObjetivo: 'montoObjetivo',
  montoActual: 'montoActual',
  fechaInicio: 'fechaInicio',
  fechaLimite: 'fechaLimite',
  categoria: 'categoria',
  prioridad: 'prioridad',
  completada: 'completada',
  fechaCompletada: 'fechaCompletada',
  progreso: 'progreso',
  recordatorios: 'recordatorios',
  publica: 'publica',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PresupuestoScalarFieldEnum = {
  id: 'id',
  categoria: 'categoria',
  limite: 'limite',
  gastado: 'gastado',
  mes: 'mes',
  año: 'año',
  alertaEn: 'alertaEn',
  notificacionEnviada: 'notificacionEnviada',
  activo: 'activo',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CategoriaPersonalizadaScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  icono: 'icono',
  color: 'color',
  descripcion: 'descripcion',
  tipo: 'tipo',
  activa: 'activa',
  orden: 'orden',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InversionScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  tipo: 'tipo',
  simbolo: 'simbolo',
  montoInvertido: 'montoInvertido',
  valorActual: 'valorActual',
  cantidad: 'cantidad',
  fechaCompra: 'fechaCompra',
  fechaVenta: 'fechaVenta',
  broker: 'broker',
  comisiones: 'comisiones',
  dividendos: 'dividendos',
  notas: 'notas',
  activa: 'activa',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HistorialInversionScalarFieldEnum = {
  id: 'id',
  valor: 'valor',
  fecha: 'fecha',
  inversionId: 'inversionId'
};

exports.Prisma.DeudaScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  tipo: 'tipo',
  montoInicial: 'montoInicial',
  montoActual: 'montoActual',
  tasaInteres: 'tasaInteres',
  fechaInicio: 'fechaInicio',
  fechaVencimiento: 'fechaVencimiento',
  pagoMinimo: 'pagoMinimo',
  acreedor: 'acreedor',
  notas: 'notas',
  pagada: 'pagada',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PagoDeudaScalarFieldEnum = {
  id: 'id',
  monto: 'monto',
  fecha: 'fecha',
  capital: 'capital',
  interes: 'interes',
  notas: 'notas',
  deudaId: 'deudaId',
  createdAt: 'createdAt'
};

exports.Prisma.LogroScalarFieldEnum = {
  id: 'id',
  nombre: 'nombre',
  descripcion: 'descripcion',
  icono: 'icono',
  tipo: 'tipo',
  condicion: 'condicion',
  puntos: 'puntos',
  rareza: 'rareza',
  activo: 'activo',
  createdAt: 'createdAt'
};

exports.Prisma.UserLogroScalarFieldEnum = {
  id: 'id',
  fechaObtenido: 'fechaObtenido',
  progreso: 'progreso',
  userId: 'userId',
  logroId: 'logroId'
};

exports.Prisma.NotificacionScalarFieldEnum = {
  id: 'id',
  titulo: 'titulo',
  mensaje: 'mensaje',
  tipo: 'tipo',
  leida: 'leida',
  datos: 'datos',
  fechaEnvio: 'fechaEnvio',
  fechaLeida: 'fechaLeida',
  userId: 'userId'
};

exports.Prisma.RecordatorioScalarFieldEnum = {
  id: 'id',
  titulo: 'titulo',
  descripcion: 'descripcion',
  tipo: 'tipo',
  fechaRecordatorio: 'fechaRecordatorio',
  repetir: 'repetir',
  frecuencia: 'frecuencia',
  completado: 'completado',
  activo: 'activo',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SesionUsuarioScalarFieldEnum = {
  id: 'id',
  token: 'token',
  dispositivo: 'dispositivo',
  ip: 'ip',
  ubicacion: 'ubicacion',
  userAgent: 'userAgent',
  activa: 'activa',
  fechaExpiracion: 'fechaExpiracion',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditoriaAccesoScalarFieldEnum = {
  id: 'id',
  accion: 'accion',
  ip: 'ip',
  dispositivo: 'dispositivo',
  ubicacion: 'ubicacion',
  userAgent: 'userAgent',
  exitoso: 'exitoso',
  detalles: 'detalles',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.ConfiguracionSistemaScalarFieldEnum = {
  id: 'id',
  clave: 'clave',
  valor: 'valor',
  descripcion: 'descripcion',
  tipo: 'tipo',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.TipoCuenta = exports.$Enums.TipoCuenta = {
  EFECTIVO: 'EFECTIVO',
  BANCO_CORRIENTE: 'BANCO_CORRIENTE',
  BANCO_AHORROS: 'BANCO_AHORROS',
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  TARJETA_DEBITO: 'TARJETA_DEBITO',
  INVERSION: 'INVERSION',
  CRYPTO: 'CRYPTO',
  OTRO: 'OTRO'
};

exports.TipoTransaccion = exports.$Enums.TipoTransaccion = {
  INGRESO: 'INGRESO',
  GASTO: 'GASTO',
  TRANSFERENCIA: 'TRANSFERENCIA'
};

exports.MetodoPago = exports.$Enums.MetodoPago = {
  EFECTIVO: 'EFECTIVO',
  TARJETA_DEBITO: 'TARJETA_DEBITO',
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  CHEQUE: 'CHEQUE',
  CRYPTO: 'CRYPTO',
  OTRO: 'OTRO'
};

exports.FrecuenciaRecurrencia = exports.$Enums.FrecuenciaRecurrencia = {
  DIARIA: 'DIARIA',
  SEMANAL: 'SEMANAL',
  QUINCENAL: 'QUINCENAL',
  MENSUAL: 'MENSUAL',
  BIMESTRAL: 'BIMESTRAL',
  TRIMESTRAL: 'TRIMESTRAL',
  SEMESTRAL: 'SEMESTRAL',
  ANUAL: 'ANUAL'
};

exports.TipoMeta = exports.$Enums.TipoMeta = {
  AHORRO: 'AHORRO',
  GASTO: 'GASTO',
  INVERSION: 'INVERSION',
  DEUDA: 'DEUDA',
  EMERGENCIA: 'EMERGENCIA'
};

exports.PrioridadMeta = exports.$Enums.PrioridadMeta = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA'
};

exports.TipoInversion = exports.$Enums.TipoInversion = {
  ACCIONES: 'ACCIONES',
  BONOS: 'BONOS',
  FONDOS_MUTUOS: 'FONDOS_MUTUOS',
  ETF: 'ETF',
  CRIPTOMONEDAS: 'CRIPTOMONEDAS',
  BIENES_RAICES: 'BIENES_RAICES',
  COMMODITIES: 'COMMODITIES',
  OTRO: 'OTRO'
};

exports.TipoDeuda = exports.$Enums.TipoDeuda = {
  TARJETA_CREDITO: 'TARJETA_CREDITO',
  PRESTAMO_PERSONAL: 'PRESTAMO_PERSONAL',
  HIPOTECA: 'HIPOTECA',
  PRESTAMO_AUTO: 'PRESTAMO_AUTO',
  PRESTAMO_ESTUDIANTIL: 'PRESTAMO_ESTUDIANTIL',
  LINEA_CREDITO: 'LINEA_CREDITO',
  OTRO: 'OTRO'
};

exports.TipoLogro = exports.$Enums.TipoLogro = {
  AHORRO: 'AHORRO',
  PRESUPUESTO: 'PRESUPUESTO',
  META: 'META',
  HABITO: 'HABITO',
  INVERSION: 'INVERSION',
  DEUDA: 'DEUDA',
  GAMIFICACION: 'GAMIFICACION'
};

exports.RarezaLogro = exports.$Enums.RarezaLogro = {
  COMUN: 'COMUN',
  POCO_COMUN: 'POCO_COMUN',
  RARO: 'RARO',
  EPICO: 'EPICO',
  LEGENDARIO: 'LEGENDARIO'
};

exports.TipoNotificacion = exports.$Enums.TipoNotificacion = {
  INFO: 'INFO',
  ALERTA: 'ALERTA',
  RECORDATORIO: 'RECORDATORIO',
  LOGRO: 'LOGRO',
  SISTEMA: 'SISTEMA',
  PROMOCION: 'PROMOCION'
};

exports.TipoRecordatorio = exports.$Enums.TipoRecordatorio = {
  PAGO: 'PAGO',
  META: 'META',
  PRESUPUESTO: 'PRESUPUESTO',
  INVERSION: 'INVERSION',
  DEUDA: 'DEUDA',
  GENERAL: 'GENERAL'
};

exports.Prisma.ModelName = {
  User: 'User',
  Cuenta: 'Cuenta',
  Transaccion: 'Transaccion',
  TransaccionRecurrente: 'TransaccionRecurrente',
  Meta: 'Meta',
  Presupuesto: 'Presupuesto',
  CategoriaPersonalizada: 'CategoriaPersonalizada',
  Inversion: 'Inversion',
  HistorialInversion: 'HistorialInversion',
  Deuda: 'Deuda',
  PagoDeuda: 'PagoDeuda',
  Logro: 'Logro',
  UserLogro: 'UserLogro',
  Notificacion: 'Notificacion',
  Recordatorio: 'Recordatorio',
  SesionUsuario: 'SesionUsuario',
  AuditoriaAcceso: 'AuditoriaAcceso',
  ConfiguracionSistema: 'ConfiguracionSistema'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
