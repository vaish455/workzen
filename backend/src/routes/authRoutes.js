import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import {
  registerAdmin,
  login,
  getCurrentUser,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('loginId').trim().notEmpty().withMessage('Login ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Routes
router.post('/register-admin', registerValidation, validate, registerAdmin);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticate, getCurrentUser);
router.put('/change-password', authenticate, changePasswordValidation, validate, changePassword);

export default router;
