-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'Confirmed';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'Pending';
