/*
  Warnings:

  - You are about to drop the `Plan` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "budget" DOUBLE PRECISION;

-- DropTable
DROP TABLE "Plan";

-- CreateTable
CREATE TABLE "Budget" (
    "id" SERIAL NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" TEXT NOT NULL UNIQUE,
    "budget" DOUBLE PRECISION,
    "used" DOUBLE PRECISION,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedFlow" (
    "id" SERIAL NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" TEXT,
    "money" DOUBLE PRECISION,
    "name" TEXT,
    "description" TEXT,
    "flowType" TEXT,
    "industryType" TEXT,
    "payType" TEXT,
    "attribution" TEXT,

    CONSTRAINT "FixedFlow_pkey" PRIMARY KEY ("id")
);
