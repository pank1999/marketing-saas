import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateSignup = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  handleValidationErrors,
];

export const validateLogin = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const validateProject = [
  body('name').notEmpty().withMessage('Project name is required'),
  body('description').optional(),
  handleValidationErrors,
];

export const validateCondition = [
  body('type')
    .isIn(['TIME_OF_DAY', 'WEATHER', 'TEMPERATURE'])
    .withMessage('Invalid condition type'),
  body('value').notEmpty().withMessage('Condition value is required'),
  body('variation').notEmpty().withMessage('Variation is required'),
  body('projectId').isInt().withMessage('Project ID must be an integer'),
  handleValidationErrors,
];

function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
