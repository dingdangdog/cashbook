-- CreateTable
CREATE TABLE "Receivable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "occurId" INTEGER,
    "actualId" INTEGER,
    "bookId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "occurDay" TEXT NOT NULL,
    "expectDay" TEXT,
    "actualDay" TEXT,
    "money" REAL,
    "status" INTEGER NOT NULL DEFAULT 0
);
