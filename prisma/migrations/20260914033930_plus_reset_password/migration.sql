-- CreateTable
CREATE TABLE `ResetTokenPlus` (
    `id` VARCHAR(191) NOT NULL,
    `suscriptorId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiraEn` DATETIME(3) NOT NULL,
    `usado` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ResetTokenPlus_tokenHash_key`(`tokenHash`),
    INDEX `ResetTokenPlus_suscriptorId_idx`(`suscriptorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ResetTokenPlus` ADD CONSTRAINT `ResetTokenPlus_suscriptorId_fkey` FOREIGN KEY (`suscriptorId`) REFERENCES `Suscriptor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
