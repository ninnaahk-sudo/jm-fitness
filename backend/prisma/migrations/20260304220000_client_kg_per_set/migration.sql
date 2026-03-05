-- AlterTable
ALTER TABLE "TrainingItem" ADD COLUMN "clientSet1Kg" INTEGER;
ALTER TABLE "TrainingItem" ADD COLUMN "clientSet2Kg" INTEGER;
ALTER TABLE "TrainingItem" ADD COLUMN "clientSet3Kg" INTEGER;
ALTER TABLE "TrainingItem" ADD COLUMN "clientSet4Kg" INTEGER;

-- Migrate existing clientKg to clientSet1Kg
UPDATE "TrainingItem" SET "clientSet1Kg" = "clientKg" WHERE "clientKg" IS NOT NULL;

-- AlterTable
ALTER TABLE "TrainingItem" DROP COLUMN "clientKg";
