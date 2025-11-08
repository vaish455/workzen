import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, canManagePayroll } from '../middleware/auth.js';
import {
  generatePayrun,
  getAllPayslips,
  getMyPayslips,
  getPayslipById,
  validatePayslip,
  cancelPayslip,
  generateIndividualPayslip,
  deletePayslip,
} from '../controllers/payrollController.js';

const router = express.Router();

// Validation rules
const payrunValidation = [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
];

const generatePayslipValidation = [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
];

// Routes
router.post('/payrun', authenticate, canManagePayroll, payrunValidation, validate, generatePayrun);
router.post('/payslips/generate', authenticate, canManagePayroll, generatePayslipValidation, validate, generateIndividualPayslip);
router.get('/payslips', authenticate, canManagePayroll, getAllPayslips);
router.get('/my-payslips', authenticate, getMyPayslips);
router.get('/payslips/:id', authenticate, getPayslipById);
router.put('/payslips/:id/validate', authenticate, canManagePayroll, validatePayslip);
router.put('/payslips/:id/cancel', authenticate, canManagePayroll, cancelPayslip);
router.delete('/payslips/:id', authenticate, canManagePayroll, deletePayslip);

export default router;
