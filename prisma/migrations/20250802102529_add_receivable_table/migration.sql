-- CreateTable
CREATE TABLE `Receivable` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `occurId` INTEGER NULL,
    `actualId` INTEGER NULL,
    `bookId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `occurDay` VARCHAR(191) NOT NULL,
    `expectDay` VARCHAR(191) NULL,
    `actualDay` VARCHAR(191) NULL,
    `money` DOUBLE NULL,
    `status` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
