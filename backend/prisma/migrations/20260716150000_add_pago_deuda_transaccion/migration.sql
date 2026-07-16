-- AlterEnum
ALTER TYPE "TipoTransaccion" ADD VALUE 'PAGO_DEUDA';

-- AlterTable
ALTER TABLE "transacciones" ADD COLUMN "deudaId" INTEGER;

-- AlterTable
ALTER TABLE "pagos_deudas" ADD COLUMN "transaccionId" INTEGER;

-- CreateIndex
CREATE INDEX "transacciones_deudaId_idx" ON "transacciones"("deudaId");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_deudas_transaccionId_key" ON "pagos_deudas"("transaccionId");

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "deudas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_deudas" ADD CONSTRAINT "pagos_deudas_transaccionId_fkey" FOREIGN KEY ("transaccionId") REFERENCES "transacciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
