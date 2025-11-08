import prisma from '../config/database.js';
import {
  calculatePF,
  calculateGrossSalary,
  calculateNetSalary,
  calculateProratedAmount,
  roundToTwo,
} from '../utils/salaryCalculations.js';
import { getWorkingDaysInMonth, getMonthDateRange, getMonthName } from '../utils/dateHelpers.js';
import { sendMonthlySalarySlip } from '../utils/emailTemplates.js';

/**
 * Generate Payrun for All Employees
 * POST /api/payroll/payrun
 */
export const generatePayrun = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const currentUser = req.user;
    
    const targetMonth = month - 1; // JavaScript months are 0-indexed
    const targetYear = year;
    
    // Get date range for the month
    const { start: periodStart, end: periodEnd } = getMonthDateRange(targetYear, targetMonth);
    
    // Get all employees with salary structure
    const employees = await prisma.employee.findMany({
      where: {
        companyId: currentUser.companyId,
        salaryStructure: {
          isNot: null,
        },
      },
      include: {
        salaryStructure: {
          include: {
            components: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    
    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No employees with salary structure found',
      });
    }
    
    // Get working days in the month
    const workingDays = getWorkingDaysInMonth(targetYear, targetMonth);
    
    const payslips = [];
    const errors = [];
    
    // Generate payslip for each employee
    for (const employee of employees) {
      try {
        const payslip = await generateEmployeePayslip(
          employee,
          periodStart,
          periodEnd,
          workingDays,
          targetYear,
          targetMonth
        );
        payslips.push(payslip);
      } catch (error) {
        errors.push({
          employeeId: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          error: error.message,
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Payrun generated for ${getMonthName(targetMonth)} ${targetYear}`,
      data: {
        payslips,
        total: payslips.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Generate payslip for a single employee
 */
const generateEmployeePayslip = async (employee, periodStart, periodEnd, workingDays, year, month) => {
  // Check if payslip already exists
  const existingPayslip = await prisma.payslip.findFirst({
    where: {
      employeeId: employee.id,
      periodStart,
      periodEnd,
    },
  });
  
  if (existingPayslip) {
    throw new Error('Payslip already exists for this period');
  }
  
  // Get attendance for the month
  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId: employee.id,
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  });
  
  // Calculate worked days (present + on leave with paid leave)
  const presentDays = attendances.filter(a => a.status === 'PRESENT').length;
  
  // Get approved leaves for the month
  const approvedLeaves = await prisma.leave.findMany({
    where: {
      employeeId: employee.id,
      status: 'APPROVED',
      startDate: { lte: periodEnd },
      endDate: { gte: periodStart },
    },
  });
  
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  
  for (const leave of approvedLeaves) {
    if (leave.leaveType === 'UNPAID_LEAVE') {
      unpaidLeaveDays += parseFloat(leave.totalDays);
    } else {
      paidLeaveDays += parseFloat(leave.totalDays);
    }
  }
  
  // Total worked days = present days + paid leave days
  const workedDays = presentDays + paidLeaveDays;
  
  // Get salary structure
  const salaryStructure = employee.salaryStructure;
  const wage = parseFloat(salaryStructure.wage);
  const pfRate = parseFloat(salaryStructure.pfRate);
  const professionalTax = parseFloat(salaryStructure.professionalTax);
  
  // Calculate component amounts (prorated based on worked days)
  const payslipComponents = [];
  let basicWage = 0;
  
  for (const component of salaryStructure.components) {
    const fullAmount = parseFloat(component.amount);
    const proratedAmount = calculateProratedAmount(fullAmount, workingDays, workedDays);
    
    payslipComponents.push({
      name: component.name,
      ratePercent: 100, // Full rate
      amount: roundToTwo(proratedAmount),
      isDeduction: false,
      order: component.order,
    });
    
    if (component.name === 'Basic') {
      basicWage = roundToTwo(proratedAmount);
    }
  }
  
  // Calculate gross salary
  const grossWage = payslipComponents.reduce((sum, comp) => {
    return sum + parseFloat(comp.amount);
  }, 0);
  
  // Calculate deductions
  const pfDeduction = calculatePF(basicWage, pfRate);
  const professionalTaxDeduction = workedDays > 0 ? professionalTax : 0;
  
  // Add deductions to components
  payslipComponents.push(
    {
      name: 'Provident Fund',
      ratePercent: pfRate,
      amount: roundToTwo(pfDeduction),
      isDeduction: true,
      order: 100,
    },
    {
      name: 'Professional Tax',
      ratePercent: 100,
      amount: roundToTwo(professionalTaxDeduction),
      isDeduction: true,
      order: 101,
    }
  );
  
  const totalDeductions = roundToTwo(pfDeduction + professionalTaxDeduction);
  const netWage = calculateNetSalary(grossWage, totalDeductions);
  
  // Employee cost (same as gross for monthly wage)
  const employeeCost = grossWage;
  
  // Create payslip
  const payslip = await prisma.payslip.create({
    data: {
      employeeId: employee.id,
      payPeriod: `${getMonthName(month).substring(0, 3)} ${year}`,
      periodStart,
      periodEnd,
      workingDays,
      workedDays,
      paidLeaveDays,
      unpaidLeaveDays,
      basicWage: roundToTwo(basicWage),
      grossWage: roundToTwo(grossWage),
      totalDeductions: roundToTwo(totalDeductions),
      netWage: roundToTwo(netWage),
      employeeCost: roundToTwo(employeeCost),
      status: 'DRAFT',
      components: {
        create: payslipComponents,
      },
    },
    include: {
      components: {
        orderBy: { order: 'asc' },
      },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  
  return payslip;
};

/**
 * Get All Payslips
 * GET /api/payroll/payslips
 */
export const getAllPayslips = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { month, year, status, employeeId } = req.query;
    
    // Build filter
    const where = {
      employee: {
        companyId: currentUser.companyId,
      },
    };
    
    if (status) {
      where.status = status;
    }
    
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    if (month && year) {
      const targetMonth = parseInt(month) - 1;
      const targetYear = parseInt(year);
      const { start, end } = getMonthDateRange(targetYear, targetMonth);
      
      where.periodStart = start;
      where.periodEnd = end;
    }
    
    const payslips = await prisma.payslip.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Calculate statistics
    const statistics = {
      totalPayslips: payslips.length,
      totalEmployeeCost: payslips.reduce((sum, p) => sum + parseFloat(p.employeeCost), 0),
      totalBasicWage: payslips.reduce((sum, p) => sum + parseFloat(p.basicWage), 0),
      totalGrossWage: payslips.reduce((sum, p) => sum + parseFloat(p.grossWage), 0),
      totalNetWage: payslips.reduce((sum, p) => sum + parseFloat(p.netWage), 0),
      draftCount: payslips.filter(p => p.status === 'DRAFT').length,
      doneCount: payslips.filter(p => p.status === 'DONE').length,
    };
    
    res.status(200).json({
      success: true,
      count: payslips.length,
      data: {
        payslips,
        statistics,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get My Payslips (for employees)
 * GET /api/payroll/my-payslips
 */
export const getMyPayslips = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const employeeId = currentUser.employee?.id;
    const { year } = req.query;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found',
      });
    }
    
    // Build filter
    const where = { employeeId };
    
    if (year) {
      const targetYear = parseInt(year);
      where.periodStart = {
        gte: new Date(targetYear, 0, 1),
        lte: new Date(targetYear, 11, 31),
      };
    }
    
    const payslips = await prisma.payslip.findMany({
      where,
      include: {
        components: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        periodStart: 'desc',
      },
    });
    
    res.status(200).json({
      success: true,
      count: payslips.length,
      data: payslips,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Payslip by ID
 * GET /api/payroll/payslips/:id
 */
export const getPayslipById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const payslip = await prisma.payslip.findFirst({
      where: {
        id,
        employee: {
          companyId: currentUser.companyId,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
          },
        },
        components: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found',
      });
    }
    
    // Employees can only view their own payslips
    if (currentUser.role === 'EMPLOYEE' && payslip.employeeId !== currentUser.employee?.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
    
    res.status(200).json({
      success: true,
      data: payslip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate Payslip (Mark as Done)
 * PUT /api/payroll/payslips/:id/validate
 */
export const validatePayslip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const payslip = await prisma.payslip.findFirst({
      where: {
        id,
        employee: {
          companyId: currentUser.companyId,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        components: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found',
      });
    }
    
    if (payslip.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: `Payslip is already ${payslip.status.toLowerCase()}`,
      });
    }
    
    const updatedPayslip = await prisma.payslip.update({
      where: { id },
      data: {
        status: 'DONE',
        validatedAt: new Date(),
      },
    });
    
    // Send salary slip email
    try {
      const userName = `${payslip.employee.firstName} ${payslip.employee.lastName}`;
      
      // Extract month and year from payPeriod
      const periodDate = new Date(payslip.periodStart);
      const month = getMonthName(periodDate.getMonth());
      const year = periodDate.getFullYear();
      
      // Calculate earnings and deductions
      const earnings = payslip.components.filter(c => !c.isDeduction);
      const deductions = payslip.components.filter(c => c.isDeduction);
      
      const basicSalary = earnings.find(e => e.name === 'Basic')?.amount || 0;
      const hra = earnings.find(e => e.name === 'HRA')?.amount || 0;
      const otherAllowances = earnings
        .filter(e => e.name !== 'Basic' && e.name !== 'HRA')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      const providentFund = deductions.find(d => d.name === 'Provident Fund')?.amount || 0;
      const tax = deductions.find(d => d.name === 'Professional Tax')?.amount || 0;
      const otherDeductions = deductions
        .filter(d => d.name !== 'Provident Fund' && d.name !== 'Professional Tax')
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);
      
      await sendMonthlySalarySlip(
        payslip.employee.email,
        userName,
        month,
        year,
        {
          basicSalary: parseFloat(basicSalary),
          hra: parseFloat(hra),
          otherAllowances: parseFloat(otherAllowances),
          grossSalary: parseFloat(payslip.grossWage),
          providentFund: parseFloat(providentFund),
          tax: parseFloat(tax),
          otherDeductions: parseFloat(otherDeductions),
          totalDeductions: parseFloat(payslip.totalDeductions),
          netSalary: parseFloat(payslip.netWage),
          workingDays: payslip.workingDays,
          presentDays: payslip.workedDays - payslip.paidLeaveDays,
          leaveDays: payslip.paidLeaveDays + payslip.unpaidLeaveDays,
          overtimeHours: 0, // You can add this field to payslip if needed
          overtimePay: 0, // You can add this field to payslip if needed
        }
      );
    } catch (emailError) {
      console.error('Failed to send salary slip email:', emailError);
      // Don't fail validation if email fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Payslip validated successfully',
      data: updatedPayslip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Payslip
 * PUT /api/payroll/payslips/:id/cancel
 */
export const cancelPayslip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const payslip = await prisma.payslip.findFirst({
      where: {
        id,
        employee: {
          companyId: currentUser.companyId,
        },
      },
    });
    
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found',
      });
    }
    
    if (payslip.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Payslip is already cancelled',
      });
    }
    
    const updatedPayslip = await prisma.payslip.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Payslip cancelled successfully',
      data: updatedPayslip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Individual Payslip
 * POST /api/payroll/payslips/generate
 */
export const generateIndividualPayslip = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.body;
    const currentUser = req.user;
    
    const targetMonth = month - 1;
    const targetYear = year;
    
    // Get employee with salary structure
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId: currentUser.companyId,
      },
      include: {
        salaryStructure: {
          include: {
            components: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    
    if (!employee.salaryStructure) {
      return res.status(400).json({
        success: false,
        message: 'Employee does not have a salary structure',
      });
    }
    
    const { start: periodStart, end: periodEnd } = getMonthDateRange(targetYear, targetMonth);
    const workingDays = getWorkingDaysInMonth(targetYear, targetMonth);
    
    const payslip = await generateEmployeePayslip(
      employee,
      periodStart,
      periodEnd,
      workingDays,
      targetYear,
      targetMonth
    );
    
    res.status(201).json({
      success: true,
      message: 'Payslip generated successfully',
      data: payslip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Payslip
 * DELETE /api/payroll/payslips/:id
 */
export const deletePayslip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const payslip = await prisma.payslip.findFirst({
      where: {
        id,
        employee: {
          companyId: currentUser.companyId,
        },
      },
    });
    
    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found',
      });
    }
    
    // Only draft payslips can be deleted
    if (payslip.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only draft payslips can be deleted',
      });
    }
    
    await prisma.payslip.delete({
      where: { id },
    });
    
    res.status(200).json({
      success: true,
      message: 'Payslip deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
