import express from 'express';
import { authenticate, isHROrAdmin, canManagePayroll } from '../middleware/auth.js';
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

// Dashboard routes
router.get('/stats', authenticate, getDashboardStats);
router.get('/employee', authenticate, getEmployeeDashboard);
router.get('/overview', authenticate, isHROrAdmin, getCompanyOverview);

// Analytics routes
router.get('/attendance-analytics', authenticate, isHROrAdmin, getAttendanceAnalytics);
router.get('/leave-analytics', authenticate, isHROrAdmin, getLeaveAnalytics);
router.get('/payroll-analytics', authenticate, canManagePayroll, getPayrollAnalytics);

// Reports routes
router.get('/salary-statement', authenticate, canManagePayroll, getSalaryStatement);

export default router;
