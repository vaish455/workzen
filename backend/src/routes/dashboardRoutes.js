import express from 'express';
import { authenticate, isAdmin, canManagePayroll } from '../middleware/auth.js';
import {
  getDashboardStats,
  getEmployeeDashboard,
  getAttendanceAnalytics,
  getLeaveAnalytics,
  getPayrollAnalytics,
  getSalaryStatement,
  getCompanyOverview,
} from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard statistics
router.get('/stats', authenticate, getDashboardStats);
router.get('/employee', authenticate, getEmployeeDashboard);
router.get('/overview', authenticate, isAdmin, getCompanyOverview);

// Analytics routes
router.get('/attendance-analytics', authenticate, getAttendanceAnalytics);
router.get('/leave-analytics', authenticate, getLeaveAnalytics);
router.get('/payroll-analytics', authenticate, canManagePayroll, getPayrollAnalytics);

// Reports
router.get('/salary-statement', authenticate, canManagePayroll, getSalaryStatement);

export default router;
