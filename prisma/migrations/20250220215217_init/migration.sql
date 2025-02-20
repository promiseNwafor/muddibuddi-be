-- CreateEnum
CREATE TYPE "WeatherUnit" AS ENUM ('CELSIUS', 'FAHRENHEIT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "city" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "weatherUnit" "WeatherUnit" NOT NULL DEFAULT 'CELSIUS',
    "shareData" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_entries" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "entryDateTime" TIMESTAMP(3) NOT NULL,
    "moodText" TEXT NOT NULL,
    "moodLabel" TEXT NOT NULL,
    "moodScore" DOUBLE PRECISION NOT NULL,
    "summary" TEXT,
    "city" TEXT,
    "country" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_data" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION,
    "pressure" DOUBLE PRECISION,
    "windSpeed" DOUBLE PRECISION,
    "cloudCover" DOUBLE PRECISION,
    "precipitation" DOUBLE PRECISION,
    "weatherType" TEXT NOT NULL,
    "description" TEXT,
    "feelsLike" DOUBLE PRECISION NOT NULL,
    "moodEntryId" TEXT NOT NULL,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "mood_entries_userId_idx" ON "mood_entries"("userId");

-- CreateIndex
CREATE INDEX "mood_entries_entryDateTime_idx" ON "mood_entries"("entryDateTime");

-- CreateIndex
CREATE UNIQUE INDEX "weather_data_moodEntryId_key" ON "weather_data"("moodEntryId");

-- AddForeignKey
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_data" ADD CONSTRAINT "weather_data_moodEntryId_fkey" FOREIGN KEY ("moodEntryId") REFERENCES "mood_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
