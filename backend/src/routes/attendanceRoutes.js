import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getEmployeeAttendance,
  getAllAttendance,
  getTodayAttendance,
  markAttendance,
} from '../controllers/attendanceController.js';

const router = express.Router();

// Validation rules
const markAttendanceValidation = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('status').isIn(['PRESENT', 'ABSENT', 'ON_LEAVE', 'HALF_DAY']).withMessage('Invalid status'),
];

// Routes
router.post('/check-in', authenticate, checkIn);
router.post('/check-out', authenticate, checkOut);
router.get('/my-attendance', authenticate, getMyAttendance);
router.get('/today', authenticate, getTodayAttendance);
router.get('/all', authenticate, authorize('ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER'), getAllAttendance);
router.get('/employee/:employeeId', authenticate, authorize('ADMIN', 'HR_OFFICER', 'PAYROLL_OFFICER'), getEmployeeAttendance);
router.post('/mark', authenticate, authorize('ADMIN', 'HR_OFFICER'), markAttendanceValidation, validate, markAttendance);

export default router;
