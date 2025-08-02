-- CreateTable
CREATE TABLE "public"."Receivable" (
    "id" SERIAL NOT NULL,
    "occurId" INTEGER,
    "actualId" INTEGER,
    "bookId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "occurDay" TEXT NOT NULL,
    "expectDay" TEXT,
    "actualDay" TEXT,
    "money" DOUBLE PRECISION,
    "status" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Receivable_pkey" PRIMARY KEY ("id")
);
