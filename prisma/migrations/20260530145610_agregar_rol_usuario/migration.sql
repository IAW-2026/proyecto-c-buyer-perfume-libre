-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "rol" "RolUsuario" NOT NULL DEFAULT 'USER';
