-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'USUARIO');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "rol" "Rol" NOT NULL DEFAULT 'USUARIO';
