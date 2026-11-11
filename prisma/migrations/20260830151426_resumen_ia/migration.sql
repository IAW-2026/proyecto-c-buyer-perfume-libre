/*
  Warnings:

  - Changed the type of `estado` on the `OrdenCompra` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('PENDIENTE', 'PAGADO', 'PREPARANDO', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO');

-- AlterTable
ALTER TABLE "OrdenCompra" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoOrden" NOT NULL;

-- CreateTable
CREATE TABLE "ResumenProductoIA" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "resumenProducto" TEXT,
    "resumenVendedor" TEXT,
    "resenasProcesadas" INTEGER NOT NULL DEFAULT 0,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumenProductoIA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumenProductoIA_productoId_key" ON "ResumenProductoIA"("productoId");
