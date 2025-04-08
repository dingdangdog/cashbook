-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "version" TEXT,
    "openRegister" BOOLEAN NOT NULL DEFAULT false,
    "createDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateBy" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "createDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" TEXT NOT NULL,
    "bookName" TEXT NOT NULL,
    "shareKey" TEXT,
    "userId" INTEGER NOT NULL,
    "budget" REAL,
    "createDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Flow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "flowType" TEXT,
    "industryType" TEXT,
    "payType" TEXT,
    "money" REAL,
    "name" TEXT,
    "description" TEXT,
    "invoice" TEXT,
    "origin" TEXT,
    "attribution" TEXT,
    "eliminate" INTEGER DEFAULT 0
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "budget" REAL,
    "used" REAL
);

-- CreateTable
CREATE TABLE "FixedFlow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" TEXT,
    "money" REAL,
    "name" TEXT,
    "description" TEXT,
    "flowType" TEXT,
    "industryType" TEXT,
    "payType" TEXT,
    "attribution" TEXT
);

-- CreateTable
CREATE TABLE "TypeRelation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL
);
