/*
  Warnings:

  - You are about to drop the column `location` on the `users` table. All the data in the column will be lost.
  - Added the required column `feelsLike` to the `weather_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mood_entries" ADD COLUMN "city" TEXT;
ALTER TABLE "mood_entries" ADD COLUMN "country" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "city" TEXT,
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "weatherUnit" TEXT NOT NULL DEFAULT 'CELSIUS',
    "shareData" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_users" ("createdAt", "email", "id", "notificationsEnabled", "password", "shareData", "updatedAt", "username", "weatherUnit") SELECT "createdAt", "email", "id", "notificationsEnabled", "password", "shareData", "updatedAt", "username", "weatherUnit" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE TABLE "new_weather_data" (
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
    "feelsLike" REAL NOT NULL,
    "moodEntryId" TEXT NOT NULL,
    CONSTRAINT "weather_data_moodEntryId_fkey" FOREIGN KEY ("moodEntryId") REFERENCES "mood_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_weather_data" ("cloudCover", "createdAt", "description", "humidity", "id", "moodEntryId", "precipitation", "pressure", "temperature", "weatherType", "windSpeed") SELECT "cloudCover", "createdAt", "description", "humidity", "id", "moodEntryId", "precipitation", "pressure", "temperature", "weatherType", "windSpeed" FROM "weather_data";
DROP TABLE "weather_data";
ALTER TABLE "new_weather_data" RENAME TO "weather_data";
CREATE UNIQUE INDEX "weather_data_moodEntryId_key" ON "weather_data"("moodEntryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
