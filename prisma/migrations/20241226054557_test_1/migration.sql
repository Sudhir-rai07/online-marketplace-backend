/*
  Warnings:

  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "shippingCharge" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;
