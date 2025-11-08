import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @returns {string} - JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Generate random password
 * @param {number} length - Password length
 * @returns {string} - Random password
 */
export const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
};

/**
 * Generate Login ID
 * Format: [CompanyPrefix][FirstName2Letters][LastName2Letters][Year][SerialNumber]
 * Example: OIJODO20220001
 * @param {string} companyName - Company name
 * @param {string} firstName - Employee first name
 * @param {string} lastName - Employee last name
 * @param {number} year - Year of joining
 * @param {number} serialNumber - Serial number
 * @returns {string} - Login ID
 */
export const generateLoginId = (companyName, firstName, lastName, year, serialNumber) => {
  // Get first 2 letters of company name (uppercase)
  const companyPrefix = companyName.substring(0, 2).toUpperCase();
  
  // Get first 2 letters of first name and last name (uppercase)
  const firstNamePrefix = firstName.substring(0, 2).toUpperCase();
  const lastNamePrefix = lastName.substring(0, 2).toUpperCase();
  
  // Format serial number with leading zeros (4 digits)
  const formattedSerialNumber = serialNumber.toString().padStart(4, '0');
  
  return `${companyPrefix}${firstNamePrefix}${lastNamePrefix}${year}${formattedSerialNumber}`;
};
