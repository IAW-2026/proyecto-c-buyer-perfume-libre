/*
  Warnings:

  - Added the required column `demoraDias` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccionId` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operadorEnvio` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicioEnvio` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrdenCompra" ADD COLUMN     "demoraDias" INTEGER NOT NULL,
ADD COLUMN     "direccionId" TEXT NOT NULL,
ADD COLUMN     "operadorEnvio" TEXT NOT NULL,
ADD COLUMN     "servicioEnvio" TEXT NOT NULL;
