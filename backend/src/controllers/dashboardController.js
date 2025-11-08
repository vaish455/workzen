import prisma from '../config/database.js';
import { getMonthName } from '../utils/dateHelpers.js';

/**
 * Get Dashboard Statistics
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const currentUser = req.user;
    
    // Get total employees
    const totalEmployees = await prisma.employee.count({
      where: {
        companyId: currentUser.companyId,
        user: {
          isActive: true,
        },
      },
    });
    
    // Get today's attendance summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: today,
        employee: {
          companyId: currentUser.companyId,
        },
      },
      _count: true,
    });
    
    const attendanceStats = {
      present: todayAttendance.find(a => a.status === 'PRESENT')?._count || 0,
      absent: todayAttendance.find(a => a.status === 'ABSENT')?._count || 0,
      onLeave: todayAttendance.find(a => a.status === 'ON_LEAVE')?._count || 0,
    };
    
    // Get pending leaves
    const pendingLeaves = await prisma.leave.count({
      where: {
        status: 'PENDING',
        employee: {
          companyId: currentUser.companyId,
        },
      },
    });
    
    // Get current month payroll stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthPayslips = await prisma.payslip.findMany({
      where: {
        employee: {
          companyId: currentUser.companyId,
        },
        periodStart: {
          gte: new Date(currentYear, currentMonth, 1),
          lte: new Date(currentYear, currentMonth + 1, 0),
        },
      },
    });
    
    const payrollStats = {
      totalPayslips: currentMonthPayslips.length,
      draftPayslips: currentMonthPayslips.filter(p => p.status === 'DRAFT').length,
      donePayslips: currentMonthPayslips.filter(p => p.status === 'DONE').length,
      totalCost: currentMonthPayslips.reduce((sum, p) => sum + parseFloat(p.employeeCost), 0),
    };
    
    res.status(200).json({
      success: true,
      data: {
        employees: {
          total: totalEmployees,
        },
        attendance: attendanceStats,
        leaves: {
          pending: pendingLeaves,
        },
        payroll: payrollStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Employee Dashboard (for individual employees)
 * GET /api/dashboard/employee
 */
