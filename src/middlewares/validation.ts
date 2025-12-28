import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

// Custom validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Common validation rules
export const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  title: body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  description: body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  url: body('url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
  
  date: body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  mongoId: (field: string) => body(field)
    .isMongoId()
    .withMessage(`Please provide a valid ${field} ID`),
  
  arrayOfStrings: (field: string) => body(field)
    .isArray({ min: 1 })
    .withMessage(`${field} must be an array with at least one item`)
    .custom((value) => {
      if (!value.every((item: any) => typeof item === 'string')) {
        throw new Error(`${field} must contain only strings`);
      }
      return true;
    }),
};

// Specific validation chains
export const userValidations = {
  register: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    handleValidationErrors
  ],
  
  login: [
    commonValidations.email,
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ],
  
  updateProfile: [
    commonValidations.name.optional(),
    commonValidations.email.optional(),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    handleValidationErrors
  ]
};

export const projectValidations = {
  create: [
    commonValidations.title,
    commonValidations.description,
    commonValidations.arrayOfStrings('technologies'),
    commonValidations.arrayOfStrings('skills'),
    body('projectType').isIn(['main', 'mini']).withMessage('Project type must be either main or mini'),
    body('startDate').isISO8601().withMessage('Please provide a valid start date'),
    body('endDate').optional().isISO8601().withMessage('Please provide a valid end date'),
    handleValidationErrors
  ],
  
  update: [
    commonValidations.title.optional(),
    commonValidations.description.optional(),
    handleValidationErrors
  ]
};

export const blogValidations = {
  create: [
    commonValidations.title,
    body('content').isLength({ min: 100 }).withMessage('Content must be at least 100 characters'),
    body('excerpt').isLength({ min: 20, max: 200 }).withMessage('Excerpt must be between 20 and 200 characters'),
    body('category').notEmpty().withMessage('Category is required'),
    commonValidations.arrayOfStrings('tags'),
    handleValidationErrors
  ]
};

export const contactValidations = {
  create: [
    commonValidations.name,
    commonValidations.email,
    body('subject').trim().isLength({ min: 3, max: 100 }).withMessage('Subject must be between 3 and 100 characters'),
    body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
    body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number'),
    handleValidationErrors
  ]
};

export const experienceValidations = {
  create: [
    body('company').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
    body('position').trim().isLength({ min: 2, max: 100 }).withMessage('Position must be between 2 and 100 characters'),
    body('startDate').isISO8601().withMessage('Please provide a valid start date'),
    body('endDate').optional().isISO8601().withMessage('Please provide a valid end date'),
    commonValidations.description,
    commonValidations.arrayOfStrings('responsibilities'),
    commonValidations.arrayOfStrings('achievements'),
    commonValidations.arrayOfStrings('skills'),
    handleValidationErrors
  ]
};

export const educationValidations = {
  create: [
    body('institution').trim().isLength({ min: 2, max: 100 }).withMessage('Institution name must be between 2 and 100 characters'),
    body('degree').trim().isLength({ min: 2, max: 100 }).withMessage('Degree must be between 2 and 100 characters'),
    body('fieldOfStudy').trim().isLength({ min: 2, max: 100 }).withMessage('Field of study must be between 2 and 100 characters'),
    body('startDate').isISO8601().withMessage('Please provide a valid start date'),
    body('endDate').optional().isISO8601().withMessage('Please provide a valid end date'),
    body('gpa').optional().isFloat({ min: 0, max: 10 }).withMessage('GPA must be between 0 and 10'),
    handleValidationErrors
  ]
};

export const skillValidations = {
  create: [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Skill name must be between 2 and 50 characters'),
    body('category').isIn(['technical', 'soft', 'language', 'tool', 'framework']).withMessage('Invalid skill category'),
    body('level').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid skill level'),
    body('yearsOfExperience').optional().isInt({ min: 0, max: 50 }).withMessage('Years of experience must be between 0 and 50'),
    handleValidationErrors
  ]
};

export const certificationValidations = {
  create: [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Certification name must be between 2 and 100 characters'),
    body('issuer').trim().isLength({ min: 2, max: 100 }).withMessage('Issuer name must be between 2 and 100 characters'),
    body('issueDate').isISO8601().withMessage('Please provide a valid issue date'),
    body('expiryDate').optional().isISO8601().withMessage('Please provide a valid expiry date'),
    body('category').trim().isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
    body('level').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid certification level'),
    handleValidationErrors
  ]
};

export const testimonialValidations = {
  create: [
    body('clientName').trim().isLength({ min: 2, max: 50 }).withMessage('Client name must be between 2 and 50 characters'),
    body('clientPosition').trim().isLength({ min: 2, max: 100 }).withMessage('Client position must be between 2 and 100 characters'),
    body('clientCompany').trim().isLength({ min: 2, max: 100 }).withMessage('Client company must be between 2 and 100 characters'),
    body('content').trim().isLength({ min: 20, max: 500 }).withMessage('Testimonial content must be between 20 and 500 characters'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    handleValidationErrors
  ]
};
