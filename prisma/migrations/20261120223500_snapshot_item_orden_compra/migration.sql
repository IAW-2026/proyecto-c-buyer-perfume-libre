-- AlterTable
ALTER TABLE "ItemOrdenCompra" ADD COLUMN "nombre" TEXT,
ADD COLUMN "marca" TEXT,
ADD COLUMN "imagenUrl" TEXT,
ADD COLUMN "vendedor" TEXT;

-- CreateIndex
CREATE INDEX "ItemOrdenCompra_ordenCompraId_idx" ON "ItemOrdenCompra"("ordenCompraId");
