-- Permite presupuestar tanto ingresos esperados como límites de gasto.
CREATE TYPE "TipoPresupuesto" AS ENUM ('INGRESO', 'GASTO');

ALTER TABLE "presupuestos"
ADD COLUMN "tipo" "TipoPresupuesto" NOT NULL DEFAULT 'GASTO';

-- Migra las categorías de ingreso más comunes creadas antes de existir el tipo.
UPDATE "presupuestos"
SET "tipo" = 'INGRESO'
WHERE LOWER(TRIM("categoria")) IN (
  'salario',
  'sueldo',
  'nómina',
  'nomina',
  'ingreso',
  'ingresos'
);

-- Confirma de inmediato los ingresos históricos del mismo mes y categoría.
UPDATE "presupuestos" AS p
SET "gastado" = COALESCE((
  SELECT SUM(t."monto")
  FROM "transacciones" AS t
  WHERE t."userId" = p."userId"
    AND t."tipo" = 'INGRESO'
    AND t."categoria" = p."categoria"
    AND EXTRACT(MONTH FROM t."fecha" AT TIME ZONE 'UTC') = p."mes"
    AND EXTRACT(YEAR FROM t."fecha" AT TIME ZONE 'UTC') = p."año"
), 0)
WHERE p."tipo" = 'INGRESO';

DROP INDEX "presupuestos_userId_categoria_mes_año_key";

CREATE UNIQUE INDEX "presupuestos_userId_categoria_tipo_mes_año_key"
ON "presupuestos"("userId", "categoria", "tipo", "mes", "año");
