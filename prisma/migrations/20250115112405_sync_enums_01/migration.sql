/*
  Warnings:

  - The values [faishon,electronics,eomeAppliances,beauty,sports,books,toys,groceries,automotive,furniture] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,processing,confirmed,shipped,delivered,cancelled] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,failed,success] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [buyer,seller] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [accountVerification,passwordReset] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('Faishon', 'Electronics', 'HomeAppliances', 'Beauty', 'Sports', 'Books', 'Toys', 'Groceries', 'Automotive', 'Furniture');
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "Category_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('Pending', 'Failed', 'Success');
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "Order" ALTER COLUMN "paymentStatus" SET DEFAULT 'Pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('Buyer', 'Seller');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('AccountVerification', 'PasswordReset');
ALTER TABLE "Token" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "TokenType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'Pending',
ALTER COLUMN "paymentStatus" SET DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'Buyer';
