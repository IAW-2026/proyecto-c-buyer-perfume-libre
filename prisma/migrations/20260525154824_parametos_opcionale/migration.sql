/*
  Warnings:

  - You are about to drop the column `direccion` on the `Direccion` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `Direccion` table. All the data in the column will be lost.
  - You are about to alter the column `precio` on the `ItemOrdenCompra` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `total` on the `OrdenCompra` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `altura` to the `Direccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calle` to the `Direccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `localidad` to the `Direccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreDestinatario` to the `Direccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provincia` to the `Direccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costoEnvio` to the `OrdenCompra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Direccion" DROP COLUMN "direccion",
DROP COLUMN "numero",
ADD COLUMN     "altura" TEXT NOT NULL,
ADD COLUMN     "calle" TEXT NOT NULL,
ADD COLUMN     "localidad" TEXT NOT NULL,
ADD COLUMN     "nombreDestinatario" TEXT NOT NULL,
ADD COLUMN     "pisoDepto" TEXT,
ADD COLUMN     "provincia" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ItemOrdenCompra" ALTER COLUMN "precio" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "OrdenCompra" ADD COLUMN     "costoEnvio" INTEGER NOT NULL,
ALTER COLUMN "pagoId" DROP NOT NULL,
ALTER COLUMN "envioId" DROP NOT NULL,
ALTER COLUMN "total" SET DATA TYPE INTEGER;
