/*
  Warnings:

  - You are about to drop the column `uploadedAt` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `author` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `News` table. All the data in the column will be lost.
  - You are about to drop the `NewsTag` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `path` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentHTML` to the `News` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTitle` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_newsId_fkey";

-- DropForeignKey
ALTER TABLE "NewsTag" DROP CONSTRAINT "NewsTag_newsId_fkey";

-- DropForeignKey
ALTER TABLE "NewsTag" DROP CONSTRAINT "NewsTag_tagId_fkey";

-- AlterTable
ALTER TABLE "Image" DROP COLUMN "uploadedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "path" TEXT NOT NULL,
ALTER COLUMN "newsId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "News" DROP COLUMN "author",
DROP COLUMN "date",
ADD COLUMN     "contentHTML" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "homeTitle" TEXT NOT NULL;

-- DropTable
DROP TABLE "NewsTag";

-- CreateTable
CREATE TABLE "_NewsToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_NewsToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_NewsToTag_B_index" ON "_NewsToTag"("B");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsToTag" ADD CONSTRAINT "_NewsToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewsToTag" ADD CONSTRAINT "_NewsToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
