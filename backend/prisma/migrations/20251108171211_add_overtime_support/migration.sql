-- AlterTable
ALTER TABLE "payslips" ADD COLUMN     "overtimeHours" DECIMAL(8,2) DEFAULT 0,
ADD COLUMN     "overtimePay" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "standardHours" DECIMAL(8,2),
ADD COLUMN     "totalHours" DECIMAL(8,2);

-- AlterTable
ALTER TABLE "salary_structures" ADD COLUMN     "overtimeEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overtimeRate" DECIMAL(10,2),
ADD COLUMN     "standardWorkDaysPerMonth" INTEGER DEFAULT 30,
ADD COLUMN     "standardWorkHoursPerDay" DECIMAL(5,2) DEFAULT 8;
