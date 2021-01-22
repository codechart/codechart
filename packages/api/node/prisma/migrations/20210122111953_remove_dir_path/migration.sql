/*
  Warnings:

  - You are about to drop the column `dirPath` on the `DiagramMetadata` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiagramMetadata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "positioning" REAL,
    "description" TEXT,
    "type" TEXT,
    "story" TEXT,
    "user" TEXT
);
INSERT INTO "new_DiagramMetadata" ("id", "createdAt", "updatedAt", "positioning", "description", "type", "story", "user") SELECT "id", "createdAt", "updatedAt", "positioning", "description", "type", "story", "user" FROM "DiagramMetadata";
DROP TABLE "DiagramMetadata";
ALTER TABLE "new_DiagramMetadata" RENAME TO "DiagramMetadata";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
