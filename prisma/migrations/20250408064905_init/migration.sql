-- CreateTable
CREATE TABLE `SystemSetting` (
    `id` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `keywords` VARCHAR(191) NULL,
    `version` VARCHAR(191) NULL,
    `openRegister` BOOLEAN NOT NULL DEFAULT false,
    `createDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateBy` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `createDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Book` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookId` VARCHAR(191) NOT NULL,
    `bookName` VARCHAR(191) NOT NULL,
    `shareKey` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,
    `budget` DOUBLE NULL,
    `createDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `bookId` VARCHAR(191) NOT NULL,
    `day` VARCHAR(191) NOT NULL,
    `flowType` VARCHAR(191) NULL,
    `industryType` VARCHAR(191) NULL,
    `payType` VARCHAR(191) NULL,
    `money` DOUBLE NULL,
    `name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `invoice` VARCHAR(191) NULL,
    `origin` VARCHAR(191) NULL,
    `attribution` VARCHAR(191) NULL,
    `eliminate` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Budget` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `budget` DOUBLE NULL,
    `used` DOUBLE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FixedFlow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `month` VARCHAR(191) NULL,
    `money` DOUBLE NULL,
    `name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `flowType` VARCHAR(191) NULL,
    `industryType` VARCHAR(191) NULL,
    `payType` VARCHAR(191) NULL,
    `attribution` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TypeRelation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `bookId` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
