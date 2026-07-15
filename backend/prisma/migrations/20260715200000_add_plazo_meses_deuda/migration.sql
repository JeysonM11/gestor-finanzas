-- Additive / nullable: safe for production (existing rows keep NULL; no data rewrite).
-- Interest applies when tasa + plazo are set. Null tipoTasa is treated as MENSUAL in app logic.
CREATE TYPE "TipoTasaInteres" AS ENUM ('MENSUAL', 'ANUAL');
ALTER TABLE "deudas" ADD COLUMN "plazoMeses" INTEGER;
ALTER TABLE "deudas" ADD COLUMN "tipoTasa" "TipoTasaInteres";
