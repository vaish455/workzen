import prisma from '../config/database.js';
import { calculateWorkingHours, formatDate, isToday } from '../utils/dateHelpers.js';

/**
 * Check In
 * POST /api/attendance/check-in
 */
export const checkIn = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const employeeId = currentUser.employee?.id;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found',
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get existing attendance record for today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: today,
      },
    });
    
    // Check if currently checked in
    if (existingAttendance && existingAttendance.currentlyCheckedIn) {
      return res.status(400).json({
        success: false,
        message: 'You are already checked in. Please check out first.',
        data: existingAttendance,
      });
    }
    
    const checkInTime = new Date();
    
    // Get existing sessions or initialize empty array
    let sessions = existingAttendance?.sessions ? 
      (Array.isArray(existingAttendance.sessions) ? existingAttendance.sessions : []) : 
      [];
    
    // Add new check-in session
    sessions.push({
      checkIn: checkInTime.toISOString(),
      checkOut: null
    });
    
    // Create or update attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
      create: {
        employeeId,
        date: today,
        checkIn: checkInTime,
        status: 'PRESENT',
        currentlyCheckedIn: true,
        sessions: sessions,
      },
      update: {
        checkIn: existingAttendance?.checkIn || checkInTime, // Keep first check-in time
        status: 'PRESENT',
        currentlyCheckedIn: true,
        sessions: sessions,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check Out
 * POST /api/attendance/check-out
 */
export const checkOut = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const employeeId = currentUser.employee?.id;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found',
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find today's attendance
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: today,
      },
    });
    
    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today',
      });
    }
    
    if (!attendance.currentlyCheckedIn) {
      return res.status(400).json({
        success: false,
        message: 'You are not currently checked in',
        data: attendance,
      });
    }
    
    const checkOutTime = new Date();
    
    // Get existing sessions
    let sessions = attendance.sessions ? 
      (Array.isArray(attendance.sessions) ? attendance.sessions : []) : 
      [];
    
    // Find the last session without checkout and update it
    for (let i = sessions.length - 1; i >= 0; i--) {
      if (!sessions[i].checkOut) {
        sessions[i].checkOut = checkOutTime.toISOString();
        break;
      }
    }
    
    // Calculate total working hours from all sessions
    let totalWorkingHours = 0;
    sessions.forEach(session => {
      if (session.checkIn && session.checkOut) {
        const checkIn = new Date(session.checkIn);
        const checkOut = new Date(session.checkOut);
        totalWorkingHours += calculateWorkingHours(checkIn, checkOut);
      }
    });
    
    // Update attendance
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        workingHours: totalWorkingHours,
        currentlyCheckedIn: false,
        sessions: sessions,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: updatedAttendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get My Attendance Records
 * GET /api/attendance/my-attendance
 */
export const getMyAttendance = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const employeeId = currentUser.employee?.id;
    const { startDate, endDate, month, year } = req.query;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found',
      });
    }
    
    // Build date filter
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0);
      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    } else {
      // Default to current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    }
    
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        ...dateFilter,
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    // Calculate statistics
    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.status === 'PRESENT').length;
    const absentDays = attendances.filter(a => a.status === 'ABSENT').length;
    const leaveDays = attendances.filter(a => a.status === 'ON_LEAVE').length;
    const totalWorkingHours = attendances.reduce((sum, a) => {
      return sum + parseFloat(a.workingHours || 0);
    }, 0);
    
    res.status(200).json({
      success: true,
      data: {
        attendances,
        statistics: {
          totalDays,
          presentDays,
          absentDays,
          leaveDays,
          totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Employee Attendance (for HR/Admin)
 * GET /api/attendance/employee/:employeeId
 */
export const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, month, year } = req.query;
    const currentUser = req.user;
    
    // Check if employee exists in same company
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId: currentUser.companyId,
      },
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    
    // Build date filter
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else if (month && year) {
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0);
      dateFilter = {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      };
    }
    
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        ...dateFilter,
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    res.status(200).json({
      success: true,
      count: attendances.length,
      data: attendances,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Employees Attendance
 * GET /api/attendance/all
 */
export const getAllAttendance = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { date } = req.query;
    
    // Default to today
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    // Get all employees in company
    const employees = await prisma.employee.findMany({
      where: {
        companyId: currentUser.companyId,
      },
      include: {
        user: {
          select: {
            isActive: true,
          },
        },
      },
    });
    
    // Get attendance for all employees on target date
    const attendanceData = await Promise.all(
      employees.map(async (employee) => {
        const attendance = await prisma.attendance.findFirst({
          where: {
            employeeId: employee.id,
            date: targetDate,
          },
        });
        
        // Check if on leave
        const leave = await prisma.leave.findFirst({
          where: {
            employeeId: employee.id,
            status: 'APPROVED',
            startDate: { lte: targetDate },
            endDate: { gte: targetDate },
          },
        });
        
        let status = 'ABSENT';
        if (leave) {
          status = 'ON_LEAVE';
        } else if (attendance?.status === 'PRESENT') {
          status = 'PRESENT';
        }
        
        return {
          employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            profilePicture: employee.profilePicture,
            isActive: employee.user.isActive,
          },
          attendance: attendance || null,
          status,
          leave: leave ? { id: leave.id, leaveType: leave.leaveType } : null,
        };
      })
    );
    
    // Calculate summary
    const summary = {
      total: attendanceData.length,
      present: attendanceData.filter(a => a.status === 'PRESENT').length,
      absent: attendanceData.filter(a => a.status === 'ABSENT').length,
      onLeave: attendanceData.filter(a => a.status === 'ON_LEAVE').length,
    };
    
    res.status(200).json({
      success: true,
      data: {
        date: targetDate,
        summary,
        attendances: attendanceData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Today's Attendance Status
 * GET /api/attendance/today
 */
export const getTodayAttendance = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const employeeId = currentUser.employee?.id;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found',
      });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: today,
      },
    });
    
    // Check if on leave today
    const leave = await prisma.leave.findFirst({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });
    
    let status = 'ABSENT';
    if (leave) {
      status = 'ON_LEAVE';
    } else if (attendance?.status === 'PRESENT') {
      status = 'PRESENT';
    }
    
    res.status(200).json({
      success: true,
      data: {
        attendance,
        leave,
        status,
        canCheckIn: !attendance?.currentlyCheckedIn && !leave,
        canCheckOut: attendance?.currentlyCheckedIn,
        isCurrentlyInOffice: attendance?.currentlyCheckedIn || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark Attendance (for HR/Admin)
 * POST /api/attendance/mark
 */
export const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, remarks } = req.body;
    const currentUser = req.user;
    
    // Check if employee exists in same company
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        companyId: currentUser.companyId,
      },
    });
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    // Create or update attendance
    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate,
        },
      },
      create: {
        employeeId,
        date: attendanceDate,
        status,
        remarks,
      },
      update: {
        status,
        remarks,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};
