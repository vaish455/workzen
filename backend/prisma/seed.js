import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Check if test company already exists
  const existingCompany = await prisma.company.findFirst({
    where: { email: 'info@testcorp.com' }
  });

  if (existingCompany) {
    console.log('⚠️  Test company already exists. Cleaning only test company data...');
    
    // Delete only test company's data
    const testEmployees = await prisma.employee.findMany({
      where: { companyId: existingCompany.id },
      select: { id: true }
    });
    
    const employeeIds = testEmployees.map(e => e.id);
    
    if (employeeIds.length > 0) {
      await prisma.payslipComponent.deleteMany({
        where: { payslip: { employeeId: { in: employeeIds } } }
      });
      await prisma.payslip.deleteMany({
        where: { employeeId: { in: employeeIds } }
      });
      await prisma.salaryComponent.deleteMany({
        where: { salaryStructure: { employeeId: { in: employeeIds } } }
      });
      await prisma.salaryStructure.deleteMany({
        where: { employeeId: { in: employeeIds } }
      });
      await prisma.leaveBalance.deleteMany({
        where: { employeeId: { in: employeeIds } }
      });
      await prisma.leave.deleteMany({
        where: { employeeId: { in: employeeIds } }
      });
      await prisma.attendance.deleteMany({
        where: { employeeId: { in: employeeIds } }
      });
      await prisma.employee.deleteMany({
        where: { companyId: existingCompany.id }
      });
      await prisma.user.deleteMany({
        where: { companyId: existingCompany.id }
      });
    }
    
    await prisma.company.delete({
      where: { id: existingCompany.id }
    });
    
    console.log('✅ Test company data cleaned');
  }

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('pass123', 10);

  // Create Test Company
  console.log('🏢 Creating test company...');
  const company = await prisma.company.create({
    data: {
      name: 'TestCorp Solutions (SEED DATA)',
      email: 'info@testcorp.com',
      phone: '+1-555-TEST',
    },
  });

  // Create Admin User
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      loginId: 'testadmin',
      email: 'admin@testcorp.com',
      password: hashedPassword,
      role: 'ADMIN',
      companyId: company.id,
      isActive: true,
    },
  });

  const adminEmployee = await prisma.employee.create({
    data: {
      userId: adminUser.id,
      companyId: company.id,
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@testcorp.com',
      phone: '+1-555-TEST1',
      dateOfBirth: new Date('1985-05-15'),
      residingAddress: '123 Test Street, Test City',
      nationality: 'USA',
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      dateOfJoining: new Date('2020-01-01'),
      employeeCode: 'TESTADM001',
      yearOfJoining: 2020,
      serialNumber: 1,
      accountNumber: '1234567890',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'ABCDE1234F',
      uanNumber: 'UAN001234',
    },
  });

  // Create Payroll Officer User
  console.log('👤 Creating payroll officer...');
  const payrollUser = await prisma.user.create({
    data: {
      loginId: 'testpayroll',
      email: 'payroll@testcorp.com',
      password: hashedPassword,
      role: 'PAYROLL_OFFICER',
      companyId: company.id,
      isActive: true,
    },
  });

  const payrollEmployee = await prisma.employee.create({
    data: {
      userId: payrollUser.id,
      companyId: company.id,
      firstName: 'Test',
      lastName: 'Payroll',
      email: 'payroll@testcorp.com',
      phone: '+1-555-TEST2',
      dateOfBirth: new Date('1988-08-20'),
      residingAddress: '456 Test Avenue, Test City',
      nationality: 'USA',
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
      dateOfJoining: new Date('2021-03-15'),
      employeeCode: 'TESTPAY001',
      yearOfJoining: 2021,
      serialNumber: 2,
    },
  });

  // Scenario 1: Employee with FIXED Monthly Wage (No Overtime)
  console.log('👨‍💼 Creating Employee 1: Fixed Monthly Wage (Standard)...');
  const user1 = await prisma.user.create({
    data: {
      loginId: 'testemp001',
      email: 'alice.johnson@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee1 = await prisma.employee.create({
    data: {
      userId: user1.id,
      companyId: company.id,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@testcorp.com',
      phone: '+1-555-TEST01',
      dateOfBirth: new Date('1992-03-10'),
      residingAddress: '789 Test Lane, Test City',
      nationality: 'USA',
      gender: 'FEMALE',
      maritalStatus: 'MARRIED',
      dateOfJoining: new Date('2022-01-10'),
      employeeCode: 'TESTEMP101',
      yearOfJoining: 2022,
      serialNumber: 3,
      accountNumber: '9876543210',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'ABCDE5678G',
      uanNumber: 'UAN005678',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee1.id,
      wageType: 'FIXED',
      wage: 50000,
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: false,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 50, amount: 25000, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 12500, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 5000, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 10, amount: 5000, order: 4 },
          { name: 'Fixed Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 2500, order: 5 },
        ],
      },
    },
  });

  // Scenario 2: Employee with FIXED Monthly Wage WITH Overtime
  console.log('👨‍💼 Creating Employee 2: Fixed Monthly Wage + Overtime...');
  const user2 = await prisma.user.create({
    data: {
      loginId: 'testemp002',
      email: 'bob.smith@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      userId: user2.id,
      companyId: company.id,
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@testcorp.com',
      phone: '+1-555-TEST02',
      dateOfBirth: new Date('1990-07-22'),
      residingAddress: '321 Test Street, Test City',
      nationality: 'USA',
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      dateOfJoining: new Date('2021-06-15'),
      employeeCode: 'TESTEMP102',
      yearOfJoining: 2021,
      serialNumber: 4,
      accountNumber: '5555666677',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'FGHIJ1234K',
      uanNumber: 'UAN009876',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee2.id,
      wageType: 'FIXED',
      wage: 60000,
      pfRate: 12,
      professionalTax: 200,
      standardWorkHoursPerDay: 8,
      standardWorkDaysPerMonth: 30,
      overtimeEnabled: true,
      overtimeRate: 150, // ₹150 per overtime hour
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 50, amount: 30000, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 15000, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 8000, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 10, amount: 6000, order: 4 },
          { name: 'Fixed Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 1000, order: 5 },
        ],
      },
    },
  });

  // Scenario 3: Employee with HOURLY Wage
  console.log('👨‍💼 Creating Employee 3: Hourly Wage...');
  const user3 = await prisma.user.create({
    data: {
      loginId: 'testemp003',
      email: 'charlie.brown@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee3 = await prisma.employee.create({
    data: {
      userId: user3.id,
      companyId: company.id,
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@testcorp.com',
      phone: '+1-555-TEST03',
      dateOfBirth: new Date('1995-11-30'),
      residingAddress: '654 Test Road, Test City',
      nationality: 'USA',
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      dateOfJoining: new Date('2023-02-01'),
      employeeCode: 'TESTEMP103',
      yearOfJoining: 2023,
      serialNumber: 5,
      accountNumber: '7777888899',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'KLMNO5678P',
      uanNumber: 'UAN012345',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee3.id,
      wageType: 'HOURLY',
      wage: 250, // ₹250 per hour
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: false,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 60, amount: 0, order: 1 },
          { name: 'Hourly Allowance', computationType: 'PERCENTAGE_OF_WAGE', value: 40, amount: 0, order: 2 },
        ],
      },
    },
  });

  // Scenario 4: Part-time Employee with FIXED Wage (Low Hours)
  console.log('👨‍💼 Creating Employee 4: Part-time Fixed Wage...');
  const user4 = await prisma.user.create({
    data: {
      loginId: 'testemp004',
      email: 'diana.wilson@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee4 = await prisma.employee.create({
    data: {
      userId: user4.id,
      companyId: company.id,
      firstName: 'Diana',
      lastName: 'Wilson',
      email: 'diana.wilson@testcorp.com',
      phone: '+1-555-TEST04',
      dateOfBirth: new Date('1998-04-18'),
      residingAddress: '987 Test Plaza, Test City',
      nationality: 'USA',
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
      dateOfJoining: new Date('2023-09-01'),
      employeeCode: 'TESTEMP104',
      yearOfJoining: 2023,
      serialNumber: 6,
      accountNumber: '3333444455',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee4.id,
      wageType: 'FIXED',
      wage: 30000,
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: false,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 50, amount: 15000, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 40, amount: 6000, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 4000, order: 3 },
          { name: 'Fixed Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 5000, order: 4 },
        ],
      },
    },
  });

  // Scenario 5: High Earner with Overtime
  console.log('👨‍💼 Creating Employee 5: Senior Developer with Overtime...');
  const user5 = await prisma.user.create({
    data: {
      loginId: 'testemp005',
      email: 'emily.davis@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee5 = await prisma.employee.create({
    data: {
      userId: user5.id,
      companyId: company.id,
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@testcorp.com',
      phone: '+1-555-TEST05',
      dateOfBirth: new Date('1987-12-05'),
      residingAddress: '111 Test Drive, Test City',
      nationality: 'USA',
      gender: 'FEMALE',
      maritalStatus: 'MARRIED',
      dateOfJoining: new Date('2019-03-20'),
      employeeCode: 'TESTEMP105',
      yearOfJoining: 2019,
      serialNumber: 7,
      accountNumber: '1111222233',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'QRSTU9012V',
      uanNumber: 'UAN098765',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee5.id,
      wageType: 'FIXED',
      wage: 120000,
      pfRate: 12,
      professionalTax: 200,
      standardWorkHoursPerDay: 8,
      standardWorkDaysPerMonth: 30,
      overtimeEnabled: true,
      overtimeRate: 500, // ₹500 per overtime hour
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 40, amount: 48000, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 24000, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 20000, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 15, amount: 18000, order: 4 },
          { name: 'Special Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 10000, order: 5 },
        ],
      },
    },
  });

  // Create Attendance Records for October 2025
  console.log('📅 Creating attendance records for October 2025...');
  const startDate = new Date('2025-10-01');
  const endDate = new Date('2025-10-31');

  const employees = [employee1, employee2, employee3, employee4, employee5];
  
  for (const emp of employees) {
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Skip Sundays (day 0)
      if (dayOfWeek !== 0) {
        let workingHours;
        let status = 'PRESENT';
        
        // Different attendance patterns for different employees
        if (emp.id === employee1.id) {
          // Alice: Regular 8 hours, full attendance
          workingHours = 8;
        } else if (emp.id === employee2.id) {
          // Bob: Works overtime (9-10 hours), full attendance
          workingHours = 9 + Math.random() * 2; // 9-11 hours
        } else if (emp.id === employee3.id) {
          // Charlie: Hourly worker, varies 6-10 hours
          workingHours = 6 + Math.random() * 4;
        } else if (emp.id === employee4.id) {
          // Diana: Part-time, 4-6 hours
          workingHours = 4 + Math.random() * 2;
          // Sometimes absent
          if (Math.random() > 0.8) {
            status = 'ABSENT';
            workingHours = 0;
          }
        } else {
          // Emily: Senior dev with heavy overtime
          workingHours = 9 + Math.random() * 3; // 9-12 hours
        }
        
        const checkInTime = new Date(currentDate);
        checkInTime.setHours(9, 0, 0);
        
        const checkOutTime = new Date(currentDate);
        checkOutTime.setHours(9 + Math.floor(workingHours), Math.floor((workingHours % 1) * 60), 0);
        
        await prisma.attendance.create({
          data: {
            employeeId: emp.id,
            date: new Date(currentDate),
            checkIn: status === 'PRESENT' ? checkInTime : null,
            checkOut: status === 'PRESENT' ? checkOutTime : null,
            status: status,
            workingHours: status === 'PRESENT' ? Math.round(workingHours * 100) / 100 : null,
            remarks: status === 'PRESENT' ? 'Regular work day' : 'Absent',
          },
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Create Leave Balances for all employees
  console.log('🏖️ Creating leave balances...');
  for (const emp of employees) {
    await prisma.leaveBalance.create({
      data: {
        employeeId: emp.id,
        leaveType: 'PAID_TIME_OFF',
        totalDays: 20,
        usedDays: 2,
        remainingDays: 18,
        year: 2025,
      },
    });

    await prisma.leaveBalance.create({
      data: {
        employeeId: emp.id,
        leaveType: 'SICK_LEAVE',
        totalDays: 10,
        usedDays: 1,
        remainingDays: 9,
        year: 2025,
      },
    });
  }

  // Create some approved leaves for Employee 1
  await prisma.leave.create({
    data: {
      employeeId: employee1.id,
      leaveType: 'PAID_TIME_OFF',
      subject: 'Family vacation',
      description: 'Going on a family trip',
      startDate: new Date('2025-10-15'),
      endDate: new Date('2025-10-16'),
      totalDays: 2,
      status: 'APPROVED',
      approvedBy: adminUser.id,
      approvedAt: new Date('2025-10-10'),
    },
  });

  await prisma.leave.create({
    data: {
      employeeId: employee4.id,
      leaveType: 'SICK_LEAVE',
      subject: 'Medical appointment',
      description: 'Doctor visit',
      startDate: new Date('2025-10-20'),
      endDate: new Date('2025-10-20'),
      totalDays: 1,
      status: 'APPROVED',
      approvedBy: adminUser.id,
      approvedAt: new Date('2025-10-18'),
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('─────────────────────────────────────────────────────────');
  console.log('🏢 Test Company: TestCorp Solutions (SEED DATA)');
  console.log('\n👥 Users Created:');
  console.log('   Admin:');
  console.log('   - Login: testadmin | Password: pass123');
  console.log('   - Email: admin@testcorp.com');
  console.log('\n   Payroll Officer:');
  console.log('   - Login: testpayroll | Password: pass123');
  console.log('   - Email: payroll@testcorp.com');
  console.log('\n👨‍💼 Employees:');
  console.log('   1. Alice Johnson (TESTEMP101)');
  console.log('      - Type: FIXED Monthly Wage (No Overtime)');
  console.log('      - Salary: ₹50,000/month');
  console.log('      - Login: testemp001 | Password: pass123');
  console.log('\n   2. Bob Smith (TESTEMP102)');
  console.log('      - Type: FIXED Monthly Wage WITH Overtime');
  console.log('      - Salary: ₹60,000/month + ₹150/hr overtime');
  console.log('      - Standard: 8 hrs/day × 30 days = 240 hrs');
  console.log('      - Login: testemp002 | Password: pass123');
  console.log('\n   3. Charlie Brown (TESTEMP103)');
  console.log('      - Type: HOURLY Wage');
  console.log('      - Rate: ₹250/hour');
  console.log('      - Login: testemp003 | Password: pass123');
  console.log('\n   4. Diana Wilson (TESTEMP104)');
  console.log('      - Type: Part-time FIXED Wage');
  console.log('      - Salary: ₹30,000/month');
  console.log('      - Login: testemp004 | Password: pass123');
  console.log('\n   5. Emily Davis (TESTEMP105)');
  console.log('      - Type: Senior with High Overtime');
  console.log('      - Salary: ₹120,000/month + ₹500/hr overtime');
  console.log('      - Login: testemp005 | Password: pass123');
  console.log('\n📅 Attendance: October 2025 (full month with varied patterns)');
  console.log('🏖️ Leave Balances: Created for all employees');
  console.log('─────────────────────────────────────────────────────────');
  console.log('\n🧪 Test Scenarios:');
  console.log('   ✓ Fixed wage with standard attendance');
  console.log('   ✓ Fixed wage with overtime (>240 hrs)');
  console.log('   ✓ Hourly wage calculation');
  console.log('   ✓ Part-time with irregular attendance');
  console.log('   ✓ High earner with significant overtime');
  console.log('\n🚀 Ready to generate payroll for October 2025!');
  console.log('📝 NOTE: This is a separate test company - your existing data is safe!');
  console.log('─────────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
