import { Request, Response } from 'express';
import User from '../models/User';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { generateToken } from '../middlewares/auth.middleware';
import { emailer } from '../services/emailService';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Public
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ role: 'admin' }).select('-password');
  
  if (!user) {
    throw new AppError('Profile not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private (Admin)
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, bio, skills, languages, interests, availability, location, socialLinks } = req.body;
  
  const user = await User.findOne({ role: 'admin' });
  
  if (!user) {
    throw new AppError('Profile not found', 404);
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      name: name || user.name,
      bio: bio || user.bio,
      skills: skills || user.skills,
      languages: languages || user.languages,
      interests: interests || user.interests,
      availability: availability || user.availability,
      location: location || user.location,
      socialLinks: socialLinks || user.socialLinks,
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: 'user'
  });

  // Generate token
  const token = generateToken({ userId: user._id });

  // Send welcome email
  try {
    await emailer.notifyUserForSignup(email, name);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken({ userId: user._id });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: (req as any).user
  });
});

// @desc    Update current user
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, bio, skills, languages, interests, availability, location, socialLinks } = req.body;
  
  const updatedUser = await User.findByIdAndUpdate(
    (req as any).user._id,
    {
      name: name || (req as any).user.name,
      bio: bio || (req as any).user.bio,
      skills: skills || (req as any).user.skills,
      languages: languages || (req as any).user.languages,
      interests: interests || (req as any).user.interests,
      availability: availability || (req as any).user.availability,
      location: location || (req as any).user.location,
      socialLinks: socialLinks || (req as any).user.socialLinks,
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById((req as any).user._id).select('+password');

  // Check current password
  const isCurrentPasswordValid = await user!.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user!.password = newPassword;
  await user!.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // In a real application, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});
