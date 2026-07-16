-- CreateEnum
CREATE TYPE "EstrategiaAsesor" AS ENUM ('AVALANCHE', 'SNOWBALL');

-- CreateTable
CREATE TABLE "asesor_planes" (
    "id" SERIAL NOT NULL,
    "estrategia" "EstrategiaAsesor" NOT NULL,
    "resumen" TEXT NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "planJson" JSONB NOT NULL,
    "generadoPorIA" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asesor_planes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asesor_planes_userId_createdAt_idx" ON "asesor_planes"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "asesor_planes" ADD CONSTRAINT "asesor_planes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
