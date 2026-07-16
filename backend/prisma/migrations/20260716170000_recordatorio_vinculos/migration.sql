-- AlterTable
ALTER TABLE "recordatorios" ADD COLUMN "deudaId" INTEGER;
ALTER TABLE "recordatorios" ADD COLUMN "metaId" INTEGER;

-- AddForeignKey
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "deudas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "metas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "recordatorios_deudaId_activo_completado_idx" ON "recordatorios"("deudaId", "activo", "completado");
CREATE INDEX "recordatorios_metaId_activo_completado_idx" ON "recordatorios"("metaId", "activo", "completado");
