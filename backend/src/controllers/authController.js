import prisma from '../config/database.js';
import { hashPassword, comparePassword, generateToken, generateRandomPassword, generateLoginId } from '../utils/auth.js';
import { sendWelcomeEmail } from '../config/email.js';

/**
 * Admin Registration
 * POST /api/auth/register-admin
 */
export const registerAdmin = async (req, res, next) => {
  try {
    const { companyName, name, email, phone, password } = req.body;
    
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
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
    
    const currentYear = new Date().getFullYear();
    const serialNumber = 1; // First user in company
    
    // Generate login ID
    const loginId = generateLoginId(companyName, firstName, lastName, currentYear, serialNumber);
    
    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: email,
          phone: phone,
        },
      });
      
      // Create admin user
      const user = await tx.user.create({
        data: {
          loginId,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id,
        },
      });
      
      // Create employee profile for admin
      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          companyId: company.id,
          firstName,
          lastName,
          email,
          phone,
          dateOfJoining: new Date(),
          yearOfJoining: currentYear,
          serialNumber,
        },
      });
      
      return { user, company, employee };
    });
    
    // Generate token
    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });
    
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        user: {
          id: result.user.id,
          loginId: result.user.loginId,
          email: result.user.email,
          role: result.user.role,
        },
        company: {
          id: result.company.id,
          name: result.company.name,
        },
        employee: {
          id: result.employee.id,
          firstName: result.employee.firstName,
          lastName: result.employee.lastName,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User Login
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { loginId, password } = req.body;
    
    // Find user by loginId
    const user = await prisma.user.findUnique({
      where: { loginId },
      include: {
        company: true,
        employee: true,
      },
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials',
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact admin.',
      });
    }
    
    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials',
      });
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          loginId: user.loginId,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
        },
        company: {
          id: user.company.id,
          name: user.company.name,
          logo: user.company.logo,
        },
        employee: user.employee ? {
          id: user.employee.id,
          firstName: user.employee.firstName,
          lastName: user.employee.lastName,
          profilePicture: user.employee.profilePicture,
        } : null,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        company: true,
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
        company: user.company,
        employee: user.employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password
 * PUT /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    
    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
