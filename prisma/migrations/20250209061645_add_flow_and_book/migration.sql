-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "shareKey" TEXT;

-- AlterTable
ALTER TABLE "Flow" ADD COLUMN     "attribution" TEXT,
ADD COLUMN     "eliminate" INTEGER DEFAULT 0,
ADD COLUMN     "origin" TEXT;
