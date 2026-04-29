-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "serviceId" TEXT;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
