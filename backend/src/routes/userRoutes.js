import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['EMPLOYEE', 'HR_OFFICER', 'PAYROLL_OFFICER']).withMessage('Invalid role'),
];

const updateRoleValidation = [
  body('role').isIn(['EMPLOYEE', 'HR_OFFICER', 'PAYROLL_OFFICER', 'ADMIN']).withMessage('Invalid role'),
];

const toggleStatusValidation = [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('deactivationReason')
    .if(body('isActive').equals('false'))
    .trim()
    .notEmpty()
    .withMessage('Deactivation reason is required when deactivating a user')
    .isLength({ min: 5, max: 500 })
    .withMessage('Deactivation reason must be between 5 and 500 characters'),
];

// Routes (all require authentication and admin role)
router.post('/', authenticate, isAdmin, createUserValidation, validate, createUser);
router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id/role', authenticate, isAdmin, updateRoleValidation, validate, updateUserRole);
router.put('/:id/status', authenticate, isAdmin, toggleStatusValidation, validate, toggleUserStatus);
router.delete('/:id', authenticate, isAdmin, deleteUser);

export default router;
