/*
  Warnings:

  - You are about to drop the column `categoryId` on the `customer_stories` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `customer_stories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `slug` on the `customer_stories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.
  - You are about to alter the column `caption` on the `customer_stories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `seoTitle` on the `customer_stories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(60)`.
  - You are about to alter the column `seoDescription` on the `customer_stories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(160)`.
  - You are about to alter the column `externalLink` on the `customer_stories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.
  - You are about to drop the `_CustomerStoryToTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CustomerStoryToTag" DROP CONSTRAINT "_CustomerStoryToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_CustomerStoryToTag" DROP CONSTRAINT "_CustomerStoryToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "customer_stories" DROP CONSTRAINT "customer_stories_categoryId_fkey";

-- AlterTable
ALTER TABLE "customer_stories" DROP COLUMN "categoryId",
ADD COLUMN     "clientLogos" JSONB,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(250),
ALTER COLUMN "caption" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "seoTitle" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "seoDescription" SET DATA TYPE VARCHAR(160),
ALTER COLUMN "externalLink" SET DATA TYPE VARCHAR(2048);

-- DropTable
DROP TABLE "_CustomerStoryToTag";

-- CreateIndex
CREATE INDEX "customer_stories_status_idx" ON "customer_stories"("status");

-- CreateIndex
CREATE INDEX "customer_stories_industry_idx" ON "customer_stories"("industry");

-- CreateIndex
CREATE INDEX "customer_stories_publishedAt_idx" ON "customer_stories"("publishedAt");
