/*
  Warnings:

  - Renamed the column `content` to `fullText` on the `posts` table.
  - Added optional fields: `caption`, `description`, `externalLinks`

*/
-- Rename content column to fullText and add new optional fields
ALTER TABLE "posts" 
RENAME COLUMN "content" TO "fullText";

-- Add new optional fields
ALTER TABLE "posts" 
ADD COLUMN "caption" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "externalLinks" TEXT;
