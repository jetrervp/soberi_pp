-- DropForeignKey
ALTER TABLE "StoreMember" DROP CONSTRAINT "StoreMember_userId_fkey";

-- AddForeignKey
ALTER TABLE "StoreMember" ADD CONSTRAINT "StoreMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
