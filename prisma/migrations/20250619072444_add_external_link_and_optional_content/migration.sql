-- AlterTable
ALTER TABLE "customer_stories" ADD COLUMN     "externalLink" TEXT;

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "fullText" DROP NOT NULL;
