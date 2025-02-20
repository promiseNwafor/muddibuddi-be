/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "weatherUnit" TEXT NOT NULL DEFAULT 'CELSIUS',
    "shareData" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "mood_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryDateTime" DATETIME NOT NULL,
    "moodText" TEXT NOT NULL,
    "moodLabel" TEXT NOT NULL,
    "moodScore" REAL NOT NULL,
    "summary" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "mood_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weather_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" REAL NOT NULL,
    "humidity" REAL,
    "pressure" REAL,
    "windSpeed" REAL,
    "cloudCover" REAL,
    "precipitation" REAL,
    "weatherType" TEXT NOT NULL,
    "description" TEXT,
    "moodEntryId" TEXT NOT NULL,
    CONSTRAINT "weather_data_moodEntryId_fkey" FOREIGN KEY ("moodEntryId") REFERENCES "mood_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "mood_entries_userId_idx" ON "mood_entries"("userId");

-- CreateIndex
CREATE INDEX "mood_entries_entryDateTime_idx" ON "mood_entries"("entryDateTime");

-- CreateIndex
CREATE UNIQUE INDEX "weather_data_moodEntryId_key" ON "weather_data"("moodEntryId");
