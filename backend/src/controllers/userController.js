import prisma from '../config/database.js';
import { hashPassword, generateRandomPassword, generateLoginId } from '../utils/auth.js';
import { sendEmployeeWelcomeEmail, sendProfileUpdateNotification, sendAccountLockedEmail } from '../utils/emailTemplates.js';
import { uploadImage } from '../config/cloudinary.js';

/**
 * Create User (Employee, HR Officer, Payroll Officer)
 * POST /api/users
 */
export const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, phone } = req.body;
    const adminUser = req.user;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }
    
    // Get company info
    const company = await prisma.company.findUnique({
      where: { id: adminUser.companyId },
    });
    
    // Get current year and calculate serial number
    const currentYear = new Date().getFullYear();
    
    // Get the last employee for this year
    const lastEmployee = await prisma.employee.findFirst({
      where: {
        companyId: adminUser.companyId,
        yearOfJoining: currentYear,
      },
      orderBy: {
        serialNumber: 'desc',
      },
    });
    
    const serialNumber = lastEmployee ? lastEmployee.serialNumber + 1 : 1;
    
    // Generate login ID
    const loginId = generateLoginId(company.name, firstName, lastName, currentYear, serialNumber);
    
    // Generate random password
    const randomPassword = generateRandomPassword();
    const hashedPassword = await hashPassword(randomPassword);
    
    // Create user and employee in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          loginId,
          email,
          password: hashedPassword,
          role,
          companyId: adminUser.companyId,
        },
      });
      
      // Create employee profile
      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          companyId: adminUser.companyId,
          firstName,
          lastName,
          email,
          phone,
          dateOfJoining: new Date(),
          yearOfJoining: currentYear,
          serialNumber,
        },
      });
      
      // Initialize leave balances for the current year
      const currentYearValue = new Date().getFullYear();
      
      await tx.leaveBalance.createMany({
        data: [
          {
            employeeId: employee.id,
            leaveType: 'PAID_TIME_OFF',
            totalDays: 15,
            usedDays: 0,
            remainingDays: 15,
            year: currentYearValue,
          },
          {
            employeeId: employee.id,
            leaveType: 'SICK_LEAVE',
            totalDays: 10,
            usedDays: 0,
            remainingDays: 10,
            year: currentYearValue,
          },
          {
            employeeId: employee.id,
            leaveType: 'UNPAID_LEAVE',
            totalDays: 0,
            usedDays: 0,
            remainingDays: 0,
            year: currentYearValue,
          },
        ],
      });
      
      return { user, employee };
    });
    
    // Send welcome email with credentials
    try {
      await sendEmployeeWelcomeEmail(
        email,
        `${firstName} ${lastName}`,
        loginId,
        randomPassword
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'User created successfully. Login credentials sent to email.',
      data: {
        user: {
          id: result.user.id,
          loginId: result.user.loginId,
          email: result.user.email,
          role: result.user.role,
        },
        employee: {
          id: result.employee.id,
          firstName: result.employee.firstName,
          lastName: result.employee.lastName,
          email: result.employee.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Users/Employees
 * GET /api/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const currentUser = req.user;
    
    // Build filter
    const where = {
      companyId: currentUser.companyId,
    };
    
    if (role) {
      where.role = role;
    }
    
    if (status) {
      where.isActive = status === 'active';
    }
    
    // Get users with employee data
    let users = await prisma.user.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => {
        const fullName = `${user.employee?.firstName} ${user.employee?.lastName}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.loginId.toLowerCase().includes(searchLower)
        );
      });
    }
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(user => ({
        id: user.id,
        loginId: user.loginId,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        deactivationReason: user.deactivationReason,
        deactivatedAt: user.deactivatedAt,
        employee: user.employee,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const user = await prisma.user.findFirst({
      where: {
        id,
        companyId: currentUser.companyId,
      },
      include: {
        employee: {
          include: {
            salaryStructure: {
              include: {
                components: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          loginId: user.loginId,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
        employee: user.employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Role
 * PUT /api/users/:id/role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUser = req.user;
    
    // Check if user exists in same company
    const user = await prisma.user.findFirst({
      where: {
        id,
        companyId: currentUser.companyId,
      },
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Update role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });
    
    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: updatedUser.id,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate/Activate User
 * PUT /api/users/:id/status
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, deactivationReason } = req.body;
    const currentUser = req.user;
    
    // Prevent self-deactivation
    if (id === currentUser.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    // Validate deactivation reason if deactivating
    if (!isActive && !deactivationReason) {
      return res.status(400).json({
        success: false,
        message: 'Deactivation reason is required',
      });
    }
    
    // Check if user exists in same company
    const user = await prisma.user.findFirst({
      where: {
        id,
        companyId: currentUser.companyId,
      },
      include: {
        employee: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Prepare update data
    const updateData = {
      isActive,
      deactivationReason: !isActive ? deactivationReason : null,
      deactivatedAt: !isActive ? new Date() : null,
    };
    
    // Update status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    
    // Send account locked email if deactivating
    if (!isActive && user.employee) {
      try {
        const userName = `${user.employee.firstName} ${user.employee.lastName}`;
        await sendAccountLockedEmail(
          user.email,
          userName,
          deactivationReason,
          new Date()
        );
      } catch (emailError) {
        console.error('Failed to send account locked email:', emailError);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: updatedUser.id,
        isActive: updatedUser.isActive,
        deactivationReason: updatedUser.deactivationReason,
        deactivatedAt: updatedUser.deactivatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete User
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    // Prevent self-deletion
    if (id === currentUser.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }
    
    // Check if user exists in same company
    const user = await prisma.user.findFirst({
      where: {
        id,
        companyId: currentUser.companyId,
      },
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Delete user (cascade will delete employee and related data)
    await prisma.user.delete({
      where: { id },
    });
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
