-- AlterTable
ALTER TABLE `CanalItem` ADD COLUMN `seccion` ENUM('RADIO_TV', 'PODCAST') NOT NULL DEFAULT 'RADIO_TV';

-- CreateTable
CREATE TABLE `BloqueHorario` (
    `id` VARCHAR(191) NOT NULL,
    `seccion` ENUM('RADIO_TV', 'PODCAST') NOT NULL,
    `dias` VARCHAR(191) NOT NULL,
    `horaInicioMin` INTEGER NOT NULL,
    `horaFinMin` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `CanalItem_seccion_idx` ON `CanalItem`(`seccion`);
