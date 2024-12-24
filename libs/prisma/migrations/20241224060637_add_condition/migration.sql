-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('TIME_OF_DAY', 'WEATHER', 'TEMPERATURE');

-- CreateTable
CREATE TABLE "Condition" (
    "id" SERIAL NOT NULL,
    "type" "ConditionType" NOT NULL,
    "value" TEXT NOT NULL,
    "variation" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
