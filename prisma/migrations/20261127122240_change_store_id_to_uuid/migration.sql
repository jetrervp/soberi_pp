/*
  Warnings:

  - The primary key for the `Brand` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Good` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GoodCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GoodSize` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `News` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Size` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Store` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StoreMember` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Good" DROP CONSTRAINT "Good_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Good" DROP CONSTRAINT "Good_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Good" DROP CONSTRAINT "Good_storeId_fkey";

-- DropForeignKey
ALTER TABLE "GoodCategory" DROP CONSTRAINT "GoodCategory_parentId_fkey";

-- DropForeignKey
ALTER TABLE "GoodSize" DROP CONSTRAINT "GoodSize_goodId_fkey";

-- DropForeignKey
ALTER TABLE "GoodSize" DROP CONSTRAINT "GoodSize_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "StoreMember" DROP CONSTRAINT "StoreMember_storeId_fkey";

-- AlterTable
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Brand_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Brand_id_seq";

-- AlterTable
ALTER TABLE "Good" DROP CONSTRAINT "Good_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "storeId" SET DATA TYPE TEXT,
ALTER COLUMN "categoryId" SET DATA TYPE TEXT,
ALTER COLUMN "brandId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Good_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Good_id_seq";

-- AlterTable
ALTER TABLE "GoodCategory" DROP CONSTRAINT "GoodCategory_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "parentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "GoodCategory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GoodCategory_id_seq";

-- AlterTable
ALTER TABLE "GoodSize" DROP CONSTRAINT "GoodSize_pkey",
ALTER COLUMN "goodId" SET DATA TYPE TEXT,
ALTER COLUMN "sizeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "GoodSize_pkey" PRIMARY KEY ("goodId", "sizeId");

-- AlterTable
ALTER TABLE "News" DROP CONSTRAINT "News_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "News_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "News_id_seq";

-- AlterTable
ALTER TABLE "Size" DROP CONSTRAINT "Size_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Size_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Size_id_seq";

-- AlterTable
ALTER TABLE "Store" DROP CONSTRAINT "Store_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Store_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Store_id_seq";

-- AlterTable
ALTER TABLE "StoreMember" DROP CONSTRAINT "StoreMember_pkey",
ALTER COLUMN "storeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "StoreMember_pkey" PRIMARY KEY ("userId", "storeId");

-- AddForeignKey
ALTER TABLE "StoreMember" ADD CONSTRAINT "StoreMember_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodCategory" ADD CONSTRAINT "GoodCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GoodCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Good" ADD CONSTRAINT "Good_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Good" ADD CONSTRAINT "Good_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GoodCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Good" ADD CONSTRAINT "Good_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodSize" ADD CONSTRAINT "GoodSize_goodId_fkey" FOREIGN KEY ("goodId") REFERENCES "Good"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodSize" ADD CONSTRAINT "GoodSize_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
