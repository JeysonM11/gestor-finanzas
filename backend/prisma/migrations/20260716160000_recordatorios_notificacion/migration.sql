-- AlterTable
ALTER TABLE "recordatorios" ADD COLUMN "notificacionEnviada" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "recordatorios_userId_activo_completado_idx" ON "recordatorios"("userId", "activo", "completado");

-- CreateIndex
CREATE INDEX "recordatorios_fechaRecordatorio_notificacionEnviada_idx" ON "recordatorios"("fechaRecordatorio", "notificacionEnviada");