export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const employeeId = currentUser.employee?.id;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found',
      });
    }
    
    // Get current month attendance
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });
    
    const attendanceStats = {
      present: attendances.filter(a => a.status === 'PRESENT').length,
      absent: attendances.filter(a => a.status === 'ABSENT').length,
      onLeave: attendances.filter(a => a.status === 'ON_LEAVE').length,
      totalHours: attendances.reduce((sum, a) => sum + parseFloat(a.workingHours || 0), 0),
    };
    
    // Get leave balances
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: currentYear,
      },
    });
    
    // Get recent leaves
    const recentLeaves = await prisma.leave.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
    
    // Get recent payslips
    const recentPayslips = await prisma.payslip.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        periodStart: 'desc',
      },
      take: 3,
    });
    
    res.status(200).json({
      success: true,
      data: {
        attendance: attendanceStats,
        leaveBalances,
        recentLeaves,
        recentPayslips,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Attendance Analytics
 * GET /api/dashboard/attendance-analytics
 */
export const getAttendanceAnalytics = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { startDate, endDate, employeeId } = req.query;
    
    // Build filter
    const where = {
      employee: {
        companyId: currentUser.companyId,
      },
    };
    
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      // Default to current month
      const now = new Date();
      where.date = {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };
    }
    
    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    // Group by status
    const statusBreakdown = {
      PRESENT: attendances.filter(a => a.status === 'PRESENT').length,
      ABSENT: attendances.filter(a => a.status === 'ABSENT').length,
      ON_LEAVE: attendances.filter(a => a.status === 'ON_LEAVE').length,
      HALF_DAY: attendances.filter(a => a.status === 'HALF_DAY').length,
    };
    
    // Calculate average working hours
    const totalHours = attendances.reduce((sum, a) => sum + parseFloat(a.workingHours || 0), 0);
    const avgHours = attendances.length > 0 ? totalHours / attendances.length : 0;
    
    res.status(200).json({
      success: true,
      data: {
        total: attendances.length,
        statusBreakdown,
        totalWorkingHours: Math.round(totalHours * 100) / 100,
        averageWorkingHours: Math.round(avgHours * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Leave Analytics
 * GET /api/dashboard/leave-analytics
 */
export const getLeaveAnalytics = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { year } = req.query;
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Get all leaves for the year
    const leaves = await prisma.leave.findMany({
      where: {
        employee: {
          companyId: currentUser.companyId,
        },
        startDate: {
          gte: new Date(targetYear, 0, 1),
          lte: new Date(targetYear, 11, 31),
        },
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    // Group by status
    const statusBreakdown = {
      PENDING: leaves.filter(l => l.status === 'PENDING').length,
      APPROVED: leaves.filter(l => l.status === 'APPROVED').length,
      REJECTED: leaves.filter(l => l.status === 'REJECTED').length,
      CANCELLED: leaves.filter(l => l.status === 'CANCELLED').length,
    };
    
    // Group by type
    const typeBreakdown = {
      PAID_TIME_OFF: leaves.filter(l => l.leaveType === 'PAID_TIME_OFF').length,
      SICK_LEAVE: leaves.filter(l => l.leaveType === 'SICK_LEAVE').length,
      UNPAID_LEAVE: leaves.filter(l => l.leaveType === 'UNPAID_LEAVE').length,
    };
    
    // Calculate total days
    const totalDays = leaves.reduce((sum, l) => sum + parseFloat(l.totalDays), 0);
    
    res.status(200).json({
      success: true,
      data: {
        total: leaves.length,
        totalDays,
        statusBreakdown,
        typeBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Payroll Analytics
 * GET /api/dashboard/payroll-analytics
 */
export const getPayrollAnalytics = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { year } = req.query;
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Get all payslips for the year
    const payslips = await prisma.payslip.findMany({
      where: {
        employee: {
          companyId: currentUser.companyId,
        },
        periodStart: {
          gte: new Date(targetYear, 0, 1),
          lte: new Date(targetYear, 11, 31),
        },
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    // Calculate totals
    const totalEmployeeCost = payslips.reduce((sum, p) => sum + parseFloat(p.employeeCost), 0);
    const totalBasicWage = payslips.reduce((sum, p) => sum + parseFloat(p.basicWage), 0);
    const totalGrossWage = payslips.reduce((sum, p) => sum + parseFloat(p.grossWage), 0);
    const totalDeductions = payslips.reduce((sum, p) => sum + parseFloat(p.totalDeductions), 0);
    const totalNetWage = payslips.reduce((sum, p) => sum + parseFloat(p.netWage), 0);
    
    // Monthly breakdown
    const monthlyBreakdown = [];
    for (let month = 0; month < 12; month++) {
      const monthPayslips = payslips.filter(p => {
        const pMonth = new Date(p.periodStart).getMonth();
        return pMonth === month;
      });
      
      monthlyBreakdown.push({
        month: getMonthName(month),
        count: monthPayslips.length,
        totalCost: monthPayslips.reduce((sum, p) => sum + parseFloat(p.employeeCost), 0),
        totalNet: monthPayslips.reduce((sum, p) => sum + parseFloat(p.netWage), 0),
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        total: payslips.length,
        totalEmployeeCost: Math.round(totalEmployeeCost * 100) / 100,
        totalBasicWage: Math.round(totalBasicWage * 100) / 100,
        totalGrossWage: Math.round(totalGrossWage * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        totalNetWage: Math.round(totalNetWage * 100) / 100,
        monthlyBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Salary Statement Report
 * GET /api/reports/salary-statement
 */
export const getSalaryStatement = async (req, res, next) => {
  try {
    const { employeeId, year } = req.query;
    const currentUser = req.user;
    
    if (!employeeId || !year) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and year are required',
      });
    }
    
    // Check if employee exists in same company
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId: currentUser.companyId,
      },
      include: {
        user: {
          select: {
            loginId: true,
            email: true,
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
    
    const targetYear = parseInt(year);
    
    // Get all payslips for the year
    const payslips = await prisma.payslip.findMany({
      where: {
        employeeId,
        periodStart: {
          gte: new Date(targetYear, 0, 1),
          lte: new Date(targetYear, 11, 31),
        },
        status: 'DONE',
      },
      include: {
        components: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: {
        periodStart: 'asc',
      },
    });
    
    // Calculate yearly totals
    const yearlyTotals = {
      grossWage: payslips.reduce((sum, p) => sum + parseFloat(p.grossWage), 0),
      totalDeductions: payslips.reduce((sum, p) => sum + parseFloat(p.totalDeductions), 0),
      netWage: payslips.reduce((sum, p) => sum + parseFloat(p.netWage), 0),
    };
    
    res.status(200).json({
      success: true,
      data: {
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          loginId: employee.user.loginId,
          email: employee.email,
          employeeCode: employee.employeeCode,
        },
        year: targetYear,
        payslips,
        yearlyTotals: {
          grossWage: Math.round(yearlyTotals.grossWage * 100) / 100,
          totalDeductions: Math.round(yearlyTotals.totalDeductions * 100) / 100,
          netWage: Math.round(yearlyTotals.netWage * 100) / 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Company Overview
 * GET /api/dashboard/overview
 */
export const getCompanyOverview = async (req, res, next) => {
  try {
    const currentUser = req.user;
    
    // Get employee count by role
    const employeesByRole = await prisma.user.groupBy({
      by: ['role'],
      where: {
        companyId: currentUser.companyId,
        isActive: true,
      },
      _count: true,
    });
    
    // Get total active and inactive employees
    const activeEmployees = await prisma.user.count({
      where: {
        companyId: currentUser.companyId,
        isActive: true,
      },
    });
    
    const inactiveEmployees = await prisma.user.count({
      where: {
        companyId: currentUser.companyId,
        isActive: false,
      },
    });
    
    // Get current month stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyPayroll = await prisma.payslip.aggregate({
      where: {
        employee: {
          companyId: currentUser.companyId,
        },
        periodStart: {
          gte: new Date(currentYear, currentMonth, 1),
          lte: new Date(currentYear, currentMonth + 1, 0),
        },
      },
      _sum: {
        netWage: true,
        employeeCost: true,
      },
    });
    
    res.status(200).json({
      success: true,
      data: {
        employees: {
          total: activeEmployees + inactiveEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          byRole: employeesByRole,
        },
        currentMonthPayroll: {
          totalNetWage: monthlyPayroll._sum.netWage || 0,
          totalCost: monthlyPayroll._sum.employeeCost || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
