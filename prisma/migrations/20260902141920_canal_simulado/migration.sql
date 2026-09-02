/*
  Warnings:

  - You are about to drop the column `indiceInicial` on the `StreamConfig` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CanalItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "duracionSegundos" INTEGER NOT NULL DEFAULT 240,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StreamConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "modo" TEXT NOT NULL DEFAULT 'playlist',
    "youtubeId" TEXT,
    "titulo" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_StreamConfig" ("id", "modo", "titulo", "updatedAt", "youtubeId") SELECT "id", "modo", "titulo", "updatedAt", "youtubeId" FROM "StreamConfig";
DROP TABLE "StreamConfig";
ALTER TABLE "new_StreamConfig" RENAME TO "StreamConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CanalItem_orden_idx" ON "CanalItem"("orden");
