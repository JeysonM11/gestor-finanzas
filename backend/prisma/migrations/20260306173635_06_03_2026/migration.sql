/*
  Warnings:

  - You are about to drop the `Transaccion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoCuenta" AS ENUM ('EFECTIVO', 'BANCO_CORRIENTE', 'BANCO_AHORROS', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'INVERSION', 'CRYPTO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoTransaccion" AS ENUM ('INGRESO', 'GASTO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'CHEQUE', 'CRYPTO', 'OTRO');

-- CreateEnum
CREATE TYPE "FrecuenciaRecurrencia" AS ENUM ('DIARIA', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "TipoMeta" AS ENUM ('AHORRO', 'GASTO', 'INVERSION', 'DEUDA', 'EMERGENCIA');

-- CreateEnum
CREATE TYPE "PrioridadMeta" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "TipoInversion" AS ENUM ('ACCIONES', 'BONOS', 'FONDOS_MUTUOS', 'ETF', 'CRIPTOMONEDAS', 'BIENES_RAICES', 'COMMODITIES', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoDeuda" AS ENUM ('TARJETA_CREDITO', 'PRESTAMO_PERSONAL', 'HIPOTECA', 'PRESTAMO_AUTO', 'PRESTAMO_ESTUDIANTIL', 'LINEA_CREDITO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoLogro" AS ENUM ('AHORRO', 'PRESUPUESTO', 'META', 'HABITO', 'INVERSION', 'DEUDA', 'GAMIFICACION');

-- CreateEnum
CREATE TYPE "RarezaLogro" AS ENUM ('COMUN', 'POCO_COMUN', 'RARO', 'EPICO', 'LEGENDARIO');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('INFO', 'ALERTA', 'RECORDATORIO', 'LOGRO', 'SISTEMA', 'PROMOCION');

-- CreateEnum
CREATE TYPE "TipoRecordatorio" AS ENUM ('PAGO', 'META', 'PRESUPUESTO', 'INVERSION', 'DEUDA', 'GENERAL');

-- DropForeignKey
ALTER TABLE "Transaccion" DROP CONSTRAINT "Transaccion_userId_fkey";

-- DropTable
DROP TABLE "Transaccion";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "telefono" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "ocupacion" TEXT,
    "salarioMensual" DOUBLE PRECISION,
    "monedaPrincipal" TEXT NOT NULL DEFAULT 'USD',
    "configuracion" JSONB,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "puntosAcumulados" INTEGER NOT NULL DEFAULT 0,
    "nivel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoCuenta" NOT NULL,
    "banco" TEXT,
    "numeroCuenta" TEXT,
    "saldoInicial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldoActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "color" TEXT DEFAULT '#3B82F6',
    "icono" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "incluirEnBalance" BOOLEAN NOT NULL DEFAULT true,
    "descripcion" TEXT,
    "fechaApertura" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacciones" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoTransaccion" NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,
    "subcategoria" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ubicacion" TEXT,
    "notas" TEXT,
    "etiquetas" TEXT[],
    "montoOriginal" DOUBLE PRECISION,
    "monedaOriginal" TEXT,
    "tasaCambio" DOUBLE PRECISION,
    "comprobante" TEXT,
    "metodoPago" "MetodoPago",
    "esTransferencia" BOOLEAN NOT NULL DEFAULT false,
    "verificada" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "cuentaOrigenId" INTEGER,
    "cuentaDestinoId" INTEGER,
    "transaccionRecurrenteId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacciones_recurrentes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoTransaccion" NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT,
    "frecuencia" "FrecuenciaRecurrencia" NOT NULL,
    "diaEjecucion" INTEGER,
    "diaSemana" INTEGER,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "proximaEjecucion" TIMESTAMP(3) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "ejecutadas" INTEGER NOT NULL DEFAULT 0,
    "configuracion" JSONB,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacciones_recurrentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metas" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoMeta" NOT NULL DEFAULT 'AHORRO',
    "montoObjetivo" DOUBLE PRECISION NOT NULL,
    "montoActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT,
    "prioridad" "PrioridadMeta" NOT NULL DEFAULT 'MEDIA',
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "fechaCompletada" TIMESTAMP(3),
    "progreso" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recordatorios" BOOLEAN NOT NULL DEFAULT true,
    "publica" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presupuestos" (
    "id" SERIAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "limite" DOUBLE PRECISION NOT NULL,
    "gastado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mes" INTEGER NOT NULL,
    "año" INTEGER NOT NULL,
    "alertaEn" DOUBLE PRECISION,
    "notificacionEnviada" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presupuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_personalizadas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "descripcion" TEXT,
    "tipo" "TipoTransaccion" NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_personalizadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inversiones" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoInversion" NOT NULL,
    "simbolo" TEXT,
    "montoInvertido" DOUBLE PRECISION NOT NULL,
    "valorActual" DOUBLE PRECISION,
    "cantidad" DOUBLE PRECISION,
    "fechaCompra" TIMESTAMP(3) NOT NULL,
    "fechaVenta" TIMESTAMP(3),
    "broker" TEXT,
    "comisiones" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dividendos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notas" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inversiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_inversiones" (
    "id" SERIAL NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inversionId" INTEGER NOT NULL,

    CONSTRAINT "historial_inversiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deudas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoDeuda" NOT NULL,
    "montoInicial" DOUBLE PRECISION NOT NULL,
    "montoActual" DOUBLE PRECISION NOT NULL,
    "tasaInteres" DOUBLE PRECISION,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),
    "pagoMinimo" DOUBLE PRECISION,
    "acreedor" TEXT NOT NULL,
    "notas" TEXT,
    "pagada" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deudas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_deudas" (
    "id" SERIAL NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "capital" DOUBLE PRECISION NOT NULL,
    "interes" DOUBLE PRECISION NOT NULL,
    "notas" TEXT,
    "deudaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_deudas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logros" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "tipo" "TipoLogro" NOT NULL,
    "condicion" JSONB NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "rareza" "RarezaLogro" NOT NULL DEFAULT 'COMUN',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_logros" (
    "id" SERIAL NOT NULL,
    "fechaObtenido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progreso" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "userId" INTEGER NOT NULL,
    "logroId" INTEGER NOT NULL,

    CONSTRAINT "user_logros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "datos" JSONB,
    "fechaEnvio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLeida" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recordatorios" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoRecordatorio" NOT NULL,
    "fechaRecordatorio" TIMESTAMP(3) NOT NULL,
    "repetir" BOOLEAN NOT NULL DEFAULT false,
    "frecuencia" TEXT,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recordatorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones_usuario" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "dispositivo" TEXT,
    "ip" TEXT,
    "ubicacion" TEXT,
    "userAgent" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaExpiracion" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesiones_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_acceso" (
    "id" SERIAL NOT NULL,
    "accion" TEXT NOT NULL,
    "ip" TEXT,
    "dispositivo" TEXT,
    "ubicacion" TEXT,
    "userAgent" TEXT,
    "exitoso" BOOLEAN NOT NULL,
    "detalles" JSONB,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_acceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'string',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "transacciones_userId_fecha_idx" ON "transacciones"("userId", "fecha");

-- CreateIndex
CREATE INDEX "transacciones_categoria_idx" ON "transacciones"("categoria");

-- CreateIndex
CREATE INDEX "transacciones_tipo_idx" ON "transacciones"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "presupuestos_userId_categoria_mes_año_key" ON "presupuestos"("userId", "categoria", "mes", "año");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_personalizadas_userId_nombre_key" ON "categorias_personalizadas"("userId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "logros_nombre_key" ON "logros"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "user_logros_userId_logroId_key" ON "user_logros"("userId", "logroId");

-- CreateIndex
CREATE INDEX "notificaciones_userId_leida_idx" ON "notificaciones"("userId", "leida");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_usuario_token_key" ON "sesiones_usuario"("token");

-- CreateIndex
CREATE INDEX "sesiones_usuario_token_idx" ON "sesiones_usuario"("token");

-- CreateIndex
CREATE INDEX "sesiones_usuario_userId_activa_idx" ON "sesiones_usuario"("userId", "activa");

-- CreateIndex
CREATE INDEX "auditoria_acceso_userId_idx" ON "auditoria_acceso"("userId");

-- CreateIndex
CREATE INDEX "auditoria_acceso_createdAt_idx" ON "auditoria_acceso"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sistema_clave_key" ON "configuracion_sistema"("clave");

-- AddForeignKey
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_cuentaOrigenId_fkey" FOREIGN KEY ("cuentaOrigenId") REFERENCES "cuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "cuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_transaccionRecurrenteId_fkey" FOREIGN KEY ("transaccionRecurrenteId") REFERENCES "transacciones_recurrentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones_recurrentes" ADD CONSTRAINT "transacciones_recurrentes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_personalizadas" ADD CONSTRAINT "categorias_personalizadas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inversiones" ADD CONSTRAINT "inversiones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_inversiones" ADD CONSTRAINT "historial_inversiones_inversionId_fkey" FOREIGN KEY ("inversionId") REFERENCES "inversiones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deudas" ADD CONSTRAINT "deudas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_deudas" ADD CONSTRAINT "pagos_deudas_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "deudas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_logros" ADD CONSTRAINT "user_logros_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_logros" ADD CONSTRAINT "user_logros_logroId_fkey" FOREIGN KEY ("logroId") REFERENCES "logros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_usuario" ADD CONSTRAINT "sesiones_usuario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_acceso" ADD CONSTRAINT "auditoria_acceso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
