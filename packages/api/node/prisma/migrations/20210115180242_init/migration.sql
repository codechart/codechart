-- CreateTable
CREATE TABLE "DiagramMetadata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dirPath" TEXT,
    "positioning" REAL,
    "description" TEXT,
    "type" TEXT,
    "story" TEXT,
    "user" TEXT
);

-- CreateTable
CREATE TABLE "Label" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "diagramMetadataId" INTEGER NOT NULL,
    FOREIGN KEY ("diagramMetadataId") REFERENCES "DiagramMetadata" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "diagramMetadataId" INTEGER NOT NULL,
    FOREIGN KEY ("diagramMetadataId") REFERENCES "DiagramMetadata" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileName" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "diagramMetadataId" INTEGER NOT NULL,
    FOREIGN KEY ("diagramMetadataId") REFERENCES "DiagramMetadata" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
