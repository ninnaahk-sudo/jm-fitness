-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientUserId" INTEGER NOT NULL,
    "trainerId" INTEGER NOT NULL,
    CONSTRAINT "ClientProfile_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClientProfile_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "ExerciseVideo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "exerciseId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    CONSTRAINT "ExerciseVideo_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientProfileId" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    CONSTRAINT "TrainingDay_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trainingDayId" INTEGER NOT NULL,
    "exerciseId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "set1Kg" INTEGER,
    "set2Kg" INTEGER,
    "set3Kg" INTEGER,
    CONSTRAINT "TrainingItem_trainingDayId_fkey" FOREIGN KEY ("trainingDayId") REFERENCES "TrainingDay" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingItem_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_clientUserId_key" ON "ClientProfile"("clientUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingDay_clientProfileId_dayNumber_key" ON "TrainingDay"("clientProfileId", "dayNumber");
