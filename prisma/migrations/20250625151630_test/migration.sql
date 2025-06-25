/*
  Warnings:

  - The values [VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION,DIGITAL_PLATFORMS,FAN_DATA_AND_CRM_CONSULTING,MARKETING_AND_COMMUNITY,GAMING_AND_FAN_LOYALTY,MANAGEMENT,VIDEO_PRODUCTION,SPORTS_DATA_SOLUTIONS] on the enum `Industry` will be removed. If these variants are still used in the database, this will fail.
  - The values [TEAM,BROADCASTERS_AND_OTT_PLATFORMS,PUBLISHERS,GAMING_OPERATORS,MARKETING_AND_COMMUNITY,MANAGEMENT,VIDEO_PRODUCTION] on the enum `Solution` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Industry_new" AS ENUM ('LEAGUES_AND_FEDERATIONS', 'TEAM', 'BROADCASTERS_AND_OTT_PLATFORMS', 'PUBLISHERS', 'GAMING_OPERATORS');
ALTER TABLE "customer_stories" ALTER COLUMN "industry" DROP DEFAULT;
ALTER TABLE "customer_stories" ALTER COLUMN "industry" TYPE "Industry_new" USING ("industry"::text::"Industry_new");
ALTER TYPE "Industry" RENAME TO "Industry_old";
ALTER TYPE "Industry_new" RENAME TO "Industry";
DROP TYPE "Industry_old";
ALTER TABLE "customer_stories" ALTER COLUMN "industry" SET DEFAULT 'TEAM';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Solution_new" AS ENUM ('GAMING_AND_FAN_LOYALTY', 'DIGITAL_PLATFORMS', 'VIDEO_TECHNOLOGY_AND_AUTOMATED_CONTENT_CREATION', 'FAN_DATA_AND_CRM_CONSULTING', 'MARKETING_AND_COMMUNITY_MANAGEMENT', 'DESIGN_AND_VIDEO_PRODUCTION', 'SPORTS_DATA_SOLUTIONS');
ALTER TABLE "customer_stories" ALTER COLUMN "solutions" DROP DEFAULT;
ALTER TABLE "customer_stories" ALTER COLUMN "solutions" TYPE "Solution_new"[] USING ("solutions"::text::"Solution_new"[]);
ALTER TYPE "Solution" RENAME TO "Solution_old";
ALTER TYPE "Solution_new" RENAME TO "Solution";
DROP TYPE "Solution_old";
ALTER TABLE "customer_stories" ALTER COLUMN "solutions" SET DEFAULT ARRAY[]::"Solution"[];
COMMIT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "images" JSONB;

-- CreateTable
CREATE TABLE "career_submissions" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "jobTitle" VARCHAR(200),
    "cvFileUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_submissions_pkey" PRIMARY KEY ("id")
);
