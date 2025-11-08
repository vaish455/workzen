import prisma from '../config/database.js';
import { calculateDays } from '../utils/dateHelpers.js';
import { uploadImage } from '../config/cloudinary.js';

/**
 * Apply for Leave
 * POST /api/leaves
 */
export const applyLeave = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const employeeId = currentUser.employee?.id;
    const { leaveType, subject, description, startDate, endDate, startTime, endTime, note } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found',
      });
    }
    
    // Calculate total days
    const totalDays = calculateDays(new Date(startDate), new Date(endDate));
    
    // Check leave balance for paid leaves
    if (leaveType === 'PAID_TIME_OFF' || leaveType === 'SICK_LEAVE') {
      const currentYear = new Date().getFullYear();
      const leaveBalance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId,
          leaveType,
          year: currentYear,
        },
      });
      
      if (!leaveBalance || leaveBalance.remainingDays < totalDays) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType.toLowerCase().replace('_', ' ')} balance`,
          available: leaveBalance?.remainingDays || 0,
          required: totalDays,
        });
      }
    }
    
    // Handle certificate upload for sick leave
    let certificateUrl = null;
    if (req.file && leaveType === 'SICK_LEAVE') {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      certificateUrl = await uploadImage(base64Image, 'workzen/certificates');
    }
    
    // Create leave application
    const leave = await prisma.leave.create({
      data: {
        employeeId,
        leaveType,
        subject,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        totalDays,
        note,
        certificate: certificateUrl,
        status: 'PENDING',
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    
    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get My Leaves
 * GET /api/leaves/my-leaves
 */
export const getMyLeaves = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const employeeId = currentUser.employee?.id;
    const { status, year } = req.query;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found',
      });
    }
    
    // Build filter
    const where = { employeeId };
    
    if (status) {
      where.status = status;
    }
    
    if (year) {
      const yearInt = parseInt(year);
      where.startDate = {
        gte: new Date(yearInt, 0, 1),
        lte: new Date(yearInt, 11, 31),
      };
    }
    
    const leaves = await prisma.leave.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Get leave balances
    const currentYear = new Date().getFullYear();
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: currentYear,
      },
    });
    
    res.status(200).json({
      success: true,
      data: {
        leaves,
        balances: leaveBalances,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Leaves (for HR/Admin/Payroll)
 * GET /api/leaves
 */
export const getAllLeaves = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { status, leaveType, employeeId, startDate, endDate } = req.query;
    
    // Build filter
    const where = {
      employee: {
        companyId: currentUser.companyId,
      },
    };
    
    if (status) {
      where.status = status;
    }
    
    if (leaveType) {
      where.leaveType = leaveType;
    }
    
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    const leaves = await prisma.leave.findMany({
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
    
    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Leave by ID
 * GET /api/leaves/:id
 */
export const getLeaveById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const leave = await prisma.leave.findFirst({
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
            profilePicture: true,
          },
        },
      },
    });
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }
    
    // Employees can only view their own leaves
    if (currentUser.role === 'EMPLOYEE' && leave.employeeId !== currentUser.employee?.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
    
    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve Leave
 * PUT /api/leaves/:id/approve
 */
export const approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const leave = await prisma.leave.findFirst({
      where: {
        id,
        employee: {
          companyId: currentUser.companyId,
        },
      },
      include: {
        employee: true,
      },
    });
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }
    
    if (leave.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Leave already ${leave.status.toLowerCase()}`,
      });
    }
    
    // Update leave and leave balance in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Approve leave
      const updatedLeave = await tx.leave.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: currentUser.id,
          approvedAt: new Date(),
        },
      });
      
      // Update leave balance for paid leaves
      if (leave.leaveType === 'PAID_TIME_OFF' || leave.leaveType === 'SICK_LEAVE') {
        const currentYear = new Date().getFullYear();
        
        await tx.leaveBalance.updateMany({
          where: {
            employeeId: leave.employeeId,
            leaveType: leave.leaveType,
            year: currentYear,
          },
          data: {
            usedDays: {
              increment: leave.totalDays,
            },
            remainingDays: {
              decrement: leave.totalDays,
            },
          },
        });
      }
      
      // Mark attendance as ON_LEAVE for the leave period
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);
        
        await tx.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: leave.employeeId,
              date: currentDate,
            },
          },
          create: {
            employeeId: leave.employeeId,
            date: currentDate,
            status: 'ON_LEAVE',
          },
          update: {
            status: 'ON_LEAVE',
          },
        });
      }
      
      return updatedLeave;
    });
    
    res.status(200).json({
      success: true,
      message: 'Leave approved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Leave
 * PUT /api/leaves/:id/reject
 */
export const rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const currentUser = req.user;
    
    const leave = await prisma.leave.findFirst({
      where: {
        id,
        employee: {
          companyId: currentUser.companyId,
        },
      },
    });
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }
    
    if (leave.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Leave already ${leave.status.toLowerCase()}`,
      });
    }
    
    // Reject leave
    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: currentUser.id,
        approvedAt: new Date(),
        rejectionReason: reason,
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Leave rejected',
      data: updatedLeave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Leave (by employee)
 * PUT /api/leaves/:id/cancel
 */
export const cancelLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const employeeId = currentUser.employee?.id;
    
    const leave = await prisma.leave.findFirst({
      where: {
        id,
        employeeId,
      },
    });
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }
    
    if (leave.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Leave already cancelled',
      });
    }
    
    // Can only cancel pending or approved leaves
    if (!['PENDING', 'APPROVED'].includes(leave.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this leave',
      });
    }
    
    // If approved, need to restore leave balance
    const result = await prisma.$transaction(async (tx) => {
      const updatedLeave = await tx.leave.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
      });
      
      // Restore leave balance if it was approved
      if (leave.status === 'APPROVED') {
        if (leave.leaveType === 'PAID_TIME_OFF' || leave.leaveType === 'SICK_LEAVE') {
          const currentYear = new Date().getFullYear();
          
          await tx.leaveBalance.updateMany({
            where: {
              employeeId: leave.employeeId,
              leaveType: leave.leaveType,
              year: currentYear,
            },
            data: {
              usedDays: {
                decrement: leave.totalDays,
              },
              remainingDays: {
                increment: leave.totalDays,
              },
            },
          });
        }
      }
      
      return updatedLeave;
    });
    
    res.status(200).json({
      success: true,
      message: 'Leave cancelled successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Allocate Leave Balance (for HR/Admin)
 * POST /api/leaves/allocate
 */
export const allocateLeave = async (req, res, next) => {
  try {
    const { employeeId, leaveType, totalDays, year } = req.body;
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
    
    // Upsert leave balance
    const leaveBalance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveType_year: {
          employeeId,
          leaveType,
          year: year || new Date().getFullYear(),
        },
      },
      create: {
        employeeId,
        leaveType,
        totalDays,
        usedDays: 0,
        remainingDays: totalDays,
        year: year || new Date().getFullYear(),
      },
      update: {
        totalDays,
        remainingDays: {
          increment: totalDays,
        },
      },
    });
    
    res.status(200).json({
      success: true,
      message: 'Leave balance allocated successfully',
      data: leaveBalance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Employee Leave Balance
 * GET /api/leaves/balance/:employeeId
 */
export const getLeaveBalance = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;
    const currentUser = req.user;
    
    // Check permissions
    const isOwnProfile = currentUser.employee?.id === employeeId;
    const canView = ['ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER'].includes(currentUser.role) || isOwnProfile;
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
    
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: year ? parseInt(year) : new Date().getFullYear(),
        employee: {
          companyId: currentUser.companyId,
        },
      },
    });
    
    res.status(200).json({
      success: true,
      data: leaveBalances,
    });
  } catch (error) {
    next(error);
  }
};
