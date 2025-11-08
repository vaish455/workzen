import { verifyToken } from '../utils/auth.js';
import prisma from '../config/database.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        company: true,
        employee: true,
      },
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message,
    });
  }
};

/**
 * Authorization middleware
 * Checks if user has required role
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole: req.user.role,
      });
    }
    
    next();
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize('ADMIN');

/**
 * Check if user is HR Officer or Admin
 */
export const isHROrAdmin = authorize('ADMIN', 'HR_OFFICER');

/**
 * Check if user is Payroll Officer or Admin
 */
export const isPayrollOrAdmin = authorize('ADMIN', 'PAYROLL_OFFICER');

/**
 * Check if user can manage payroll (Admin or Payroll Officer)
 */
export const canManagePayroll = authorize('ADMIN', 'PAYROLL_OFFICER');

/**
 * Check if user can approve leaves (Admin, HR Officer, or Payroll Officer)
 */
export const canApproveLeaves = authorize('ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER');
