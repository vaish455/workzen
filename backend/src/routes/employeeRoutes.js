import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, isHROrAdmin, isPayrollOrAdmin } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  uploadProfilePicture,
  updateSalaryStructure,
  getEmployeeSalary,
} from '../controllers/employeeController.js';

const router = express.Router();

// Validation rules
const updateEmployeeValidation = [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('maritalStatus').optional().isIn(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']).withMessage('Invalid marital status'),
  body('dateOfBirth').optional().custom((value) => {
    if (!value || value === '') return true; // Allow empty
    // Check if it's a valid date
    const date = new Date(value);
    return !isNaN(date.getTime());
  }).withMessage('Valid date is required'),
];

const salaryValidation = [
  body('wage').isNumeric().withMessage('Wage must be a number'),
  body('components').isArray().withMessage('Components must be an array'),
];

// Routes
router.get('/', authenticate, getAllEmployees); // All authenticated users can view directory
router.get('/:id', authenticate, getEmployeeById);
router.put('/:id', authenticate, updateEmployeeValidation, validate, updateEmployee);
router.put('/:id/profile-picture', authenticate, uploadSingle('profilePicture'), uploadProfilePicture);

// Salary routes (restricted to Admin and Payroll Officer)
router.get('/:id/salary', authenticate, getEmployeeSalary);
router.put('/:id/salary', authenticate, isPayrollOrAdmin, salaryValidation, validate, updateSalaryStructure);

export default router;
