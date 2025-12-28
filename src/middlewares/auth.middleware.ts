import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';


// Admin Authentication middleware
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    const admin = await Admin.findById(decoded.adminId).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired admin token'
      });
    }

    (req as any).admin = admin;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid admin token'
    });
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user && !(req as any).admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = (req as any).user?.role || (req as any).admin?.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Admin role authorization
export const authorizeAdmin = (...adminRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    if (!adminRoles.includes((req as any).admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient admin permissions'
      });
    }

    next();
  };
};


// Generate JWT token
export const generateToken = (payload: any, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: expiresIn as any });
};

// Generate refresh token
export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' });
};
