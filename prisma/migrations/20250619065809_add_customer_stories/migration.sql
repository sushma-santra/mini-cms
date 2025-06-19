-- CreateTable
CREATE TABLE "customer_stories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caption" TEXT,
    "description" TEXT,
    "mediaGallery" JSONB,
    "stats" JSONB,
    "contentSections" JSONB,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "customer_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CustomerStoryToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_stories_slug_key" ON "customer_stories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_CustomerStoryToTag_AB_unique" ON "_CustomerStoryToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_CustomerStoryToTag_B_index" ON "_CustomerStoryToTag"("B");

-- AddForeignKey
ALTER TABLE "customer_stories" ADD CONSTRAINT "customer_stories_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_stories" ADD CONSTRAINT "customer_stories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerStoryToTag" ADD CONSTRAINT "_CustomerStoryToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "customer_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerStoryToTag" ADD CONSTRAINT "_CustomerStoryToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
