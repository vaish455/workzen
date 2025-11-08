import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import {
  getCompany,
  updateCompany,
} from '../controllers/companyController.js';

const router = express.Router();

// Validation rules
const updateCompanyValidation = [
  body('name').optional().trim().notEmpty().withMessage('Company name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('website').optional().trim(),
];

// Routes
router.get('/', authenticate, getCompany);
router.put('/:id', authenticate, isAdmin, updateCompanyValidation, validate, updateCompany);

export default router;
