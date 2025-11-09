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
      name: 'TestCorp Solutions',
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
      accountNumber: '9988776655',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'PQRST5678U',
      uanNumber: 'UAN056789',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: payrollEmployee.id,
      wageType: 'FIXED',
      wage: 70000,
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: false,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 50, amount: 35000, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 17500, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 10000, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 10, amount: 7000, order: 4 },
        ],
      },
    },
  });

  // Create HR Officer User
  console.log('👤 Creating HR officer...');
  const hrUser = await prisma.user.create({
    data: {
      loginId: 'testhr',
      email: 'hr@testcorp.com',
      password: hashedPassword,
      role: 'HR_OFFICER',
      companyId: company.id,
      isActive: true,
    },
  });

  const hrEmployee = await prisma.employee.create({
    data: {
      userId: hrUser.id,
      companyId: company.id,
      firstName: 'Test',
      lastName: 'HR',
      email: 'hr@testcorp.com',
      phone: '+1-555-TEST3',
      dateOfBirth: new Date('1990-12-10'),
      residingAddress: '789 Test Boulevard, Test City',
      nationality: 'USA',
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      dateOfJoining: new Date('2020-06-01'),
      employeeCode: 'TESTHR001',
      yearOfJoining: 2020,
      serialNumber: 3,
      accountNumber: '1122334455',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'VWXYZ9012A',
      uanNumber: 'UAN067890',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: hrEmployee.id,
      wageType: 'FIXED',
      wage: 65000,
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: false,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 50, amount: 32500, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 16250, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 9500, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 10, amount: 6500, order: 4 },
        ],
      },
    },
  });

  // Scenario 1: Employee with FIXED Monthly Wage (No Overtime) - FEMALE, MARRIED
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
      serialNumber: 4,
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
      serialNumber: 5,
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
      serialNumber: 6,
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
      serialNumber: 7,
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
      serialNumber: 8,
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

  // Create MORE EMPLOYEES for comprehensive testing
  console.log('👨‍💼 Creating additional employees for comprehensive scenarios...');
  
  // Employee 6 - Will be HALF_DAY today
  const user6 = await prisma.user.create({
    data: {
      loginId: 'testemp006',
      email: 'frank.miller@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee6 = await prisma.employee.create({
    data: {
      userId: user6.id,
      companyId: company.id,
      firstName: 'Frank',
      lastName: 'Miller',
      email: 'frank.miller@testcorp.com',
      phone: '+1-555-TEST06',
      dateOfBirth: new Date('1993-06-12'),
      residingAddress: '222 Test Boulevard, Test City',
      nationality: 'USA',
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      dateOfJoining: new Date('2022-05-10'),
      employeeCode: 'TESTEMP106',
      yearOfJoining: 2022,
      serialNumber: 9,
      accountNumber: '4444555566',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'WXYZ1234A',
      uanNumber: 'UAN054321',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee6.id,
      wageType: 'FIXED',
      wage: 45000,
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: false,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 50, amount: 22500, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 11250, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 6250, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 10, amount: 4500, order: 4 },
        ],
      },
    },
  });

  // Employee 7 - Will be on SICK LEAVE today
  const user7 = await prisma.user.create({
    data: {
      loginId: 'testemp007',
      email: 'grace.lee@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee7 = await prisma.employee.create({
    data: {
      userId: user7.id,
      companyId: company.id,
      firstName: 'Grace',
      lastName: 'Lee',
      email: 'grace.lee@testcorp.com',
      phone: '+1-555-TEST07',
      dateOfBirth: new Date('1991-09-25'),
      residingAddress: '333 Test Circle, Test City',
      nationality: 'USA',
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
      dateOfJoining: new Date('2021-11-01'),
      employeeCode: 'TESTEMP107',
      yearOfJoining: 2021,
      serialNumber: 10,
      accountNumber: '6666777788',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'BCDE5678H',
      uanNumber: 'UAN067890',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee7.id,
      wageType: 'FIXED',
      wage: 55000,
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: false,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 50, amount: 27500, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 13750, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 7500, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 10, amount: 5500, order: 4 },
        ],
      },
    },
  });

  // Employee 8 - Will NOT be checked in today (no attendance record at all)
  const user8 = await prisma.user.create({
    data: {
      loginId: 'testemp008',
      email: 'henry.wilson@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee8 = await prisma.employee.create({
    data: {
      userId: user8.id,
      companyId: company.id,
      firstName: 'Henry',
      lastName: 'Wilson',
      email: 'henry.wilson@testcorp.com',
      phone: '+1-555-TEST08',
      dateOfBirth: new Date('1994-02-14'),
      residingAddress: '444 Test Park, Test City',
      nationality: 'USA',
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      dateOfJoining: new Date('2023-03-20'),
      employeeCode: 'TESTEMP108',
      yearOfJoining: 2023,
      serialNumber: 11,
      accountNumber: '8888999900',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'FGHI9012J',
      uanNumber: 'UAN078901',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee8.id,
      wageType: 'FIXED',
      wage: 42000,
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: false,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 50, amount: 21000, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 10500, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 5500, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 10, amount: 4200, order: 4 },
        ],
      },
    },
  });

  // Employee 9 - Early checkout employee
  const user9 = await prisma.user.create({
    data: {
      loginId: 'testemp009',
      email: 'iris.chen@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee9 = await prisma.employee.create({
    data: {
      userId: user9.id,
      companyId: company.id,
      firstName: 'Iris',
      lastName: 'Chen',
      email: 'iris.chen@testcorp.com',
      phone: '+1-555-TEST09',
      dateOfBirth: new Date('1996-11-08'),
      residingAddress: '555 Test Gardens, Test City',
      nationality: 'USA',
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
      dateOfJoining: new Date('2023-07-01'),
      employeeCode: 'TESTEMP109',
      yearOfJoining: 2023,
      serialNumber: 12,
      accountNumber: '1010202030',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'JKLM3456N',
      uanNumber: 'UAN089012',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee9.id,
      wageType: 'HOURLY',
      wage: 300,
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

  // Employee 10 - Remote worker with unpaid leave today
  const user10 = await prisma.user.create({
    data: {
      loginId: 'testemp010',
      email: 'jack.taylor@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee10 = await prisma.employee.create({
    data: {
      userId: user10.id,
      companyId: company.id,
      firstName: 'Jack',
      lastName: 'Taylor',
      email: 'jack.taylor@testcorp.com',
      phone: '+1-555-TEST10',
      dateOfBirth: new Date('1989-04-30'),
      residingAddress: '666 Test Heights, Test City',
      nationality: 'USA',
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      dateOfJoining: new Date('2020-08-15'),
      employeeCode: 'TESTEMP110',
      yearOfJoining: 2020,
      serialNumber: 13,
      accountNumber: '2020304050',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'NOPQ7890R',
      uanNumber: 'UAN090123',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee10.id,
      wageType: 'FIXED',
      wage: 75000,
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: true,
      standardWorkHoursPerDay: 8,
      standardWorkDaysPerMonth: 30,
      overtimeRate: 300,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 40, amount: 30000, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 15000, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 15000, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 15, amount: 11250, order: 4 },
          { name: 'Remote Work Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 3750, order: 5 },
        ],
      },
    },
  });

  // Employee 11 - DIVORCED status, OTHER gender, inactive user
  const user11 = await prisma.user.create({
    data: {
      loginId: 'testemp011',
      email: 'kim.rodriguez@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: false, // INACTIVE USER
    },
  });

  const employee11 = await prisma.employee.create({
    data: {
      userId: user11.id,
      companyId: company.id,
      firstName: 'Kim',
      lastName: 'Rodriguez',
      email: 'kim.rodriguez@testcorp.com',
      phone: '+1-555-TEST11',
      dateOfBirth: new Date('1992-07-18'),
      residingAddress: '777 Test Valley, Test City',
      nationality: 'USA',
      gender: 'OTHER',
      maritalStatus: 'DIVORCED',
      dateOfJoining: new Date('2021-09-01'),
      employeeCode: 'TESTEMP111',
      yearOfJoining: 2021,
      serialNumber: 14,
      accountNumber: '3030405060',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'STUV1234W',
      uanNumber: 'UAN091234',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee11.id,
      wageType: 'FIXED',
      wage: 52000,
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: false,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 50, amount: 26000, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 13000, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 7000, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 10, amount: 5200, order: 4 },
        ],
      },
    },
  });

  // Employee 12 - WIDOWED status, MALE, with all bank details
  const user12 = await prisma.user.create({
    data: {
      loginId: 'testemp012',
      email: 'samuel.martin@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee12 = await prisma.employee.create({
    data: {
      userId: user12.id,
      companyId: company.id,
      firstName: 'Samuel',
      lastName: 'Martin',
      email: 'samuel.martin@testcorp.com',
      phone: '+1-555-TEST12',
      dateOfBirth: new Date('1980-03-22'),
      residingAddress: '888 Test Ridge, Test City',
      nationality: 'USA',
      personalEmail: 'samuel.personal@email.com',
      gender: 'MALE',
      maritalStatus: 'WIDOWED',
      dateOfJoining: new Date('2019-01-15'),
      employeeCode: 'TESTEMP112',
      yearOfJoining: 2019,
      serialNumber: 15,
      accountNumber: '4040506070',
      bankName: 'Test Credit Union',
      ifscCode: 'TEST0005678',
      panNumber: 'WXYZ5678Y',
      uanNumber: 'UAN092345',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee12.id,
      wageType: 'FIXED',
      wage: 85000,
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: true,
      standardWorkHoursPerDay: 8,
      standardWorkDaysPerMonth: 30,
      overtimeRate: 350,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 45, amount: 38250, order: 1 },
          { name: 'House Rent Allowance', computationType: 'PERCENTAGE_OF_BASIC', value: 50, amount: 19125, order: 2 },
          { name: 'Standard Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 16000, order: 3 },
          { name: 'Performance Bonus', computationType: 'PERCENTAGE_OF_WAGE', value: 12, amount: 10200, order: 4 },
          { name: 'Senior Allowance', computationType: 'FIXED_AMOUNT', value: 0, amount: 1425, order: 5 },
        ],
      },
    },
  });

  // Employee 13 - Hourly worker with different rate, FEMALE, SINGLE
  const user13 = await prisma.user.create({
    data: {
      loginId: 'testemp013',
      email: 'lisa.anderson@testcorp.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      companyId: company.id,
      isActive: true,
    },
  });

  const employee13 = await prisma.employee.create({
    data: {
      userId: user13.id,
      companyId: company.id,
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.anderson@testcorp.com',
      phone: '+1-555-TEST13',
      dateOfBirth: new Date('1997-09-05'),
      residingAddress: '999 Test Meadow, Test City',
      nationality: 'USA',
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
      dateOfJoining: new Date('2024-02-01'),
      employeeCode: 'TESTEMP113',
      yearOfJoining: 2024,
      serialNumber: 16,
      accountNumber: '5050607080',
      bankName: 'Test Bank',
      ifscCode: 'TEST0001234',
      panNumber: 'ZABC9012D',
      uanNumber: 'UAN093456',
    },
  });

  await prisma.salaryStructure.create({
    data: {
      employeeId: employee13.id,
      wageType: 'HOURLY',
      wage: 350, // Higher hourly rate
      pfRate: 12,
      professionalTax: 200,
      overtimeEnabled: false,
      components: {
        create: [
          { name: 'Basic', computationType: 'PERCENTAGE_OF_WAGE', value: 65, amount: 0, order: 1 },
          { name: 'Hourly Allowance', computationType: 'PERCENTAGE_OF_WAGE', value: 35, amount: 0, order: 2 },
        ],
      },
    },
  });

  // Create Attendance Records for October 2025
  console.log('📅 Creating attendance records for October 2025...');
  const startDate = new Date('2025-10-01');
  const endDate = new Date('2025-10-31');

  const allEmployees = [employee1, employee2, employee3, employee4, employee5, employee6, employee7, employee8, employee9, employee10, employee11, employee12, employee13];
  
  for (const emp of allEmployees) {
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Skip Sundays (day 0)
      if (dayOfWeek !== 0) {
        let workingHours;
        let status = 'PRESENT';
        let remarks = 'Regular work day';
        
        // Different attendance patterns for different employees
        if (emp.id === employee1.id) {
          // Alice: Regular 8 hours, full attendance, very consistent
          workingHours = 8;
        } else if (emp.id === employee2.id) {
          // Bob: Works overtime (9-11 hours), full attendance
          workingHours = 9 + Math.random() * 2;
        } else if (emp.id === employee3.id) {
          // Charlie: Hourly worker, varies 6-10 hours, sometimes absent
          if (Math.random() > 0.85) {
            status = 'ABSENT';
            workingHours = 0;
            remarks = 'Absent';
          } else {
            workingHours = 6 + Math.random() * 4;
          }
        } else if (emp.id === employee4.id) {
          // Diana: Part-time, 4-6 hours, frequently absent
          workingHours = 4 + Math.random() * 2;
          if (Math.random() > 0.75) {
            status = 'ABSENT';
            workingHours = 0;
            remarks = 'Absent';
          }
        } else if (emp.id === employee5.id) {
          // Emily: Senior dev with heavy overtime
          workingHours = 9 + Math.random() * 3; // 9-12 hours
        } else if (emp.id === employee6.id) {
          // Frank: Occasionally half days
          if (Math.random() > 0.9) {
            status = 'HALF_DAY';
            workingHours = 4;
            remarks = 'Half day';
          } else {
            workingHours = 8;
          }
        } else if (emp.id === employee7.id) {
          // Grace: Sometimes on leave
          if (Math.random() > 0.92) {
            status = 'ON_LEAVE';
            workingHours = 0;
            remarks = 'On leave';
          } else {
            workingHours = 8;
          }
        } else if (emp.id === employee8.id) {
          // Henry: Newer employee, some absences
          if (Math.random() > 0.88) {
            status = 'ABSENT';
            workingHours = 0;
            remarks = 'Absent';
          } else {
            workingHours = 8;
          }
        } else if (emp.id === employee9.id) {
          // Iris: Hourly, varies hours
          workingHours = 5 + Math.random() * 4; // 5-9 hours
        } else if (emp.id === employee10.id) {
          // Jack: Remote, consistent
          workingHours = 8 + Math.random() * 2; // 8-10 hours
        } else if (emp.id === employee11.id) {
          // Kim: Inactive user, but had some attendance (now inactive)
          workingHours = 8;
        } else if (emp.id === employee12.id) {
          // Samuel: Senior, very consistent
          workingHours = 8;
        } else if (emp.id === employee13.id) {
          // Lisa: Hourly, high performer
          workingHours = 7 + Math.random() * 3; // 7-10 hours
        }
        
        const checkInTime = new Date(currentDate);
        checkInTime.setHours(9, 0, 0);
        
        const checkOutTime = new Date(currentDate);
        checkOutTime.setHours(9 + Math.floor(workingHours), Math.floor((workingHours % 1) * 60), 0);
        
        await prisma.attendance.create({
          data: {
            employeeId: emp.id,
            date: new Date(currentDate),
            checkIn: status === 'PRESENT' || status === 'HALF_DAY' ? checkInTime : null,
            checkOut: status === 'PRESENT' || status === 'HALF_DAY' ? checkOutTime : null,
            status: status,
            workingHours: (status === 'PRESENT' || status === 'HALF_DAY') ? Math.round(workingHours * 100) / 100 : null,
            remarks: remarks,
          },
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // Create TODAY's attendance with various statuses for testing
  console.log('📅 Creating today\'s attendance data with ALL possible statuses...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Employee 1 (Alice) - PRESENT: Fully checked in and out
  const alice_checkIn = new Date();
  alice_checkIn.setHours(8, 45, 0, 0);
  const alice_checkOut = new Date();
  alice_checkOut.setHours(17, 30, 0, 0);
  await prisma.attendance.create({
    data: {
      employeeId: employee1.id,
      date: today,
      checkIn: alice_checkIn,
      checkOut: alice_checkOut,
      status: 'PRESENT',
      workingHours: 8.75,
      remarks: 'Full day work - completed',
    },
  });

  // Employee 2 (Bob) - PRESENT: Checked in but NOT checked out yet (still working)
  const bob_checkIn = new Date();
  bob_checkIn.setHours(8, 30, 0, 0);
  await prisma.attendance.create({
    data: {
      employeeId: employee2.id,
      date: today,
      checkIn: bob_checkIn,
      checkOut: null,
      status: 'PRESENT',
      workingHours: null,
      remarks: 'Currently working - not checked out yet',
    },
  });

  // Employee 3 (Charlie) - ABSENT: Marked absent
  await prisma.attendance.create({
    data: {
      employeeId: employee3.id,
      date: today,
      checkIn: null,
      checkOut: null,
      status: 'ABSENT',
      workingHours: null,
      remarks: 'Absent without notice',
    },
  });

  // Employee 4 (Diana) - ON_LEAVE: Approved PTO
  await prisma.leave.create({
    data: {
      employeeId: employee4.id,
      leaveType: 'PAID_TIME_OFF',
      subject: 'Personal Work',
      description: 'Need to attend to personal matters',
      startDate: today,
      endDate: today,
      totalDays: 1,
      status: 'APPROVED',
      approvedBy: adminUser.id,
      approvedAt: new Date(Date.now() - 86400000), // Approved yesterday
    },
  });
  await prisma.attendance.create({
    data: {
      employeeId: employee4.id,
      date: today,
      checkIn: null,
      checkOut: null,
      status: 'ON_LEAVE',
      workingHours: null,
      remarks: 'On Approved Paid Time Off',
    },
  });

  // Employee 5 (Emily) - PRESENT: Late arrival with overtime
  const emily_checkIn = new Date();
  emily_checkIn.setHours(10, 15, 0, 0);
  const emily_checkOut = new Date();
  emily_checkOut.setHours(19, 30, 0, 0);
  await prisma.attendance.create({
    data: {
      employeeId: employee5.id,
      date: today,
      checkIn: emily_checkIn,
      checkOut: emily_checkOut,
      status: 'PRESENT',
      workingHours: 9.25,
      remarks: 'Late arrival (10:15 AM) - Working overtime to compensate',
    },
  });

  // Employee 6 (Frank) - HALF_DAY: Medical appointment in afternoon
  const frank_checkIn = new Date();
  frank_checkIn.setHours(9, 0, 0, 0);
  const frank_checkOut = new Date();
  frank_checkOut.setHours(13, 0, 0, 0);
  await prisma.attendance.create({
    data: {
      employeeId: employee6.id,
      date: today,
      checkIn: frank_checkIn,
      checkOut: frank_checkOut,
      status: 'HALF_DAY',
      workingHours: 4.0,
      remarks: 'Half day - Medical appointment in afternoon',
    },
  });

  // Employee 7 (Grace) - ON_LEAVE: Sick leave
  await prisma.leave.create({
    data: {
      employeeId: employee7.id,
      leaveType: 'SICK_LEAVE',
      subject: 'Flu',
      description: 'Not feeling well, need rest',
      startDate: today,
      endDate: today,
      totalDays: 1,
      status: 'APPROVED',
      approvedBy: adminUser.id,
      approvedAt: new Date(Date.now() - 3600000), // Approved 1 hour ago
    },
  });
  await prisma.attendance.create({
    data: {
      employeeId: employee7.id,
      date: today,
      checkIn: null,
      checkOut: null,
      status: 'ON_LEAVE',
      workingHours: null,
      remarks: 'On Sick Leave - Flu symptoms',
    },
  });

  // Employee 8 (Henry) - NO RECORD: Not checked in yet (will show as not checked in)
  // Intentionally no attendance record created

  // Employee 9 (Iris) - PRESENT: Early checkout
  const iris_checkIn = new Date();
  iris_checkIn.setHours(8, 0, 0, 0);
  const iris_checkOut = new Date();
  iris_checkOut.setHours(15, 30, 0, 0);
  await prisma.attendance.create({
    data: {
      employeeId: employee9.id,
      date: today,
      checkIn: iris_checkIn,
      checkOut: iris_checkOut,
      status: 'PRESENT',
      workingHours: 7.5,
      remarks: 'Early checkout - Personal emergency approved by manager',
    },
  });

  // Employee 10 (Jack) - ON_LEAVE: Unpaid leave
  await prisma.leave.create({
    data: {
      employeeId: employee10.id,
      leaveType: 'UNPAID_LEAVE',
      subject: 'Extended Family Trip',
      description: 'Family vacation abroad',
      startDate: today,
      endDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 3 days
      totalDays: 3,
      status: 'APPROVED',
      approvedBy: adminUser.id,
      approvedAt: new Date(Date.now() - 7 * 86400000), // Approved 7 days ago
    },
  });
  await prisma.attendance.create({
    data: {
      employeeId: employee10.id,
      date: today,
      checkIn: null,
      checkOut: null,
      status: 'ON_LEAVE',
      workingHours: null,
      remarks: 'On Unpaid Leave - Extended vacation',
    },
  });

  // Create Leave Balances for all employees
  console.log('🏖️ Creating leave balances...');
  for (const emp of allEmployees) {
    await prisma.leaveBalance.create({
      data: {
        employeeId: emp.id,
        leaveType: 'PAID_TIME_OFF',
        totalDays: 20,
        usedDays: Math.floor(Math.random() * 5) + 1, // 1-5 days used
        remainingDays: 20 - (Math.floor(Math.random() * 5) + 1),
        year: 2025,
      },
    });

    await prisma.leaveBalance.create({
      data: {
        employeeId: emp.id,
        leaveType: 'SICK_LEAVE',
        totalDays: 10,
        usedDays: Math.floor(Math.random() * 3), // 0-2 days used
        remainingDays: 10 - Math.floor(Math.random() * 3),
        year: 2025,
      },
    });

    await prisma.leaveBalance.create({
      data: {
        employeeId: emp.id,
        leaveType: 'UNPAID_LEAVE',
        totalDays: 0,
        usedDays: 0,
        remainingDays: 0,
        year: 2025,
      },
    });
  }

  // Create various leave requests with different statuses
  console.log('📝 Creating diverse leave requests...');
  
  // Historical approved leaves for Employee 1
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

  // Sick leave for Employee 4
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

  // PENDING leave request for tomorrow (Employee 3)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  await prisma.leave.create({
    data: {
      employeeId: employee3.id,
      leaveType: 'PAID_TIME_OFF',
      subject: 'Family Event',
      description: 'Attending family function',
      startDate: tomorrow,
      endDate: tomorrow,
      totalDays: 1,
      status: 'PENDING',
    },
  });

  // PENDING leave request for next week (Employee 8)
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  await prisma.leave.create({
    data: {
      employeeId: employee8.id,
      leaveType: 'PAID_TIME_OFF',
      subject: 'Personal Day',
      description: 'Need time off for personal matters',
      startDate: nextWeek,
      endDate: nextWeek,
      totalDays: 1,
      status: 'PENDING',
    },
  });

  // REJECTED leave request (Employee 2)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  await prisma.leave.create({
    data: {
      employeeId: employee2.id,
      leaveType: 'PAID_TIME_OFF',
      subject: 'Personal Day',
      description: 'Need a day off',
      startDate: yesterday,
      endDate: yesterday,
      totalDays: 1,
      status: 'REJECTED',
      approvedBy: adminUser.id,
      approvedAt: new Date(Date.now() - 172800000), // 2 days ago
    },
  });

  // CANCELLED leave request (Employee 9)
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + 10);
  await prisma.leave.create({
    data: {
      employeeId: employee9.id,
      leaveType: 'PAID_TIME_OFF',
      subject: 'Trip',
      description: 'Planned trip cancelled',
      startDate: futureDate,
      endDate: new Date(futureDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      totalDays: 3,
      status: 'CANCELLED',
    },
  });

  // Multi-day approved leave (Employee 5)
  await prisma.leave.create({
    data: {
      employeeId: employee5.id,
      leaveType: 'PAID_TIME_OFF',
      subject: 'Annual Leave',
      description: 'Yearly vacation time',
      startDate: new Date('2025-10-25'),
      endDate: new Date('2025-10-27'),
      totalDays: 3,
      status: 'APPROVED',
      approvedBy: adminUser.id,
      approvedAt: new Date('2025-10-15'),
    },
  });

  // Create PAYSLIPS with various statuses (DRAFT, DONE, CANCELLED)
  console.log('💰 Creating payslips for October 2025...');
  
  const octStart = new Date('2025-10-01');
  const octEnd = new Date('2025-10-31');
  
  // DONE Payslip for Employee 1 (Alice)
  await prisma.payslip.create({
    data: {
      employeeId: employee1.id,
      payPeriod: 'Oct 2025',
      periodStart: octStart,
      periodEnd: octEnd,
      workingDays: 26,
      workedDays: 26,
      paidLeaveDays: 2,
      unpaidLeaveDays: 0,
      totalHours: 208,
      standardHours: 208,
      overtimeHours: 0,
      overtimePay: 0,
      basicWage: 25000,
      grossWage: 50000,
      totalDeductions: 6200,
      netWage: 43800,
      employeeCost: 50000,
      status: 'DONE',
      validatedAt: new Date('2025-11-01'),
      components: {
        create: [
          { name: 'Basic', ratePercent: 50, amount: 25000, isDeduction: false, order: 1 },
          { name: 'HRA', ratePercent: 25, amount: 12500, isDeduction: false, order: 2 },
          { name: 'Standard Allowance', ratePercent: 10, amount: 5000, isDeduction: false, order: 3 },
          { name: 'Performance Bonus', ratePercent: 10, amount: 5000, isDeduction: false, order: 4 },
          { name: 'Fixed Allowance', ratePercent: 5, amount: 2500, isDeduction: false, order: 5 },
          { name: 'PF (Employee)', ratePercent: 12, amount: 3000, isDeduction: true, order: 6 },
          { name: 'PF (Employer)', ratePercent: 12, amount: 3000, isDeduction: true, order: 7 },
          { name: 'Professional Tax', ratePercent: 0.4, amount: 200, isDeduction: true, order: 8 },
        ],
      },
    },
  });

  // DRAFT Payslip for Employee 2 (Bob) - with overtime
  await prisma.payslip.create({
    data: {
      employeeId: employee2.id,
      payPeriod: 'Oct 2025',
      periodStart: octStart,
      periodEnd: octEnd,
      workingDays: 26,
      workedDays: 26,
      paidLeaveDays: 0,
      unpaidLeaveDays: 0,
      totalHours: 265,
      standardHours: 240,
      overtimeHours: 25,
      overtimePay: 3750,
      basicWage: 30000,
      grossWage: 63750,
      totalDeductions: 7800,
      netWage: 55950,
      employeeCost: 63750,
      status: 'DRAFT',
      components: {
        create: [
          { name: 'Basic', ratePercent: 50, amount: 30000, isDeduction: false, order: 1 },
          { name: 'HRA', ratePercent: 25, amount: 15000, isDeduction: false, order: 2 },
          { name: 'Standard Allowance', ratePercent: 13.33, amount: 8000, isDeduction: false, order: 3 },
          { name: 'Performance Bonus', ratePercent: 10, amount: 6000, isDeduction: false, order: 4 },
          { name: 'Fixed Allowance', ratePercent: 1.67, amount: 1000, isDeduction: false, order: 5 },
          { name: 'Overtime Pay', ratePercent: 6.25, amount: 3750, isDeduction: false, order: 6 },
          { name: 'PF (Employee)', ratePercent: 12, amount: 3600, isDeduction: true, order: 7 },
          { name: 'PF (Employer)', ratePercent: 12, amount: 3600, isDeduction: true, order: 8 },
          { name: 'Professional Tax', ratePercent: 0.33, amount: 200, isDeduction: true, order: 9 },
        ],
      },
    },
  });

  // DONE Payslip for Employee 5 (Emily) - High earner with overtime
  await prisma.payslip.create({
    data: {
      employeeId: employee5.id,
      payPeriod: 'Oct 2025',
      periodStart: octStart,
      periodEnd: octEnd,
      workingDays: 26,
      workedDays: 23,
      paidLeaveDays: 3,
      unpaidLeaveDays: 0,
      totalHours: 275,
      standardHours: 240,
      overtimeHours: 35,
      overtimePay: 17500,
      basicWage: 48000,
      grossWage: 137500,
      totalDeductions: 14600,
      netWage: 122900,
      employeeCost: 137500,
      status: 'DONE',
      validatedAt: new Date('2025-11-02'),
      components: {
        create: [
          { name: 'Basic', ratePercent: 40, amount: 48000, isDeduction: false, order: 1 },
          { name: 'HRA', ratePercent: 20, amount: 24000, isDeduction: false, order: 2 },
          { name: 'Standard Allowance', ratePercent: 16.67, amount: 20000, isDeduction: false, order: 3 },
          { name: 'Performance Bonus', ratePercent: 15, amount: 18000, isDeduction: false, order: 4 },
          { name: 'Special Allowance', ratePercent: 8.33, amount: 10000, isDeduction: false, order: 5 },
          { name: 'Overtime Pay', ratePercent: 14.58, amount: 17500, isDeduction: false, order: 6 },
          { name: 'PF (Employee)', ratePercent: 12, amount: 5760, isDeduction: true, order: 7 },
          { name: 'PF (Employer)', ratePercent: 12, amount: 5760, isDeduction: true, order: 8 },
          { name: 'Professional Tax', ratePercent: 0.17, amount: 200, isDeduction: true, order: 9 },
        ],
      },
    },
  });

  // CANCELLED Payslip for Employee 4 (Diana) - Part-time with errors
  await prisma.payslip.create({
    data: {
      employeeId: employee4.id,
      payPeriod: 'Oct 2025',
      periodStart: octStart,
      periodEnd: octEnd,
      workingDays: 26,
      workedDays: 18,
      paidLeaveDays: 1,
      unpaidLeaveDays: 7,
      totalHours: 120,
      standardHours: 144,
      overtimeHours: 0,
      overtimePay: 0,
      basicWage: 15000,
      grossWage: 20769,
      totalDeductions: 2092,
      netWage: 18677,
      employeeCost: 20769,
      status: 'CANCELLED',
      cancelledAt: new Date('2025-11-03'),
      components: {
        create: [
          { name: 'Basic', ratePercent: 50, amount: 10385, isDeduction: false, order: 1 },
          { name: 'HRA', ratePercent: 20, amount: 4154, isDeduction: false, order: 2 },
          { name: 'Standard Allowance', ratePercent: 13.33, amount: 2769, isDeduction: false, order: 3 },
          { name: 'Fixed Allowance', ratePercent: 16.67, amount: 3461, isDeduction: false, order: 4 },
          { name: 'PF (Employee)', ratePercent: 12, amount: 1246, isDeduction: true, order: 5 },
          { name: 'PF (Employer)', ratePercent: 12, amount: 1246, isDeduction: true, order: 6 },
          { name: 'Professional Tax', ratePercent: 0.67, amount: 138, isDeduction: true, order: 7 },
        ],
      },
    },
  });

  // DRAFT Payslip for Employee 10 (Jack) - Remote worker
  await prisma.payslip.create({
    data: {
      employeeId: employee10.id,
      payPeriod: 'Oct 2025',
      periodStart: octStart,
      periodEnd: octEnd,
      workingDays: 26,
      workedDays: 26,
      paidLeaveDays: 0,
      unpaidLeaveDays: 0,
      totalHours: 240,
      standardHours: 240,
      overtimeHours: 20,
      overtimePay: 6000,
      basicWage: 30000,
      grossWage: 81000,
      totalDeductions: 9800,
      netWage: 71200,
      employeeCost: 81000,
      status: 'DRAFT',
      components: {
        create: [
          { name: 'Basic', ratePercent: 40, amount: 30000, isDeduction: false, order: 1 },
          { name: 'HRA', ratePercent: 20, amount: 15000, isDeduction: false, order: 2 },
          { name: 'Standard Allowance', ratePercent: 20, amount: 15000, isDeduction: false, order: 3 },
          { name: 'Performance Bonus', ratePercent: 15, amount: 11250, isDeduction: false, order: 4 },
          { name: 'Remote Work Allowance', ratePercent: 5, amount: 3750, isDeduction: false, order: 5 },
          { name: 'Overtime Pay', ratePercent: 8, amount: 6000, isDeduction: false, order: 6 },
          { name: 'PF (Employee)', ratePercent: 12, amount: 3600, isDeduction: true, order: 7 },
          { name: 'PF (Employer)', ratePercent: 12, amount: 3600, isDeduction: true, order: 8 },
          { name: 'Professional Tax', ratePercent: 0.27, amount: 200, isDeduction: true, order: 9 },
        ],
      },
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('════════════════════════════════════════════════════════════════════');
  console.log('🏢 Test Company: TestCorp Solutions (SEED DATA)');
  console.log('════════════════════════════════════════════════════════════════════');
  console.log('\n👥 ADMIN & STAFF:');
  console.log('┌────────────────────────────────────────────────────────────────┐');
  console.log('│ Admin:        testadmin / pass123 (ADMIN)                      │');
  console.log('│               admin@testcorp.com                               │');
  console.log('│ Payroll:      testpayroll / pass123 (PAYROLL_OFFICER)         │');
  console.log('│               payroll@testcorp.com                             │');
  console.log('│ HR:           testhr / pass123 (HR_OFFICER)                    │');
  console.log('│               hr@testcorp.com                                  │');
  console.log('└────────────────────────────────────────────────────────────────┘');
  
  console.log('\n👨‍💼 EMPLOYEES (13 Total - All Roles, Genders, Marital Statuses):');
  console.log('┌────────────────────────────────────────────────────────────────┐');
  console.log('│ 1. Alice Johnson (TESTEMP101) - testemp001 / pass123          │');
  console.log('│    FIXED ₹50K/mo | FEMALE, MARRIED                            │');
  console.log('│ 2. Bob Smith (TESTEMP102) - testemp002 / pass123              │');
  console.log('│    FIXED ₹60K/mo + OT ₹150/hr | MALE, SINGLE                  │');
  console.log('│ 3. Charlie Brown (TESTEMP103) - testemp003 / pass123          │');
  console.log('│    HOURLY ₹250/hr | MALE, SINGLE                              │');
  console.log('│ 4. Diana Wilson (TESTEMP104) - testemp004 / pass123           │');
  console.log('│    Part-time FIXED ₹30K/mo | FEMALE, SINGLE                   │');
  console.log('│ 5. Emily Davis (TESTEMP105) - testemp005 / pass123            │');
  console.log('│    Senior FIXED ₹120K/mo + OT ₹500/hr | FEMALE, MARRIED      │');
  console.log('│ 6. Frank Miller (TESTEMP106) - testemp006 / pass123           │');
  console.log('│    FIXED ₹45K/mo | MALE, MARRIED                              │');
  console.log('│ 7. Grace Lee (TESTEMP107) - testemp007 / pass123              │');
  console.log('│    FIXED ₹55K/mo | FEMALE, SINGLE                             │');
  console.log('│ 8. Henry Wilson (TESTEMP108) - testemp008 / pass123           │');
  console.log('│    FIXED ₹42K/mo | MALE, SINGLE                               │');
  console.log('│ 9. Iris Chen (TESTEMP109) - testemp009 / pass123              │');
  console.log('│    HOURLY ₹300/hr | FEMALE, SINGLE                            │');
  console.log('│ 10. Jack Taylor (TESTEMP110) - testemp010 / pass123           │');
  console.log('│     Remote FIXED ₹75K/mo + OT ₹300/hr | MALE, MARRIED        │');
  console.log('│ 11. Kim Rodriguez (TESTEMP111) - testemp011 / pass123         │');
  console.log('│     FIXED ₹52K/mo | OTHER, DIVORCED | ⚠️  INACTIVE            │');
  console.log('│ 12. Samuel Martin (TESTEMP112) - testemp012 / pass123         │');
  console.log('│     FIXED ₹85K/mo + OT ₹350/hr | MALE, WIDOWED               │');
  console.log('│ 13. Lisa Anderson (TESTEMP113) - testemp013 / pass123         │');
  console.log('│     HOURLY ₹350/hr | FEMALE, SINGLE                           │');
  console.log('└────────────────────────────────────────────────────────────────┘');
  
  console.log('\n📅 TODAY\'S ATTENDANCE STATUS (All Scenarios):');
  console.log('┌────────────────────────────────────────────────────────────────┐');
  console.log('│ ✅ Alice Johnson:    PRESENT (Checked in & out: 8:45-17:30)   │');
  console.log('│ 🔄 Bob Smith:        PRESENT (Checked in 8:30 - Still working)│');
  console.log('│ ❌ Charlie Brown:    ABSENT (No check-in)                      │');
  console.log('│ 🏖️  Diana Wilson:    ON LEAVE (Approved PTO)                   │');
  console.log('│ ⏰ Emily Davis:      PRESENT (Late: 10:15-19:30, 9.25 hrs)    │');
  console.log('│ 🕐 Frank Miller:     HALF_DAY (9:00-13:00, 4 hrs)             │');
  console.log('│ 🤒 Grace Lee:        ON LEAVE (Sick Leave - Flu)              │');
  console.log('│ ⚠️  Henry Wilson:     NOT CHECKED IN (No attendance record)    │');
  console.log('│ 🏃 Iris Chen:        PRESENT (Early out: 8:00-15:30, 7.5 hrs) │');
  console.log('│ ✈️  Jack Taylor:      ON LEAVE (Unpaid - Extended vacation)    │');
  console.log('└────────────────────────────────────────────────────────────────┘');
  
  console.log('\n� ATTENDANCE DATA:');
  console.log('┌────────────────────────────────────────────────────────────────┐');
  console.log('│ ✓ October 2025: Full month with varied attendance patterns    │');
  console.log('│ ✓ Today: All status types demonstrated                        │');
  console.log('│   - PRESENT (completed shift)                                 │');
  console.log('│   - PRESENT (currently working)                               │');
  console.log('│   - PRESENT (late arrival)                                    │');
  console.log('│   - HALF_DAY                                                  │');
  console.log('│   - ABSENT                                                    │');
  console.log('│   - ON_LEAVE (PTO, Sick, Unpaid)                             │');
  console.log('│   - NOT CHECKED IN (no record)                               │');
  console.log('└────────────────────────────────────────────────────────────────┘');
  
  console.log('\n🏖️ LEAVE MANAGEMENT:');
  console.log('┌────────────────────────────────────────────────────────────────┐');
  console.log('│ Leave Balances: All 3 types (PTO, Sick, Unpaid) for all      │');
  console.log('│ Leave Statuses Demonstrated:                                  │');
  console.log('│   ⏳ PENDING:   2 requests (Charlie tomorrow, Henry next week)│');
  console.log('│   ✅ APPROVED:  Multiple (Today: Diana, Grace, Jack)          │');
  console.log('│   ❌ REJECTED:  1 request (Bob - yesterday)                   │');
  console.log('│   🚫 CANCELLED: 1 request (Iris - future trip)                │');
  console.log('│ Leave Types:                                                  │');
  console.log('│   • PAID_TIME_OFF (vacation, personal days)                   │');
  console.log('│   • SICK_LEAVE (medical)                                      │');
  console.log('│   • UNPAID_LEAVE (extended absence)                           │');
  console.log('└────────────────────────────────────────────────────────────────┘');
  
  console.log('\n🧪 TEST SCENARIOS COVERED:');
  console.log('┌────────────────────────────────────────────────────────────────┐');
  console.log('│ User Roles:                                                   │');
  console.log('│   ✓ ADMIN                                                     │');
  console.log('│   ✓ HR_OFFICER                                                │');
  console.log('│   ✓ PAYROLL_OFFICER                                           │');
  console.log('│   ✓ EMPLOYEE (10 regular employees)                          │');
  console.log('│ Genders:                                                      │');
  console.log('│   ✓ MALE (6 employees)                                        │');
  console.log('│   ✓ FEMALE (6 employees)                                      │');
  console.log('│   ✓ OTHER (1 employee)                                        │');
  console.log('│ Marital Statuses:                                             │');
  console.log('│   ✓ SINGLE (7 employees)                                      │');
  console.log('│   ✓ MARRIED (4 employees)                                     │');
  console.log('│   ✓ DIVORCED (1 employee)                                     │');
  console.log('│   ✓ WIDOWED (1 employee)                                      │');
  console.log('│ Wage Types:                                                   │');
  console.log('│   ✓ Fixed monthly wage (no OT) - 7 employees                 │');
  console.log('│   ✓ Fixed monthly wage (with OT) - 3 employees               │');
  console.log('│   ✓ Hourly wage - 3 employees                                 │');
  console.log('│ Attendance Patterns:                                          │');
  console.log('│   ✓ Full-time consistent                                      │');
  console.log('│   ✓ Part-time irregular                                       │');
  console.log('│   ✓ Overtime workers                                          │');
  console.log('│   ✓ Late arrivals                                             │');
  console.log('│   ✓ Early departures                                          │');
  console.log('│   ✓ Half days                                                 │');
  console.log('│   ✓ Active check-ins (not checked out yet)                   │');
  console.log('│   ✓ Inactive users (1 employee)                              │');
  console.log('│ Today\'s Status Mix:                                           │');
  console.log('│   ✓ 5 Present (various patterns)                             │');
  console.log('│   ✓ 1 Absent                                                  │');
  console.log('│   ✓ 3 On Leave (PTO, Sick, Unpaid)                           │');
  console.log('│   ✓ 1 Not checked in                                          │');
  console.log('│   ✓ 1 Half day                                                │');
  console.log('│ Leave Statuses:                                               │');
  console.log('│   ✓ PENDING (2 requests)                                      │');
  console.log('│   ✓ APPROVED (Multiple)                                       │');
  console.log('│   ✓ REJECTED (1 request)                                      │');
  console.log('│   ✓ CANCELLED (1 request)                                     │');
  console.log('│ Leave Types:                                                  │');
  console.log('│   ✓ PAID_TIME_OFF                                             │');
  console.log('│   ✓ SICK_LEAVE                                                │');
  console.log('│   ✓ UNPAID_LEAVE                                              │');
  console.log('│ Payslip Statuses (October 2025):                             │');
  console.log('│   ✓ DRAFT (3 payslips)                                        │');
  console.log('│   ✓ DONE (2 payslips - validated)                            │');
  console.log('│   ✓ CANCELLED (1 payslip)                                     │');
  console.log('│ Computation Types:                                            │');
  console.log('│   ✓ FIXED_AMOUNT                                              │');
  console.log('│   ✓ PERCENTAGE_OF_WAGE                                        │');
  console.log('│   ✓ PERCENTAGE_OF_BASIC                                       │');
  console.log('└────────────────────────────────────────────────────────────────┘');
  
  console.log('\n🚀 READY TO TEST:');
  console.log('┌────────────────────────────────────────────────────────────────┐');
  console.log('│ • Dashboard: Complete overview with all data types            │');
  console.log('│ • Attendance: ALL status types in one screen                  │');
  console.log('│ • Leave Management: ALL workflow states visible              │');
  console.log('│ • Payroll: Payslips with DRAFT, DONE, CANCELLED statuses     │');
  console.log('│ • Reports: Rich data for comprehensive testing               │');
  console.log('│ • User Management: All roles with proper permissions         │');
  console.log('│ • Employee Profiles: All genders & marital statuses          │');
  console.log('│ • Salary: Fixed & hourly, with & without overtime            │');
  console.log('└────────────────────────────────────────────────────────────────┘');
  console.log('\n📝 NOTE: This is SEPARATE test company - existing data is SAFE!');
  console.log('════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
