-- Sprint 1: recurrentes con cuentas + idempotencia
ALTER TABLE "transacciones" ADD COLUMN IF NOT EXISTS "ocurrenciaRecurrente" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "transacciones_transaccionRecurrenteId_ocurrenciaRecurrente_key"
  ON "transacciones"("transaccionRecurrenteId", "ocurrenciaRecurrente");

ALTER TABLE "transacciones_recurrentes" ADD COLUMN IF NOT EXISTS "cuentaOrigenId" INTEGER;
ALTER TABLE "transacciones_recurrentes" ADD COLUMN IF NOT EXISTS "cuentaDestinoId" INTEGER;
ALTER TABLE "transacciones_recurrentes" ADD COLUMN IF NOT EXISTS "deudaId" INTEGER;

ALTER TABLE "transacciones_recurrentes"
  ADD CONSTRAINT "transacciones_recurrentes_cuentaOrigenId_fkey"
  FOREIGN KEY ("cuentaOrigenId") REFERENCES "cuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transacciones_recurrentes"
  ADD CONSTRAINT "transacciones_recurrentes_cuentaDestinoId_fkey"
  FOREIGN KEY ("cuentaDestinoId") REFERENCES "cuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transacciones_recurrentes"
  ADD CONSTRAINT "transacciones_recurrentes_deudaId_fkey"
  FOREIGN KEY ("deudaId") REFERENCES "deudas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Sprint 2: metas con cuenta origen
ALTER TABLE "metas" ADD COLUMN IF NOT EXISTS "cuentaOrigenId" INTEGER;

ALTER TABLE "metas"
  ADD CONSTRAINT "metas_cuentaOrigenId_fkey"
  FOREIGN KEY ("cuentaOrigenId") REFERENCES "cuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Sprint 3: severidades de notificación
DO $$ BEGIN
  ALTER TYPE "TipoNotificacion" ADD VALUE 'SUCCESS';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "TipoNotificacion" ADD VALUE 'WARNING';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TYPE "TipoNotificacion" ADD VALUE 'ERROR';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sprint 5: refresh tokens
ALTER TABLE "sesiones_usuario" ADD COLUMN IF NOT EXISTS "refreshTokenHash" TEXT;
ALTER TABLE "sesiones_usuario" ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3);
ALTER TABLE "sesiones_usuario" ADD COLUMN IF NOT EXISTS "lastUsedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "sesiones_usuario_refreshTokenHash_key"
  ON "sesiones_usuario"("refreshTokenHash");

CREATE INDEX IF NOT EXISTS "sesiones_usuario_userId_activa_fechaExpiracion_idx"
  ON "sesiones_usuario"("userId", "activa", "fechaExpiracion");
