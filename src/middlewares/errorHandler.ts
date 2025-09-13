import { Request, Response, NextFunction } from 'express';
import { emailer } from '../services/emailService';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handling middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map((err: any) => err.message).join(', ');
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (error.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error for monitoring
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Send error notification for critical errors
  if (statusCode >= 500) {
    sendErrorNotification(error, req);
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && statusCode >= 500 
      ? 'Something went wrong!' 
      : message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Send error notification
const sendErrorNotification = async (error: any, req: Request) => {
  try {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    await emailer.sendEmail({
      from: process.env.SMTP_USERNAME,
      to: process.env.ADMIN_EMAIL,
      subject: 'Portfolio Backend Error Alert',
      html: `
        <h2>Error Alert</h2>
        <p><strong>Message:</strong> ${error.message}</p>
        <p><strong>URL:</strong> ${req.url}</p>
        <p><strong>Method:</strong> ${req.method}</p>
        <p><strong>IP:</strong> ${req.ip}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <pre>${error.stack}</pre>
      `
    });
  } catch (notificationError) {
    console.error('Failed to send error notification:', notificationError);
  }
};

// Validation error handler
export const handleValidationError = (error: any) => {
  const errors = Object.values(error.errors).map((err: any) => err.message);
  return new AppError(`Validation Error: ${errors.join(', ')}`, 400);
};

// Duplicate key error handler
export const handleDuplicateKeyError = (error: any) => {
  const field = Object.keys(error.keyValue)[0];
  return new AppError(`${field} already exists`, 400);
};

// Cast error handler
export const handleCastError = (error: any) => {
  return new AppError(`Invalid ${error.path}: ${error.value}`, 400);
};
