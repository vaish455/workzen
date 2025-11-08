import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, isHROrAdmin, canApproveLeaves } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  cancelLeave,
  allocateLeave,
  getLeaveBalance,
} from '../controllers/leaveController.js';

const router = express.Router();

// Validation rules
const applyLeaveValidation = [
  body('leaveType').isIn(['PAID_TIME_OFF', 'SICK_LEAVE', 'UNPAID_LEAVE']).withMessage('Invalid leave type'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
];

const rejectLeaveValidation = [
  body('reason').optional().trim(),
];

const allocateLeaveValidation = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('leaveType').isIn(['PAID_TIME_OFF', 'SICK_LEAVE', 'UNPAID_LEAVE']).withMessage('Invalid leave type'),
  body('totalDays').isNumeric().withMessage('Total days must be a number'),
];

// Routes
router.post('/', authenticate, uploadSingle('certificate'), applyLeaveValidation, validate, applyLeave);
router.get('/my-leaves', authenticate, getMyLeaves);
router.get('/balance/:employeeId', authenticate, getLeaveBalance);
router.get('/', authenticate, canApproveLeaves, getAllLeaves);
router.get('/:id', authenticate, getLeaveById);
router.put('/:id/approve', authenticate, canApproveLeaves, approveLeave);
router.put('/:id/reject', authenticate, canApproveLeaves, rejectLeaveValidation, validate, rejectLeave);
router.put('/:id/cancel', authenticate, cancelLeave);
router.post('/allocate', authenticate, isHROrAdmin, allocateLeaveValidation, validate, allocateLeave);

export default router;
