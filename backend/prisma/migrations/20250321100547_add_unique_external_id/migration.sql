/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_externalId_key" ON "OrderItem"("externalId");
