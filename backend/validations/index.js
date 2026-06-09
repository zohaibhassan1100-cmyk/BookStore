// validations/index.js
const { body, validationResult } = require('express-validator');

// Middleware to check results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const { fail } = require('../utils/response');
    return fail(res, errors.array()[0].msg, 422, errors.array());
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name: 2-100 chars'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password: min 6 characters'),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const bookRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('isbn').trim().notEmpty().withMessage('ISBN is required'),
  body('published_date').notEmpty().withMessage('Published date is required').isDate().withMessage('Use YYYY-MM-DD format'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be ≥ 0'),
];

const bookUpdateRules = [
  body('title').optional().trim().isLength({ max: 255 }),
  body('author').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('isbn').optional().trim(),
  body('published_date').optional().isDate(),
  body('stock').optional().isInt({ min: 0 }),
];

module.exports = { validate, registerRules, loginRules, bookRules, bookUpdateRules };
